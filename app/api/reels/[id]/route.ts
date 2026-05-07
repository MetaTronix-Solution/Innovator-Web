import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// GET: Fetch single reel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const response = await fetch(`${BACKEND_URL}/api/reels/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Reel not found" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT: Update reel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/reels/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to update reel" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH: Partial update (optional)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/reels/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to update reel" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE: Remove reel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const response = await fetch(`${BACKEND_URL}/api/reels/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete reel" },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { message: "Reel deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting reel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
