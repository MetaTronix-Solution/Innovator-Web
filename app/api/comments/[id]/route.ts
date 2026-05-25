import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      },
    );

    return NextResponse.json(await response.json(), {
      status: response.status,
    });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments/${id}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(
      { success: response.ok },
      { status: response.status },
    );
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
