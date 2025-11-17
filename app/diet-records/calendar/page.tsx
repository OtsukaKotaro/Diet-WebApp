"use client";

import type { FormEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";

type MoodValue = "BEST" | "GOOD" | "NORMAL" | "BAD" | "WORST";

type DietRecord = {
  id: string;
  date: string;
  weightKg: number;
  mood: MoodValue;
  note: string | null;
  photoUrl: string | null;
};

const MOOD_OPTIONS: { value: MoodValue; label: string; emoji: string }[] = [
  { value: "BEST", label: "とても良い", emoji: "😄" },
  { value: "GOOD", label: "良い", emoji: "🙂" },
  { value: "NORMAL", label: "ふつう", emoji: "😐" },
  { value: "BAD", label: "あまり良くない", emoji: "😕" },
  { value: "WORST", label: "とても良くない", emoji: "😣" },
];

function formatMoodLabel(mood: MoodValue): string {
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  return found?.label ?? "";
}

function getDateKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
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

export default function DietRecordsCalendarPage() {
  const [records, setRecords] = useState<DietRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState("");
  const [mood, setMood] = useState<MoodValue>("NORMAL");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      setError(null);
      try {
        const response = await fetch("/api/diet-records", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          setRequiresLogin(true);
          return;
        }

        if (!response.ok) {
          setError("記録の取得中にエラーが発生しました。");
          return;
        }

        const data = await response.json();
        const fetched: DietRecord[] = data.records ?? [];
        setRecords(fetched);
      } catch {
        setError("記録の取得中にエラーが発生しました。");
      }
    }

    void fetchRecords();
  }, []);

  if (requiresLogin) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>カレンダーから記録を見る</h1>
          <p className={styles.subtitle}>
            この機能を利用するには、ログインが必要です。
          </p>
          <Link href="/auth/login" className={styles.linkButton}>
            ログイン画面へ
          </Link>
        </div>
      </main>
    );
  }

  const recordsByDate: Record<string, DietRecord> = {};
  for (const record of records) {
    recordsByDate[getDateKey(record.date)] = record;
  }

  const selectedRecord =
    selectedDate && recordsByDate[selectedDate]
      ? recordsByDate[selectedDate]
      : null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayCells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i += 1) {
    dayCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    dayCells.push(new Date(year, month, d));
  }

  function handleMonthChange(offset: number) {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  }

  function handleDayClick(d: Date) {
    const key = getDateKey(d);
    setSelectedDate(key);
  }

  function openSheetForSelectedDate() {
    if (!selectedDate) return;
    const existing = recordsByDate[selectedDate] ?? null;
    setDate(selectedDate);
    if (existing) {
      setWeightKg(existing.weightKg.toString());
      setMood(existing.mood);
      setNote(existing.note ?? "");
    } else {
      setWeightKg("");
      setMood("NORMAL");
      setNote("");
    }
    setPhotoFile(null);
    setError(null);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
  }

  function handleSheetOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeSheet();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!date || !selectedDate) {
      setError("日付の選択に問題があります。");
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

      const record: DietRecord = data.record;
      setRecords((prev) => {
        const others = prev.filter((r) => r.id !== record.id);
        return [record, ...others];
      });
      setSheetOpen(false);
    } catch {
      setError("記録の保存中にエラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete() {
    if (!selectedRecord) return;
    const ok = window.confirm("この日の記録を削除しますか？");
    if (!ok) return;

    setSubmitting(true);
    setError(null);

    void (async () => {
      try {
        const response = await fetch("/api/diet-records", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ id: selectedRecord.id }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "記録の削除に失敗しました。");
          return;
        }
        setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
        setSelectedDate(null);
        setSheetOpen(false);
      } catch {
        setError("記録の削除中にエラーが発生しました。");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>カレンダーから記録する</h1>
        <p className={styles.subtitle}>
          カレンダーから日付を選んで、その日の記録を確認・編集できます。
        </p>
        <Link href="/diet-records" className={styles.linkButton}>
          記録画面に戻る
        </Link>

        <section className={styles.listSection}>
          <h2 className={styles.listTitle}>これまでの記録</h2>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              <button
                type="button"
                className={styles.calendarNavButton}
                onClick={() => handleMonthChange(-1)}
              >
                &lt;
              </button>
              <span className={styles.calendarMonthLabel}>
                {year}年 {month + 1}月
              </span>
              <button
                type="button"
                className={styles.calendarNavButton}
                onClick={() => handleMonthChange(1)}
              >
                &gt;
              </button>
            </div>

            <div className={styles.calendarWeekdays}>
              {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                <div key={w} className={styles.calendarWeekday}>
                  {w}
                </div>
              ))}
            </div>

            <div className={styles.calendarGrid}>
              {dayCells.map((d, index) => {
                if (!d) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className={styles.calendarCellEmpty}
                    />
                  );
                }

                const key = getDateKey(d);
                const hasRecord = Boolean(recordsByDate[key]);
                const isSelected = selectedDate === key;

                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.calendarCell} ${
                      hasRecord ? styles.calendarCellHasRecord : ""
                    } ${isSelected ? styles.calendarCellSelected : ""}`}
                    onClick={() => handleDayClick(d)}
                  >
                    <span>{d.getDate()}</span>
                    {hasRecord && <span className={styles.calendarDot} />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {selectedDate && (
          <section className={styles.listSection}>
            <h2 className={styles.listTitle}>
              {selectedDate} の記録
            </h2>
            {selectedRecord ? (
              <>
                <p className={styles.infoText}>
                  体重: {selectedRecord.weightKg.toFixed(1)} kg / 気分:{" "}
                  {formatMoodLabel(selectedRecord.mood)}
                </p>
                {selectedRecord.note && (
                  <p className={styles.infoText}>メモ: {selectedRecord.note}</p>
                )}
                <button
                  type="button"
                  className={styles.button}
                  onClick={openSheetForSelectedDate}
                >
                  この日の記録を編集する
                </button>
              </>
            ) : (
              <>
                <p className={styles.infoText}>まだ記録がありません。</p>
                <button
                  type="button"
                  className={styles.button}
                  onClick={openSheetForSelectedDate}
                >
                  この日の記録を登録する
                </button>
              </>
            )}
          </section>
        )}

        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>
            <Link href="/diet-records/gallery">マイギャラリー &gt;</Link>
          </h2>
        </section>
      </div>

      <div
        className={`${styles.sheetOverlay} ${
          sheetOpen ? styles.sheetOverlayOpen : ""
        }`}
        role="dialog"
        aria-modal="true"
        onClick={handleSheetOverlayClick}
      >
        {selectedDate && (
          <div ref={sheetRef} className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>
                {selectedDate
                  ? `${selectedDate} の記録`
                  : "この日の記録"}
              </span>
              <button
                type="button"
                className={styles.sheetCloseButton}
                onClick={closeSheet}
              >
                ×
              </button>
            </div>

            <form className={styles.sheetForm} onSubmit={handleSubmit}>
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
                        <span className={styles.moodEmoji}>
                          {option.emoji}
                        </span>
                        <span className={styles.moodLabel}>
                          {option.label}
                        </span>
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

              {selectedRecord && (
                <p className={styles.infoText}>
                  既に記録があります。このフォームから上書き保存できます。
                </p>
              )}

              <div className={styles.sheetActions}>
                <button
                  className={styles.button}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "保存中..." : "この日の記録を保存"}
                </button>
                {selectedRecord && (
                  <button
                    type="button"
                    className={styles.recordDeleteButton}
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    この日の記録を削除
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
