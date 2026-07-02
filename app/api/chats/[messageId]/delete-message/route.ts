import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }, // Changed chatId to messageId
) {
  const { messageId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const body = await req.json();

  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${messageId}/delete-message/`;

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        delete_type: body.delete_type,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 },
    );
  }
}
