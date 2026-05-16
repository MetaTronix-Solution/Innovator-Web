// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST(request: NextRequest) {
//   try {
//     const { postId, type } = await request.json();

//     const cookieStore = await cookies();
//     const token = cookieStore.get("accessToken")?.value;

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const response = await fetch("http://36.253.137.34:8005/api/reactions/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         post: postId,
//         type: type || "like",
//       }),
//     });

//     const data = await response.json();
//     console.log(data);

//     if (!response.ok) {
//       console.error("External API Error:", data);
//       return NextResponse.json(data, { status: response.status });
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Reaction Route Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { postId, type, contentType } = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Backend expects "post" or "reel" as the key
    const contentKey = contentType === "reel" ? "reel" : "post";

    const response = await fetch("http://36.253.137.34:8005/api/reactions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        [contentKey]: postId,
        type: type || "like",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("External API Error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reaction Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
