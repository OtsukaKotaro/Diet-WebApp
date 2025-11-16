import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "トークンがありません。" }, { status: 400 });
  }

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
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

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "メール確認処理でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

