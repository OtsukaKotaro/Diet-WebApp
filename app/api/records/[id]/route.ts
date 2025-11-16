import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Mood } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  const record = await prisma.dietRecord.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!record) {
    return NextResponse.json({ error: "記録が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ record });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const updateData: {
      weightKg?: number;
      mood?: Mood;
      note?: string | null;
      photoUrl?: string | null;
    } = {};

    if (data.weightKg !== undefined) {
      if (typeof data.weightKg !== "number") {
        return NextResponse.json(
          { error: "体重は数値で指定してください。" },
          { status: 400 },
        );
      }
      updateData.weightKg = data.weightKg;
    }

    if (data.mood !== undefined) {
      if (!Object.values(Mood).includes(data.mood)) {
        return NextResponse.json(
          { error: "気分の値が不正です。" },
          { status: 400 },
        );
      }
      updateData.mood = data.mood;
    }

    if (data.note !== undefined) {
      updateData.note = data.note;
    }

    if (data.photoUrl !== undefined) {
      updateData.photoUrl = data.photoUrl;
    }

    const record = await prisma.dietRecord.update({
      where: { id: params.id },
      data: updateData,
    });

    if (record.userId !== user.id) {
      return NextResponse.json(
        { error: "この記録を編集する権限がありません。" },
        { status: 403 },
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "記録の更新でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }

  try {
    const record = await prisma.dietRecord.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!record) {
      return NextResponse.json(
        { error: "記録が見つかりません。" },
        { status: 404 },
      );
    }

    await prisma.dietRecord.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "記録の削除でエラーが発生しました。" },
      { status: 500 },
    );
  }
}

