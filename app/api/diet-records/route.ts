import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Mood } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.dietRecord.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      weightKg: true,
      mood: true,
      note: true,
      photoUrl: true,
    },
  });

  return NextResponse.json({ records });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, weightKg, mood, note, photoData } = body as {
      date?: string;
      weightKg?: number;
      mood?: string;
      note?: string | null;
      photoData?: string | null;
    };

    if (!date || typeof date !== "string") {
      return NextResponse.json(
        { error: "日付が正しく指定されていません。" },
        { status: 400 },
      );
    }

    const weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight <= 0) {
      return NextResponse.json(
        { error: "体重(kg)には正の数を入力してください。" },
        { status: 400 },
      );
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "日付の形式が正しくありません。" },
        { status: 400 },
      );
    }

    if (!mood || typeof mood !== "string") {
      return NextResponse.json(
        { error: "その日の気分を選択してください。" },
        { status: 400 },
      );
    }

    const allowedMoods = Object.values(Mood);
    if (!allowedMoods.includes(mood as Mood)) {
      return NextResponse.json(
        { error: "気分の値が不正です。" },
        { status: 400 },
      );
    }

    const moodValue = mood as Mood;

    const record = await prisma.dietRecord.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: parsedDate,
        },
      },
      create: {
        userId: user.id,
        date: parsedDate,
        weightKg: weight,
        mood: moodValue,
        note: note ?? null,
        photoUrl: photoData ?? null,
      },
      update: {
        weightKg: weight,
        mood: moodValue,
        note: note ?? null,
        photoUrl: photoData ?? null,
      },
      select: {
        id: true,
        date: true,
        weightKg: true,
        mood: true,
        note: true,
        photoUrl: true,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "記録の保存中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}

