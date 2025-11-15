"use client";

import { useState } from "react";
import {
  calculateTotalChange,
  calculateTotalDays,
  calculateIdealDailyChange,
  generatePlan,
} from "@/lib/plan-creation";

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
      setError("プラン間隔の日数は1以上にしてください。");
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

  const containerStyle: React.CSSProperties = {
    padding: "1rem",
    maxWidth: 480,
    margin: "0 auto",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "4px",
    fontSize: "0.875rem",
    fontWeight: 500,
  };

  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        ダイエットプラン作成
      </h1>

      <form
        style={{ display: "grid", gap: "1rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleCalculate();
        }}
      >
        <div>
          <label style={labelStyle}>開始日 (yyyy-mm-dd)</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>開始体重 (kg)</label>
          <input
            type="number"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            placeholder="例: 80"
          />
        </div>

        <div>
          <label style={labelStyle}>目標日 (yyyy-mm-dd)</label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>目標体重 (kg)</label>
          <input
            type="number"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            placeholder="例: 70"
          />
        </div>

        <div>
          <label style={labelStyle}>何日ごとのプランを作成するか</label>
          <input
            type="number"
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            placeholder="例: 3"
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            cursor: "pointer",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            marginTop: "0.5rem",
            justifySelf: "flex-start",
          }}
        >
          プランを作成
        </button>
      </form>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 8 }}>
          計算結果
        </h2>

        {error && (
          <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>
        )}

        {totalChange !== null &&
        totalDays !== null &&
        idealDailyChange !== null ? (
          <>
            <p>目標減量: {totalChange.toFixed(1)} kg</p>
            <p>減量期間: {totalDays} 日</p>
            <p>理想のペース: {idealDailyChange.toFixed(3)} kg/日</p>

            <h3 style={{ marginTop: "1rem", fontWeight: 600 }}>プラン</h3>
            {plan.length === 0 ? (
              <p>プランが生成されませんでした。</p>
            ) : (
              <table
                style={{
                  marginTop: "0.5rem",
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "0.25rem 0.5rem",
                        textAlign: "left",
                      }}
                    >
                      ステップ
                    </th>
                    <th
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "0.25rem 0.5rem",
                        textAlign: "right",
                      }}
                    >
                      経過日数(日)
                    </th>
                    <th
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "0.25rem 0.5rem",
                        textAlign: "right",
                      }}
                    >
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
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "0.25rem 0.5rem",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "0.25rem 0.5rem",
                            textAlign: "right",
                          }}
                        >
                          {dayNumber !== null ? dayNumber : "-"}
                        </td>
                        <td
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: "0.25rem 0.5rem",
                            textAlign: "right",
                          }}
                        >
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
            <p>必要な項目を入力し、「プランを作成」を押してください。</p>
          )
        )}
      </section>
    </main>
  );
}

