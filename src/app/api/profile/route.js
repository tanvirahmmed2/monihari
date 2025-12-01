import { ConnectDB } from "@/lib/mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";

export async function GET() {
  try {
    await ConnectDB();

    // 1. Get token from cookies
    const token = (await cookies()).get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please log in" },
        { status: 401 }
      );
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // 3. Fetch user (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched data",
        payload: user,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in GET /profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
