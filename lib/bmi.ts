export function calculateBMI(heightMeter: number | string, weightKg: number |
  string): number {
    const h = Number(heightMeter);
    const w = Number(weightKg);

    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
      throw new Error("身長と体重には正の数を入力してください。");
    }

    const bmi = w / (h * h);
    if (!Number.isFinite(bmi)) {
      throw new Error("BMIの計算に失敗しました。入力値を確認してください。");
    }

    return Math.round(bmi * 10) / 10; // 小数第1位に丸め
  }

  export function judgeBMI(bmi: number): string {
    if (!Number.isFinite(bmi) || bmi <= 0) {
      throw new Error("有効なBMIを指定してください。");
    }

    if (bmi < 18.5) return "低体重（痩せ型）";
    if (bmi < 25) return "普通体重";
    if (bmi < 30) return "肥満（1度）";
    if (bmi < 35) return "肥満（2度）";
    if (bmi < 40) return "肥満（3度）";
    return "肥満（4度）";
  }
