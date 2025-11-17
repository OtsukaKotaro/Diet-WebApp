"use client";

import { useEffect, useState } from "react";
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

type RangeKey = "1m" | "1y" | "all";

type RangeOption = {
  key: RangeKey;
  label: string;
};

const RANGE_OPTIONS: RangeOption[] = [
  { key: "1m", label: "1か月" },
  { key: "1y", label: "1年" },
  { key: "all", label: "全期間" },
];

function toDateKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const mm = month.toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function parseDate(value: string): Date {
  return new Date(value);
}

function filterByRange(records: DietRecord[], range: RangeKey): DietRecord[] {
  if (range === "all") {
    return [...records];
  }

  const now = new Date();
  let from: Date;

  if (range === "1m") {
    from = new Date(now);
    from.setMonth(now.getMonth() - 1);
  } else {
    // "1y"
    from = new Date(now);
    from.setFullYear(now.getFullYear() - 1);
  }

  return records.filter((r) => parseDate(r.date) >= from);
}

export default function DietRecordsGraphPage() {
  const [records, setRecords] = useState<DietRecord[]>([]);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>("1m");

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
        fetched.sort(
          (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
        );
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
          <h1 className={styles.title}>グラフで記録を見る</h1>
          <p className={styles.subtitle}>
            この機能を利用するには、ログインが必要です。
          </p>
        </div>
      </main>
    );
  }

  const filtered = filterByRange(records, range);

  // グラフ描画用のデータ整形
  const graphPoints = (() => {
    if (filtered.length === 0) return [];

    const weights = filtered.map((r) => r.weightKg);
    let minW = Math.min(...weights);
    let maxW = Math.max(...weights);

    // すべて同じ体重のときに少し余白をつける
    if (minW === maxW) {
      minW -= 1;
      maxW += 1;
    }

    const width = 300;
    const height = 160;

    const count = filtered.length;
    return filtered.map((record, index) => {
      const x =
        count === 1 ? width / 2 : (index / (count - 1)) * (width - 20) + 10;
      const ratio = (record.weightKg - minW) / (maxW - minW || 1);
      const y = height - 10 - ratio * (height - 40);
      return { x, y, weight: record.weightKg, dateKey: toDateKey(record.date) };
    });
  })();

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section>
          <h1 className={styles.title}>体重の推移（グラフ）</h1>
          <p className={styles.subtitle}>
            これまでの記録をグラフで振り返ることができます。期間を切り替えて、短期・長期の変化を見てみましょう。
          </p>

          <div className={styles.graphControls}>
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`${styles.graphRangeButton} ${
                  range === option.key ? styles.graphRangeButtonActive : ""
                }`}
                onClick={() => setRange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.graphContainer}>
            {error && <p className={styles.error}>{error}</p>}

            {!error && graphPoints.length === 0 && (
              <p className={styles.graphEmpty}>
                表示できる記録がありません。記録をつけると、ここにグラフが表示されます。
              </p>
            )}

            {!error && graphPoints.length > 0 && (
              <div className={styles.graphBody}>
                <svg
                  viewBox="0 0 320 180"
                  preserveAspectRatio="none"
                  className={styles.graphSvg}
                >
                  {/* 背景のグリッド線（縦3・横3くらい） */}
                  <g stroke="#e5e7eb" strokeWidth="1">
                    {[1, 2, 3].map((i) => (
                      <line
                        key={`h-${i}`}
                        x1="10"
                        x2="310"
                        y1={40 + i * 30}
                        y2={40 + i * 30}
                      />
                    ))}
                  </g>

                  {/* 折れ線グラフ */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={graphPoints
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")}
                  />

                  {/* 各ポイントのマーカー */}
                  {graphPoints.map((p) => (
                    <circle
                      key={p.dateKey}
                      cx={p.x}
                      cy={p.y}
                      r={3}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  ))}
                </svg>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

