"use client";

import { useEffect, useState } from "react";
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

function formatMoodLabel(mood: MoodValue): string {
  switch (mood) {
    case "BEST":
      return "とても良い";
    case "GOOD":
      return "良い";
    case "NORMAL":
      return "ふつう";
    case "BAD":
      return "あまり良くない";
    case "WORST":
      return "とても良くない";
    default:
      return "";
  }
}

export default function GalleryPage() {
  const [records, setRecords] = useState<DietRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [activeRecord, setActiveRecord] = useState<DietRecord | null>(null);

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
          setError("写真の取得中にエラーが発生しました。");
          return;
        }

        const data = await response.json();
        const allRecords: DietRecord[] = data.records ?? [];
        const photos = allRecords
          .filter((r) => r.photoUrl)
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        setRecords(photos);
      } catch {
        setError("写真の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    void fetchRecords();
  }, []);

  if (requiresLogin) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>マイギャラリー</h1>
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

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>マイギャラリー</h1>
        <p className={styles.subtitle}>
          写真付きで記録した日を、3枚並びの一覧で確認できます。
        </p>

        <Link href="/diet-records" className={styles.linkButton}>
          記録画面に戻る
        </Link>

        {loading && <p className={styles.infoText}>読み込み中です...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && records.length === 0 && (
          <p className={styles.infoText}>
            写真付きの記録はまだありません。ダイエット記録画面から写真を追加してみましょう。
          </p>
        )}

        {!loading && !error && records.length > 0 && (
          <div className={styles.galleryGrid}>
            {records.map((record) => (
              <button
                key={record.id}
                type="button"
                className={styles.galleryItem}
                onClick={() => setActiveRecord(record)}
              >
                {record.photoUrl && (
                  <img
                    src={record.photoUrl}
                    alt="ダイエット記録の写真"
                    className={styles.galleryThumb}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeRecord && (
        <div className={styles.noteModalOverlay} role="dialog" aria-modal="true">
          <div className={styles.noteModal}>
            {activeRecord.photoUrl && (
              <img
                src={activeRecord.photoUrl}
                alt="ダイエット記録の写真"
                className={styles.galleryImage}
              />
            )}
            <div className={styles.galleryMeta}>
              <div className={styles.galleryMetaMain}>
                <span>
                  {new Date(activeRecord.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
                <span>{activeRecord.weightKg.toFixed(1)}kg</span>
              </div>
              <div className={styles.galleryTags}>
                <span className={styles.tag}>
                  気分: {formatMoodLabel(activeRecord.mood)}
                </span>
              </div>
              {activeRecord.note && (
                <p className={styles.galleryNote}>{activeRecord.note}</p>
              )}
            </div>
            <button
              type="button"
              className={styles.noteModalClose}
              onClick={() => setActiveRecord(null)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

