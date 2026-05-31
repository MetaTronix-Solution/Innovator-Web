import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("accessToken");

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized: Access token missing" },
        { status: 401 },
      );
    }

    const token = tokenCookie.value;
    const { searchParams } = new URL(request.url);
    const withUser = searchParams.get("with_user");

    let upstreamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/`;
    if (withUser) {
      upstreamUrl += `?with_user=${encodeURIComponent(withUser)}`;
    }

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed fetching message data from upstream server" },
        { status: response.status },
      );
    }

    const chatData = await response.json();

    if (withUser) {
      return NextResponse.json({ token, messages: chatData });
    }

    return NextResponse.json(chatData);
  } catch (error) {
    console.error("Proxy route handling exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("accessToken");

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized: Access token missing" },
        { status: 401 },
      );
    }

    const token = tokenCookie.value;
    const contentType = request.headers.get("content-type") || "";

    let upstreamResponse: Response;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      upstreamResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
    } else {
      const body = await request.json();

      upstreamResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
    }

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      console.error("Upstream POST error:", errorText);
      return NextResponse.json(
        { error: "Upstream server error", detail: errorText },
        { status: upstreamResponse.status },
      );
    }

    const data = await upstreamResponse.json();
    return NextResponse.json(data, { status: upstreamResponse.status });
  } catch (error) {
    console.error("POST proxy exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
