"use client";

import { useEffect, useState } from "react";
import {
  calculateTotalChange,
  calculateTotalDays,
  calculateIdealDailyChange,
  generatePlan,
  type PlanStep,
} from "@/lib/plan-creation";
import styles from "./page.module.css";

export default function PlanCreationPage() {
  const [startDate, setStartDate] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [intervalDays, setIntervalDays] = useState("");

  const [totalChange, setTotalChange] = useState<number | null>(null);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [idealDailyChange, setIdealDailyChange] = useState<number | null>(null);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileDefaults() {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();

        if (!startDate && data.startDate) {
          setStartDate(data.startDate);
        }
        if (!startWeight && typeof data.startWeightKg === "number") {
          setStartWeight(String(data.startWeightKg));
        }
        if (!goalWeight && typeof data.goalWeightKg === "number") {
          setGoalWeight(String(data.goalWeightKg));
        }
        if (!targetDate && data.targetDate) {
          setTargetDate(data.targetDate);
        }
      } catch {
        // プロフィール取得に失敗しても黙ってスキップ
      }
    }

    void loadProfileDefaults();
    // 初期マウント時だけ試みる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ダイエットプラン作成</h1>
        <p className={styles.subtitle}>
          目標日と目標体重から、無理のない減量ペースとステップを計算します。
        </p>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
        >
          <div>
            <label className={styles.label}>開始日 (yyyy-mm-dd)</label>
            <input
              className={styles.input}
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className={styles.label}>開始体重 (kg)</label>
            <input
              className={styles.input}
              type="number"
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
              placeholder="例: 80"
            />
          </div>

          <div>
            <label className={styles.label}>目標日 (yyyy-mm-dd)</label>
            <input
              className={styles.input}
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div>
            <label className={styles.label}>目標体重 (kg)</label>
            <input
              className={styles.input}
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="例: 70"
            />
          </div>

          <div>
            <label className={styles.label}>何日ごとのプランを作成するか</label>
            <input
              className={styles.input}
              type="number"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
              placeholder="例: 3"
            />
          </div>

          <button type="submit" className={styles.button}>
            プランを作成
          </button>
        </form>

        <section className={styles.resultSection}>
          <h2 className={styles.resultTitle}>計算結果</h2>

          {error && <p className={styles.error}>{error}</p>}

          {totalChange !== null &&
          totalDays !== null &&
          idealDailyChange !== null ? (
            <>
              <p className={styles.resultText}>
                目標減量: {totalChange.toFixed(1)} kg
              </p>
              <p className={styles.resultText}>
                減量期間: {totalDays} 日
              </p>
              <p className={styles.resultText}>
                理想のペース: {idealDailyChange.toFixed(3)} kg/日
              </p>

              <div className={styles.tableWrapper}>
                <h3 className={styles.resultTitle}>プラン</h3>
                {plan.length === 0 ? (
                  <p className={styles.resultText}>
                    プランが生成されませんでした。
                  </p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>ステップ</th>
                        <th className={`${styles.th} ${styles.tdRight}`}>
                          経過日数(日)
                        </th>
                        <th className={`${styles.th} ${styles.tdRight}`}>
                          目標体重(kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.map((step, index) => {
                        const dayNumber = step.day;
                        const weight = step.weight;
                        return (
                          <tr key={index}>
                            <td className={styles.td}>{index + 1}</td>
                            <td
                              className={`${styles.td} ${styles.tdRight}`}
                            >
                              {dayNumber}
                            </td>
                            <td
                              className={`${styles.td} ${styles.tdRight}`}
                            >
                              {weight.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            !error && (
              <p className={styles.resultText}>
                必要な項目を入力し、「プランを作成」を押してください。
              </p>
            )
          )}
        </section>
      </div>
    </main>
  );
}
