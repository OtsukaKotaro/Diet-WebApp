"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type MoodValue = "BEST" | "GOOD" | "NORMAL" | "BAD" | "WORST";

const MOOD_OPTIONS: { value: MoodValue; label: string; emoji: string }[] = [
  { value: "BEST", label: "とても良い", emoji: "😄" },
  { value: "GOOD", label: "良い", emoji: "🙂" },
  { value: "NORMAL", label: "ふつう", emoji: "😐" },
  { value: "BAD", label: "あまり良くない", emoji: "😕" },
  { value: "WORST", label: "とても良くない", emoji: "😣" },
];

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const mm = month.toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

async function resizeImageToDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) {
    return null;
  }

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("画像の読み込みに失敗しました。"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });

  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    img.src = dataUrl;
  });

  const maxSize = 1024;
  let { width, height } = image;

  if (width <= maxSize && height <= maxSize) {
    return dataUrl;
  }

  const scale = Math.min(maxSize / width, maxSize / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, width, height);

  const compressed = canvas.toDataURL("image/jpeg", 0.8);
  return compressed;
}

export default function DietRecordsPage() {
  const [date, setDate] = useState(getTodayKey);
  const [weightKg, setWeightKg] = useState("");
  const [mood, setMood] = useState<MoodValue>("NORMAL");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!date) {
      setError("日付を入力してください。");
      return;
    }

    if (!weightKg) {
      setError("体重(kg)を入力してください。");
      return;
    }

    const weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight <= 0) {
      setError("体重(kg)には正の数を入力してください。");
      return;
    }

    let photoData: string | null = null;

    if (photoFile) {
      try {
        photoData = await resizeImageToDataUrl(photoFile);
        if (!photoData) {
          setError("画像の処理に失敗しました。別の画像をお試しください。");
          return;
        }
      } catch {
        setError("画像の処理に失敗しました。別の画像をお試しください。");
        return;
      }
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        date,
        weightKg: weight,
        mood,
        note: note.trim() || null,
      };
      if (photoData) {
        body.photoData = photoData;
      }

      const response = await fetch("/api/diet-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "記録の保存に失敗しました。");
        return;
      }

      setSuccess("記録を保存しました。");
    } catch {
      setError("記録の保存中にエラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ダイエット記録</h1>
        <p className={styles.subtitle}>
          今日の体重や気分をサッと記録しておきましょう。過去の記録はカレンダー画面から確認できます。
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            日付
            <input
              className={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            体重 (kg)
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="例: 65.0"
              required
            />
          </label>

          <div className={styles.label}>
            <span>その日の気分（5段階）</span>
            <div className={styles.moodOptions}>
              {MOOD_OPTIONS.map((option) => {
                const active = option.value === mood;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.moodOption} ${
                      active ? styles.moodOptionActive : ""
                    }`}
                    onClick={() => setMood(option.value)}
                    aria-pressed={active}
                  >
                    <span className={styles.moodEmoji}>{option.emoji}</span>
                    <span className={styles.moodLabel}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className={styles.label}>
            メモ（任意）
            <textarea
              className={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="気づいたことや振り返りを自由にメモできます。"
            />
          </label>

          <label className={styles.label}>
            写真（任意・1枚）
            <input
              className={styles.input}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPhotoFile(file);
              }}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.infoText}>{success}</p>}

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "保存中..." : "今日の記録を保存"}
          </button>
        </form>

        <section className={styles.listSection}>
          <h2 className={styles.listTitle}>過去の記録</h2>
          <Link href="/diet-records/calendar" className={styles.linkButton}>
            カレンダー表示で見る &gt;
          </Link>
        </section>

        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>
            <Link href="/diet-records/gallery">マイギャラリー &gt;</Link>
          </h2>
        </section>
      </div>
    </main>
  );
}

