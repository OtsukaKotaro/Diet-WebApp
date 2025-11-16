import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "トークンとパスワードは必須です。" },
        { status: 400 },
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "トークンが無効です。" },
        { status: 400 },
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "トークンの有効期限が切れています。" },
        { status: 400 },
      );
    }

    if (record.usedAt) {
      return NextResponse.json(
        { error: "このトークンは既に使用されています。" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "パスワード再設定処理でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

