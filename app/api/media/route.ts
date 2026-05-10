// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const url = request.nextUrl.searchParams.get("url");

//   if (!url) {
//     return new NextResponse("Missing url parameter", { status: 400 });
//   }

//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       return new NextResponse("Failed to fetch media", { status: 502 });
//     }

//     const contentType = response.headers.get("content-type") || "image/jpeg";
//     const buffer = await response.arrayBuffer();

//     return new NextResponse(buffer, {
//       headers: {
//         "Content-Type": contentType,
//         "Cache-Control": "public, max-age=86400", // cache for 1 day
//       },
//     });
//   } catch (error) {
//     return new NextResponse("Error fetching media", { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  try {
    const range = request.headers.get("range");

    const upstream = await fetch(url, {
      headers: {
        ...(range ? { Range: range } : {}), // ✅ forward range requests for video seeking
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse("Failed to fetch media", { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");

    return new NextResponse(upstream.body, {
      // ✅ stream directly, no buffering
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        ...(contentLength ? { "Content-Length": contentLength } : {}),
        ...(contentRange ? { "Content-Range": contentRange } : {}),
        "Accept-Ranges": "bytes", // ✅ tells browser seeking is supported
      },
    });
  } catch (error) {
    return new NextResponse("Error fetching media", { status: 500 });
  }
}
