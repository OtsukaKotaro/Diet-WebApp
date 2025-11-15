 "use client";

  import { useState } from "react";
  import {
    calculateTotalChange,
    calculateTotalDays,
    calculateIdealDailyChange,
    generatePlan,
  } from "@/lib/plan-creation";
  import Link from "next/link";

  export default function Page() {
    const [startDate, setStartDate] = useState("");
    const [startWeight, setStartWeight] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [goalWeight, setGoalWeight] = useState("");
    const [intervalDays, setIntervalDays] = useState("");

    const [totalChange, setTotalChange] = useState<number | null>(null);
    const [totalDays, setTotalDays] = useState<number | null>(null);
    const [idealDailyChange, setIdealDailyChange] = useState<number | null>(null);
    const [plan, setPlan] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = () => {
      setError(null);

      if (
        !startDate ||
        !targetDate ||
        !startWeight ||
        !goalWeight ||
        !intervalDays
      ) {
        setError("すべての項目を入力してください。");
        setTotalChange(null);
        setTotalDays(null);
        setIdealDailyChange(null);
        setPlan([]);
        return;
      }

      const startWeightNum = Number(startWeight);
      const goalWeightNum = Number(goalWeight);
      const intervalDaysNum = Number(intervalDays);

      if (
        Number.isNaN(startWeightNum) ||
        Number.isNaN(goalWeightNum) ||
        Number.isNaN(intervalDaysNum)
      ) {
        setError("数値項目には数字を入力してください。");
        setTotalChange(null);
        setTotalDays(null);
        setIdealDailyChange(null);
        setPlan([]);
        return;
      }

      if (intervalDaysNum <= 0) {
        setError("プラン間隔（日数）は1以上にしてください。");
        return;
      }

      const totalDaysVal = calculateTotalDays(startDate, targetDate);
      if (totalDaysVal <= 0) {
        setError("目標日は開始日より後の日付にしてください。");
        setTotalChange(null);
        setTotalDays(null);
        setIdealDailyChange(null);
        setPlan([]);
        return;
      }

      const totalChangeVal = calculateTotalChange(startWeightNum, goalWeightNum);
      const idealDailyChangeVal = calculateIdealDailyChange(
        totalChangeVal,
        totalDaysVal
      );
      const planArr = generatePlan(
        startDate,
        startWeightNum,
        targetDate,
        goalWeightNum,
        intervalDaysNum
      );

      setTotalChange(totalChangeVal);
      setTotalDays(totalDaysVal);
      setIdealDailyChange(idealDailyChangeVal);
      setPlan(planArr);
    };

    return (
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">ダイエットプラン作成</h1>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              開始日 (yyyy-mm-dd)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              開始体重 (kg)
            </label>
            <input
              type="number"
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              目標日 (yyyy-mm-dd)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              目標体重 (kg)
            </label>
            <input
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              何日ごとのプランを作成するか
            </label>
            <input
              type="number"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            プランを作成
          </button>
        </form>

        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">計算結果</h2>

          {error && <p className="text-red-600 mb-2">{error}</p>}

          {totalChange !== null &&
          totalDays !== null &&
          idealDailyChange !== null ? (
            <>
              <p>目標減量: {totalChange.toFixed(1)} kg</p>
              <p>減量期間: {totalDays} 日</p>
              <p>理想ペース: {idealDailyChange.toFixed(3)} kg/日</p>

              <h3 className="mt-4 font-semibold">プラン</h3>
              {plan.length === 0 ? (
                <p>プランが生成されませんでした。</p>
              ) : (
                <table className="mt-2 border-collapse w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 text-left">ステップ</th>
                      <th className="border px-2 py-1 text-right">
                        経過日数(日)
                      </th>
                      <th className="border px-2 py-1 text-right">
                        目標体重(kg)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.map((weight, index) => {
                      const intervalNum = Number(intervalDays) || 0;
                      const dayNumber =
                        intervalNum > 0 ? intervalNum * (index + 1) : null;
                      return (
                        <tr key={index}>
                          <td className="border px-2 py-1">
                            {index + 1}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {dayNumber !== null ? dayNumber : "-"}
                          </td>
                          <td className="border px-2 py-1 text-right">
                            {weight.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            !error && (
              <p>必要事項を入力し、「プランを作成」を押してください。</p>
            )
          )}
        </section>
        <Link href = "/" style = {{ display: "inline-block", marginTop: "1rem", color: "blue" }}>
            ← トップページへ
        </Link>
      </main>   
    );
  }
