"use client";

import React, { useState } from "react";
import { calculateBMI, judgeBMI } from "@/lib/bmi";
import Link from "next/link";

export default function Page() {
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

  const containerStyle: React.CSSProperties = {
    padding: "1rem",
    maxWidth: 480,
    margin: "0 auto",
  };

  const labelStyle: React.CSSProperties = {
    display: "grid",
    gap: "0.25rem",
  };

  const formStyle: React.CSSProperties = {
    display: "grid",
    gap: "0.75rem",
    marginTop: "1rem",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 16px",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    marginTop: "8px",
    justifySelf: "flex-start",
  };

  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: "2rem" }}>BMI計算ツール</h1>

      <form onSubmit={onCalculate} style={formStyle}>
        <label style={labelStyle}>
          <span>身長 (cm)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="例: 170"
          />
        </label>

        <label style={labelStyle}>
          <span>体重 (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="例: 65"
          />
        </label>

        <button type="submit" style={buttonStyle}>
          計算する
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "0.75rem" }} role="alert">
          {error}
        </p>
      )}

      {bmi !== null && !error && (
        <section style={{ marginTop: "1rem" }}>
          <h2>結果</h2>
          <p>BMI: {bmi.toFixed(1)}</p>
          <p>判定: {category}</p>
        </section>
      )}

      <Link
        href="/"
        style={{ display: "inline-block", marginTop: "1rem", color: "blue" }}
      >
        トップページへ
      </Link>
    </main>
  );
}

