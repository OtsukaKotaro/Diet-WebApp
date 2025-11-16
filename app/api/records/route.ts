import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Mood } from "@prisma/client";

function toDateOnly(dateStr: string): Date {
  // "YYYY-MM-DD" を UTC の 00:00:00 として扱う
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const records = await prisma.dietRecord.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ records });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const { date, weightKg, mood, note, photoUrl } = await request.json();

    if (!date || typeof date !== "string") {
      return NextResponse.json(
        { error: "日付は必須です。" },
        { status: 400 },
      );
    }

    if (typeof weightKg !== "number") {
      return NextResponse.json(
        { error: "体重は数値で指定してください。" },
        { status: 400 },
      );
    }

    if (!mood || !Object.values(Mood).includes(mood)) {
      return NextResponse.json(
        { error: "気分の値が不正です。" },
        { status: 400 },
      );
    }

    const dateValue = toDateOnly(date);

    const record = await prisma.dietRecord.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dateValue,
        },
      },
      update: {
        weightKg,
        mood,
        note,
        photoUrl,
      },
      create: {
        userId: user.id,
        date: dateValue,
        weightKg,
        mood,
        note,
        photoUrl,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "記録の保存でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

