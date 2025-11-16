"use client";

import { useState } from "react";
import { calculateBMI, judgeBMI } from "@/lib/bmi";
import styles from "./page.module.css";

export default function BmiPage() {
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBmi(null);
    setCategory("");

    if (heightCm.trim() === "" || weightKg.trim() === "") {
      setError("身長(cm)と体重(kg)を入力してください。");
      return;
    }

    const hCm = Number(heightCm);
    const wKg = Number(weightKg);

    if (!Number.isFinite(hCm) || !Number.isFinite(wKg) || hCm <= 0 || wKg <= 0) {
      setError("身長(cm)と体重(kg)には正の数を入力してください。");
      return;
    }

    const heightMeter = hCm / 100;

    try {
      const bmiValue = calculateBMI(heightMeter, wKg);
      const bmiCategory = judgeBMI(bmiValue);
      setBmi(bmiValue);
      setCategory(bmiCategory);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "計算中にエラーが発生しました。";
      setError(message);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>BMI計算ツール</h1>
        <p className={styles.subtitle}>
          身長と体重を入力して、現在のBMIと体型の目安を確認します。
        </p>

        <form onSubmit={onCalculate} className={styles.form}>
          <label className={styles.label}>
            <span>身長 (cm)</span>
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="例: 170"
            />
          </label>

          <label className={styles.label}>
            <span>体重 (kg)</span>
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="例: 65"
            />
          </label>

          <button type="submit" className={styles.button}>
            計算する
          </button>
        </form>

        <section className={styles.resultSection}>
          <h2 className={styles.resultTitle}>計算結果</h2>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {!error && bmi === null && (
            <p className={styles.resultText}>
              必要な項目を入力し、「計算する」を押してください。
            </p>
          )}

          {bmi !== null && !error && (
            <>
              <p className={styles.resultText}>BMI: {bmi.toFixed(1)}</p>
              <p className={styles.resultText}>判定: {category}</p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

