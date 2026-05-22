// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ postId: string }> },
// ) {
//   try {
//     const { postId } = await params;
//     const cookieStore = await cookies();
//     const token = cookieStore.get("accessToken")?.value; // ← correct key

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const response = await fetch(
//       `${BACKEND_URL}/api/posts/${postId}/reactions-list/`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         cache: "no-store",
//       },
//     );

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => null);
//       return NextResponse.json(
//         { error: errorData ?? "Failed to fetch reactions" },
//         { status: response.status },
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error("[reactions-list] Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tryFetch = async (contentType: "posts" | "reels") =>
      fetch(`${BACKEND_URL}/api/${contentType}/${postId}/reactions-list/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

    let response = await tryFetch("posts");

    if (response.status === 404) {
      response = await tryFetch("reels");
    }

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      return NextResponse.json(
        { error: err ?? "Failed to fetch reactions" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[reactions-list] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
