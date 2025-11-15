const Ms_per_Day = 1000 * 60 * 60 * 24;

export function calTotalChange(startWeight: number | string, goalWeight: number | string): number {
    const sWeight = Number(startWeight);
    const gWeight = Number(goalWeight);

    if (!Number.isFinite(sWeight) || !Number.isFinite(gWeight) || sWeight <= 0 || gWeight <= 0) {
      throw new Error("体重には正の数を入力してください。");
    } else if(sWeight == gWeight) {
        throw new Error("開始体重と目標体重は違う値にする必要があります");
    }

    const totalChange: number = gWeight - sWeight;
    if (!Number.isFinite(totalChange)) {
      throw new Error("体重の計算に失敗しました。入力値を確認してください。");
    }

    return totalChange;
  }

  export function calCurrentChange(startWeight: number | string, currentWeight: number | string): number {
    const sWeight = Number(startWeight);
    const cWeight = Number(currentWeight);

    const currentChange: number = cWeight - sWeight;

    return currentChange;
  }

  export function calProgress( currentChange: number, totalChange: number ): number {
    const progress: number = ( Math.round(( currentChange / totalChange ) * 1000 )) / 10;

    return progress;
  }

  export function calDaysElapsed( startDate: string ): number {
    // 開始日と今日の「日付」だけを比較する（タイムゾーンの影響を避ける）
    const startLocal = new Date(`${startDate}T00:00:00`);
    const now = new Date();
    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const daysElapsed = Math.floor(
      (todayLocal.getTime() - startLocal.getTime()) / Ms_per_Day
    );

    return daysElapsed;
  }

  export function calRemainingDays( targetDate: string ): number {
    const targetLocal = new Date(`${targetDate}T00:00:00`);
    const now = new Date();
    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const remainingDays = Math.ceil(
      (targetLocal.getTime() - todayLocal.getTime()) / Ms_per_Day
    );

    return remainingDays;
  }

  export function calRemainingChange( goalWeight: number | string, currentWeight: number | string ): number {
    const gWeight = Number( goalWeight );
    const cWeight = Number( currentWeight );

    const remainingChange = gWeight - cWeight;

    return remainingChange;
  }

  export function calIdealDailyChange( totalChange: number, targetDate: string, startDate: string ): number {
    const tDateTime = new Date(targetDate).getTime();
    const sDateTime = new Date(startDate).getTime();

    if (!Number.isFinite(tDateTime) || !Number.isFinite(sDateTime)) {
      throw new Error("日付の形式が正しくありません。開始日と目標日を確認してください。");
    }

    if (tDateTime <= sDateTime) {
      throw new Error("目標日は開始日より後の日付を設定してください。");
    }

    const idealDailyChange = totalChange / (( tDateTime - sDateTime ) / Ms_per_Day);

    return idealDailyChange;
  }

  export function calRealDailyChange( currentChange: number, daysElapsed: number ): number {
    if (daysElapsed <= 0) {
      return 0;
    }

    const realDailyChange = currentChange / daysElapsed;

    return realDailyChange;
  }

  export function calAchievementDate( remainingChange: number,  realDailyChange: number ): Date {
    const todayTime = Date.now();

    const achievementMs = todayTime + ( Math.ceil( remainingChange / realDailyChange ) * Ms_per_Day);

    return new Date(achievementMs);
  }

  export function calNeededDailyChange( remainingChange: number, remainingDays: number ): number {
    const neededDailyChange = remainingChange / remainingDays;

    return neededDailyChange;
  }
