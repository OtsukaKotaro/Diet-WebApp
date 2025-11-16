import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { JWT_COOKIE_NAME, signAuthToken } from "@/lib/auth";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードは必須です。" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 400 },
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "メールアドレスが確認されていません。" },
        { status: 403 },
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 400 },
      );
    }

    const token = await signAuthToken(user.id);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: JWT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(Date.now() + THIRTY_DAYS),
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ログイン処理でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

