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

    let upstreamUrl = "http://36.253.137.34:8005/api/chats/";
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
      return NextResponse.json({
        token: token,
        messages: chatData,
      });
    }

    // If fetching the multi-user summary list, return the raw array directly
    return NextResponse.json(chatData);
  } catch (error) {
    console.error("Proxy route handling exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
