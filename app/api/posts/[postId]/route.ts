import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function parseBackendResponse(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  let data = {};

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    return {
      error: true,
      status: response.status,
      details: data || "An error occurred with the backend service.",
    };
  }

  return { error: false, status: response.status, data };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postId } = await params;

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await parseBackendResponse(response);

    if (result?.error) {
      return NextResponse.json(result.details, { status: result.status });
    }

    return NextResponse.json(result?.data, { status: 200 });
  } catch (error) {
    console.error(`[PATCH_POST_ERROR]:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postId } = await params;

    const response = await fetch(`${BACKEND_URL}/api/posts/${postId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await parseBackendResponse(response);

    if (result?.error) {
      return NextResponse.json(result.details, { status: result.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE_POST_ERROR]:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
