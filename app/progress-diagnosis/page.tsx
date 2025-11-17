"use client";

import { useEffect, useState } from "react";
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

type PaceTone = "good" | "fast" | "slow" | "warning";

type PaceEvaluation = {
  headline: string;
  detail: string;
  tone: PaceTone;
};

function getPaceEvaluation(
  result: DiagnosisResult,
  targetDate: string,
): PaceEvaluation {
  const { totalChange, currentChange, achievementDate } = result;

  if (!targetDate) {
    return {
      headline: "ペースはまだ評価できません",
      detail: "目標日が設定されていないため、ペースの評価ができません。",
      tone: "warning",
    };
  }

  if (totalChange === 0) {
    return {
      headline: "ペースは評価できません",
      detail: "開始体重と目標体重が同じのため、ペースの評価ができません。",
      tone: "warning",
    };
  }

  // 目標と反対方向（増やしたいのに減っている / 減らしたいのに増えている）
  if (totalChange * currentChange <= 0) {
    return {
      headline: "ちょっと逆方向かも…",
      detail:
        "目標とは反対方向に進んでいるようです。まずは今の生活リズムを少し見直してみましょう。",
      tone: "warning",
    };
  }

  if (!achievementDate) {
    return {
      headline: "今のままだと少し厳しそう",
      detail:
        "このままのペースでは目標日までの達成が難しそうです。食事や活動量を無理のない範囲で見直してみましょう。",
      tone: "slow",
    };
  }

  const target = new Date(`${targetDate}T00:00:00`);
  const achieve = new Date(`${achievementDate}T00:00:00`);

  if (Number.isNaN(target.getTime()) || Number.isNaN(achieve.getTime())) {
    return {
      headline: "ペースを計算できませんでした",
      detail: "日付の情報が正しくないため、ペースの計算ができませんでした。",
      tone: "warning",
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = (achieve.getTime() - target.getTime()) / msPerDay;

  // ±1日以内なら「ほぼ予定どおり」
  if (Math.abs(diffDays) <= 1) {
    return {
      headline: "いいペース！その調子です！",
      detail:
        "ほぼ予定どおりのペースで進んでいます。この調子で無理なく続けていきましょう。",
      tone: "good",
    };
  }

  // 達成予定日が目標日より早い = 予定より速い
  if (diffDays < -1) {
    return {
      headline: "すごいペース！無理しすぎ注意！",
      detail:
        "予定より速いペースで進んでいます。とても頑張れていますが、体調に気をつけて無理のない範囲で続けましょう。",
      tone: "fast",
    };
  }

  // 達成予定日が目標日より遅い = 予定よりゆっくり
  return {
    headline: "ちょっとゆっくりペースかも…",
    detail:
      "予定より少しゆっくりしたペースです。焦らなくて大丈夫なので、できる範囲で食事や活動量を見直してみましょう。",
    tone: "slow",
  };
}

export default function ProgressDiagnosisPage() {
  const [startDate, setStartDate] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [paceEvaluation, setPaceEvaluation] = useState<PaceEvaluation | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);

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

  const handleDiagnosis = () => {
    setError(null);
    setResult(null);
    setPaceEvaluation(null);
    setShowDetails(false);

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
        startDate,
      );
      const realDailyChange = calRealDailyChange(currentChange, daysElapsed);
      const neededDailyChange = calNeededDailyChange(
        remainingChange,
        remainingDays,
      );

      let achievementDate = "";
      const canEstimateAchievement =
        realDailyChange !== 0 && remainingChange / realDailyChange > 0;

      if (canEstimateAchievement) {
        const achievementDateObj = calAchievementDate(
          remainingChange,
          realDailyChange,
        );
        if (!Number.isNaN(achievementDateObj.getTime())) {
          achievementDate = achievementDateObj.toISOString().slice(0, 10);
        }
      }

      const computedResult: DiagnosisResult = {
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
      };

      setResult(computedResult);
      setPaceEvaluation(getPaceEvaluation(computedResult, targetDate));
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("診断中にエラーが発生しました。");
      }
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ダイエット進捗診断</h1>
        <p className={styles.subtitle}>
          ダイエット開始日・現在体重・目標体重を入力して、進捗率とペースを診断します。
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

        <section className={styles.resultSection}>
          <h2 className={styles.resultTitle}>診断結果</h2>

          {error && <div className={styles.error}>{error}</div>}

          {!error && !result && (
            <p className={styles.resultText}>
              必要な項目を入力し、「診断する」を押してください。
            </p>
          )}

          {result && paceEvaluation && (
            <div className={styles.result}>
              <div className={styles.paceBox}>
                <p
                  className={`${styles.paceHeadline} ${
                    paceEvaluation.tone === "good"
                      ? styles.paceHeadlineGood
                      : paceEvaluation.tone === "fast"
                        ? styles.paceHeadlineFast
                        : paceEvaluation.tone === "slow"
                          ? styles.paceHeadlineSlow
                          : styles.paceHeadlineWarning
                  }`}
                >
                  {paceEvaluation.headline}
                </p>
                <p className={styles.paceDetail}>{paceEvaluation.detail}</p>
              </div>

              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowDetails((prev) => !prev)}
              >
                {showDetails ? "詳細を隠す" : "詳細を表示"}
              </button>

              {showDetails && (
                <>
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
                    <span className={styles.resultKey}>達成予定日</span>
                    <span className={styles.resultValue}>
                      {result.achievementDate
                        ? `${result.achievementDate} 頃`
                        : "このままのペースでは達成が難しいです"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
