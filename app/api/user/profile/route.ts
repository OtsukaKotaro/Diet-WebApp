import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    startDate: user.startDate ? user.startDate.toISOString().slice(0, 10) : null,
    startWeightKg: user.startWeightKg,
    goalWeightKg: user.goalWeightKg,
    targetDate: user.targetDate ? user.targetDate.toISOString().slice(0, 10) : null,
  });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      startDate,
      startWeightKg,
      goalWeightKg,
      targetDate,
      name,
    }: {
      startDate?: string | null;
      startWeightKg?: number | null;
      goalWeightKg?: number | null;
      targetDate?: string | null;
      name?: string | null;
    } = body;

    const data: Record<string, unknown> = {};

    if (typeof name === "string" || name === null) {
      data.name = name;
    }

    if (startDate !== undefined) {
      if (startDate === null || startDate === "") {
        data.startDate = null;
      } else {
        const parsed = new Date(`${startDate}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "開始日の形式が正しくありません。" },
            { status: 400 },
          );
        }
        data.startDate = parsed;
      }
    }

    if (targetDate !== undefined) {
      if (targetDate === null || targetDate === "") {
        data.targetDate = null;
      } else {
        const parsed = new Date(`${targetDate}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "目標日の形式が正しくありません。" },
            { status: 400 },
          );
        }
        data.targetDate = parsed;
      }
    }

    if (startWeightKg !== undefined) {
      if (startWeightKg === null) {
        data.startWeightKg = null;
      } else if (typeof startWeightKg !== "number" || !Number.isFinite(startWeightKg) || startWeightKg <= 0) {
        return NextResponse.json(
          { error: "開始体重は正の数で入力してください。" },
          { status: 400 },
        );
      } else {
        data.startWeightKg = startWeightKg;
      }
    }

    if (goalWeightKg !== undefined) {
      if (goalWeightKg === null) {
        data.goalWeightKg = null;
      } else if (typeof goalWeightKg !== "number" || !Number.isFinite(goalWeightKg) || goalWeightKg <= 0) {
        return NextResponse.json(
          { error: "目標体重は正の数で入力してください。" },
          { status: 400 },
        );
      } else {
        data.goalWeightKg = goalWeightKg;
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      startDate: updated.startDate
        ? updated.startDate.toISOString().slice(0, 10)
        : null,
      startWeightKg: updated.startWeightKg,
      goalWeightKg: updated.goalWeightKg,
      targetDate: updated.targetDate
        ? updated.targetDate.toISOString().slice(0, 10)
        : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "プロフィール更新中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}

