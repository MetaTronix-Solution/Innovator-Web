import { NextRequest, NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_URL as string;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, username, phone_no, dob, gender } =
      body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    const backendPayload = {
      email,
      password,
      full_name,
      username: username || email.split("@")[0],
      phone_number: phone_no, // Match model standard string keys
      date_of_birth: dob || null,
      gender: gender || "male",
    };

    const response = await fetch(`${AUTH_API}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DEBUG: Backend rejected registration request:", errorData);

      let customError = "Registration failed";
      if (typeof errorData === "object") {
        const firstKey = Object.keys(errorData)[0];
        const prospectiveError = errorData[firstKey];
        customError = Array.isArray(prospectiveError)
          ? prospectiveError[0]
          : errorData.message || errorData.detail || JSON.stringify(errorData);
      }

      return NextResponse.json({ error: customError }, { status: 400 });
    }

    const data = await response.json();
    console.log("Registration API Success Log:", data);

    return NextResponse.json({
      success: true,
      message: data.message || "Registration successful",
      user: data.user,
    });
  } catch (error) {
    console.error("Registration error route handler wrapper:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
