import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("--- PROXY RECEIVED:", body);

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const fullUrl = `${process.env.NEXT_PUBLIC_ELEARNING_URL}/api/student/enrollments/`;
    console.log("--- ATTEMPTING TO FETCH:", fullUrl);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ELEARNING_URL}/api/student/enrollments/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    const text = await response.text();
    console.log("--- BACKEND RESPONSE STATUS:", response.status);
    console.log("--- BACKEND RAW RESPONSE:", text);

    if (!response.ok) {
      return new NextResponse(text, { status: response.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("--- PROXY ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ELEARNING_URL}/api/student/enrollments/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch enrollments" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Enrollment Sync Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
