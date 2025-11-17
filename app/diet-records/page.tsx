"use client";

import { FormEvent, useEffect, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import styles from "./page.module.css";

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

function getNotePreview(note: string): string {
  if (note.length <= 5) return note;
  return `${note.slice(0, 5)}...`;
}

export default function DietRecordsPage() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [weightKg, setWeightKg] = useState("");
  const [mood, setMood] = useState<MoodValue>("NORMAL");
  const [note, setNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [records, setRecords] = useState<DietRecord[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
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
        setRecords(data.records ?? []);
      } catch {
        setError("記録の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    void fetchRecords();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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
      photoData = await new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(photoFile);
      });
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/diet-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          date,
          weightKg: weight,
          mood,
          note: note.trim() || null,
          photoData,
        }),
      });

      if (response.status === 401) {
        setRequiresLogin(true);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "記録の保存に失敗しました。");
        return;
      }

      const record: DietRecord = data.record;

      setRecords((prev) => {
        const others = prev.filter((r) => r.id !== record.id);
        return [record, ...others].sort((a, b) => (a.date < b.date ? 1 : -1));
      });
    } catch {
      setError("記録の保存中にエラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  if (requiresLogin) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>ダイエット記録</h1>
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

  const galleryRecords = records.filter((record) => record.photoUrl);

  function handleNoteOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      setActiveNote(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ダイエット記録</h1>
        <p className={styles.subtitle}>
          日付と体重、その日の気分やメモ、写真を記録して、ダイエットの進み具合を振り返りやすくします。
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

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "保存中..." : "今日の記録を保存"}
          </button>
        </form>

        <section className={styles.listSection}>
          <h2 className={styles.listTitle}>これまでの記録</h2>

          {loading && <p className={styles.infoText}>読み込み中です...</p>}

          {!loading && records.length === 0 && (
            <p className={styles.infoText}>
              まだ記録がありません。まずは今日の体重を記録してみましょう。
            </p>
          )}

          {!loading && records.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>体重(kg)</th>
                  <th>気分</th>
                  <th>メモ</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const fullNote = record.note ?? "";
                  const hasNote = fullNote.length > 0;
                  const isLong = fullNote.length > 5;
                  const displayNote = !hasNote
                    ? ""
                    : isLong
                      ? getNotePreview(fullNote)
                      : fullNote;

                  return (
                    <tr key={record.id}>
                      <td>
                        {new Date(record.date).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td>{record.weightKg.toFixed(1)}</td>
                      <td>{formatMoodLabel(record.mood)}</td>
                      <td>
                        {hasNote ? (
                          <button
                            type="button"
                            className={styles.noteButton}
                            onClick={() => {
                              if (isLong) {
                                setActiveNote(fullNote);
                              }
                            }}
                          >
                            <span className={styles.noteText}>
                              {displayNote}
                            </span>
                            {isLong && (
                              <span className={styles.noteToggleLabel}>
                                全文を表示
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className={styles.notePlaceholder}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>マイギャラリー（写真）</h2>

          {galleryRecords.length === 0 && (
            <p className={styles.infoText}>
              写真付きの記録はまだありません。写真を登録すると、ここに一覧表示されます。
            </p>
          )}

          {galleryRecords.length > 0 && (
            <div className={styles.galleryGrid}>
              {galleryRecords.map((record) => (
                <div key={record.id} className={styles.galleryItem}>
                  {record.photoUrl && (
                    <img
                      src={record.photoUrl}
                      alt="ダイエット記録の写真"
                      className={styles.galleryImage}
                    />
                  )}
                  <div className={styles.galleryMeta}>
                    <div className={styles.galleryMetaMain}>
                      <span>
                        {new Date(record.date).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                      <span>{record.weightKg.toFixed(1)}kg</span>
                    </div>
                    <div className={styles.galleryTags}>
                      <span className={styles.tag}>
                        気分: {formatMoodLabel(record.mood)}
                      </span>
                    </div>
                    {record.note && (
                      <p className={styles.galleryNote}>{record.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {activeNote && (
        <div
          className={styles.noteModalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={handleNoteOverlayClick}
        >
          <div className={styles.noteModal}>
            <div className={styles.noteModalBody}>{activeNote}</div>
            <button
              type="button"
              className={styles.noteModalClose}
              onClick={() => setActiveNote(null)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
