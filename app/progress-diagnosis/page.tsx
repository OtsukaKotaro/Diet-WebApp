"use client";

import { useState } from "react";
import {
  calTotalChange,
  calCurrentChange,
  calProgress,
  calDaysElapsed,
  calRemainingDays,
  calRemainingChange,
  calIdealDailyChange,
  calRealDailyChange,
  calAchievementDate,
  calNeededDailyChange,
} from "@/lib/progress-diagnosis";
import styles from "./page.module.css";

type DiagnosisResult = {
  totalChange: number;
  currentChange: number;
  progress: number;
  daysElapsed: number;
  remainingDays: number;
  remainingChange: number;
  idealDailyChange: number;
  realDailyChange: number;
  achievementDate: string;
  neededDailyChange: number;
};

export default function ProgressDiagnosisPage() {
  const [startDate, setStartDate] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleDiagnosis = () => {
    setError(null);
    setResult(null);

    if (
      !startDate ||
      !startWeight ||
      !targetDate ||
      !goalWeight ||
      !currentWeight
    ) {
      setError("すべての項目を入力してください。");
      return;
    }

    try {
      const totalChange = calTotalChange(startWeight, goalWeight);
      const currentChange = calCurrentChange(startWeight, currentWeight);
      const progress = calProgress(currentChange, totalChange);
      const daysElapsed = calDaysElapsed(startDate);
      const remainingDays = calRemainingDays(targetDate);
      const remainingChange = calRemainingChange(goalWeight, currentWeight);
      const idealDailyChange = calIdealDailyChange(
        totalChange,
        targetDate,
        startDate
      );
      const realDailyChange = calRealDailyChange(currentChange, daysElapsed);
      const neededDailyChange = calNeededDailyChange(
        remainingChange,
        remainingDays
      );

      let achievementDate = "";
      if (realDailyChange > 0 && remainingChange > 0) {
        const achievementDateObj = calAchievementDate(
          remainingChange,
          realDailyChange
        );
        if (!Number.isNaN(achievementDateObj.getTime())) {
          achievementDate = achievementDateObj.toISOString().slice(0, 10);
        }
      }

      setResult({
        totalChange,
        currentChange,
        progress,
        daysElapsed,
        remainingDays,
        remainingChange,
        idealDailyChange,
        realDailyChange,
        achievementDate,
        neededDailyChange,
      });
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("診断中にエラーが発生しました。入力値を確認してください。");
      }
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ダイエット進捗診断</h1>
        <p className={styles.subtitle}>
          ダイエット開始日・現在体重・目標体重を入力して、進捗率やペースを診断します。
        </p>

        <div className={styles.form}>
          <div>
            <label className={styles.label} htmlFor="startDate">
              開始日 (yyyy-mm-dd)
            </label>
            <input
              id="startDate"
              type="date"
              className={styles.input}
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="startWeight">
              開始体重 (kg)
            </label>
            <input
              id="startWeight"
              type="number"
              className={styles.input}
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
              placeholder="例: 80"
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="targetDate">
              目標日 (yyyy-mm-dd)
            </label>
            <input
              id="targetDate"
              type="date"
              className={styles.input}
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="goalWeight">
              目標体重 (kg)
            </label>
            <input
              id="goalWeight"
              type="number"
              className={styles.input}
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="例: 70"
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="currentWeight">
              現在体重 (kg)
            </label>
            <input
              id="currentWeight"
              type="number"
              className={styles.input}
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="例: 75"
            />
          </div>

          <button
            type="button"
            className={styles.button}
            onClick={handleDiagnosis}
          >
            診断する
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {result && (
          <div className={styles.result}>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>目標減量</span>
              <span className={styles.resultValue}>
                {result.totalChange.toFixed(1)} kg
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>暫定減量</span>
              <span className={styles.resultValue}>
                {result.currentChange.toFixed(1)} kg
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>進捗率</span>
              <span className={styles.resultValue}>
                {result.progress.toFixed(1)} %
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>経過日数</span>
              <span className={styles.resultValue}>
                {result.daysElapsed.toFixed(1)} 日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>残り日数</span>
              <span className={styles.resultValue}>
                {result.remainingDays.toFixed(1)} 日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>残り減量</span>
              <span className={styles.resultValue}>
                {result.remainingChange.toFixed(1)} kg
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>理想のペース</span>
              <span className={styles.resultValue}>
                {result.idealDailyChange.toFixed(3)} kg/日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>現在のペース</span>
              <span className={styles.resultValue}>
                {result.realDailyChange.toFixed(3)} kg/日
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>達成予定日</span>
              <span className={styles.resultValue}>
                {result.achievementDate
                  ? `${result.achievementDate} 頃`
                  : "このままでは達成が難しいです"}
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>必要なペース</span>
              <span className={styles.resultValue}>
                {result.neededDailyChange.toFixed(3)} kg/日
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

