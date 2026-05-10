// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const cursor = searchParams.get("cursor") || "";
//     const limit = searchParams.get("limit") || "10";

//     const cookieStore = await cookies();
//     const token = cookieStore.get("accessToken")?.value;

//     if (!token)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const backendUrl = `${BASE_URL}/api/feed/?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`;

//     const response = await fetch(backendUrl, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       next: { revalidate: 0 },
//     });

//     if (!response.ok) throw new Error("Backend unavailable");

//     const data = await response.json();

//     return NextResponse.json(data);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// app/api/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || "";
    const limit = searchParams.get("limit") || "10";

    const backendUrl = `${BASE_URL}/api/feed/?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) throw new Error("Backend unavailable");

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
