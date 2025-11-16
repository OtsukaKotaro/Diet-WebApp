import { NextResponse } from "next/server";
import { JWT_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: JWT_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  return response;
}

