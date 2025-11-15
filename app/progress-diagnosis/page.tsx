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
import Link from "next/link";

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
          achievementDate = achievementDateObj.toISOString().slice(0, 10); // yyyy-mm-dd
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

  const containerStyle: React.CSSProperties = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 16px",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    marginTop: "8px",
  };

  const errorStyle: React.CSSProperties = {
    color: "red",
    marginTop: "16px",
  };

  const resultStyle: React.CSSProperties = {
    marginTop: "24px",
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fafafa",
  };

  return (
    <div style={containerStyle}>
      <h1 style = {{ fontSize: "2rem" }}>ダイエット進捗診断</h1>

      <div>
        <label style={labelStyle} htmlFor="startDate">
          開始日 (yyyy-mm-dd)
        </label>
        <input
          id="startDate"
          type="date"
          style={inputStyle}
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label style={labelStyle} htmlFor="startWeight">
          開始体重 (kg)
        </label>
        <input
          id="startWeight"
          type="number"
          style={inputStyle}
          value={startWeight}
          onChange={(e) => setStartWeight(e.target.value)}
        />

        <label style={labelStyle} htmlFor="targetDate">
          目標日 (yyyy-mm-dd)
        </label>
        <input
          id="targetDate"
          type="date"
          style={inputStyle}
          required
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <label style={labelStyle} htmlFor="goalWeight">
          目標体重 (kg)
        </label>
        <input
          id="goalWeight"
          type="number"
          style={inputStyle}
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
        />

        <label style={labelStyle} htmlFor="currentWeight">
          現在体重 (kg)
        </label>
        <input
          id="currentWeight"
          type="number"
          style={inputStyle}
          value={currentWeight}
          onChange={(e) => setCurrentWeight(e.target.value)}
        />

        <button type="button" style={buttonStyle} onClick={handleDiagnosis}>
          診断する
        </button>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {result && (
        <div style={resultStyle}>
          <div>目標減量: {result.totalChange.toFixed(1)} kg</div>
          <div>暫定減量: {result.currentChange.toFixed(1)} kg</div>
          <div>進捗率: {result.progress.toFixed(1)} %</div>
          <div>経過日数: {result.daysElapsed.toFixed(1)} 日</div>
          <div>残り日数: {result.remainingDays.toFixed(1)} 日</div>
          <div>残り減量: {result.remainingChange.toFixed(1)} kg</div>
          <div>
            理想のペース: 1日あたり {result.idealDailyChange.toFixed(3)} kg
          </div>
          <div>
            現在のペース: 1日あたり {result.realDailyChange.toFixed(3)} kg
          </div>
          <div>
            達成予定日:{" "}
            {result.achievementDate
              ? `${result.achievementDate} 日`
              : "このままでは達成できません"}
          </div>
          <div>
            目標達成に必要なペース: 1日あたり{" "}
            {result.neededDailyChange.toFixed(3)} kg
          </div>
        </div>
      )}

      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          color: "blue",
        }}
      >
        ←トップページへ
      </Link>
    </div>
  );
}
