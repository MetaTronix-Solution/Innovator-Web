import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/posts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
