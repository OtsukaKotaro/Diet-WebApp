import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスは必須です。" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // ユーザーの存在有無に関わらず成功レスポンスを返す
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "パスワードリセットリクエストでエラーが発生しました。" },
      { status: 500 },
    );
  }
}

