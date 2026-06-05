// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// const BACKEND_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

// export async function POST(req: NextRequest) {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("accessToken")?.value;

//     if (!token) {
//       return NextResponse.json(
//         { error: "Unauthorized: Access token missing from request headers" },
//         { status: 401 },
//       );
//     }

//     const { notification_id } = await req.json();

//     const response = await fetch(
//       `${BACKEND_URL}/api/notifications/${notification_id}/mark-read/`,
//       {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );

//     if (!response.ok) {
//       const errorBody = await response.text();
//       console.error(
//         "Django backend mark-as-read error response:",
//         response.status,
//         errorBody,
//       );
//       return NextResponse.json(
//         { error: "Backend service failed to respond correctly" },
//         { status: response.status },
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json(data, { status: 200 });
//   } catch (error: any) {
//     console.error("Serverless route gateway exception caught:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Serverless Gateway Error" },
//       { status: 500 },
//     );
//   }
// }

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL;

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Access token missing" },
        { status: 401 },
      );
    }

    const { notification_id } = await req.json();

    if (!notification_id) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/notifications/${notification_id}/mark-read/`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Django backend error:", response.status, errorBody);
      return NextResponse.json(
        { error: "Backend failed to process request" },
        { status: response.status },
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : { success: true };

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal Serverless Gateway Error" },
      { status: 500 },
    );
  }
}
