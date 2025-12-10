import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { ConnectDB } from "@/lib/mongoose";
import User from "@/models/user";

export async function isAdmin() {
  await ConnectDB();

  const token = (await cookies()).get("user_token")?.value;
  if (!token) return { success: false, message: "Token not found" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return { success: false, message: "User not found" };
    if (user.role !== "admin") return { success: false, message: "User is not admin" };

    return { success: true, user };

  } catch (err) {
    return { success: false, message: err.message };
  }
}
