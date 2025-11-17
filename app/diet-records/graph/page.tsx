"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
    from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else {
    from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }

  return records.filter((r) => parseDate(r.date) >= from);
}

function formatDateLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

type ChartPoint = {
  date: string;
  dateLabel: string;
  weightKg: number;
};

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

  const chartData: ChartPoint[] = useMemo(() => {
    const filtered = filterByRange(records, range);
    return filtered.map((r) => ({
      date: r.date,
      dateLabel: formatDateLabel(r.date),
      weightKg: r.weightKg,
    }));
  }, [records, range]);

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

            {!error && chartData.length === 0 && (
              <p className={styles.graphEmpty}>
                表示できる記録がありません。記録をつけると、ここにグラフが表示されます。
              </p>
            )}

            {!error && chartData.length > 0 && (
              <div className={styles.graphBody}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 16, right: 24, bottom: 24, left: 40 }}
                  >
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fontSize: 10, fill: "#4b5563" }}
                      tickMargin={8}
                      axisLine={{ stroke: "#9ca3af" }}
                    />
                    <YAxis
                      dataKey="weightKg"
                      tick={{ fontSize: 10, fill: "#4b5563" }}
                      tickMargin={8}
                      axisLine={{ stroke: "#9ca3af" }}
                      domain={["dataMin-1", "dataMax+1"]}
                      label={{
                        value: "体重 (kg)",
                        angle: -90,
                        position: "insideLeft",
                        offset: -4,
                        style: { fill: "#6b7280", fontSize: 10 },
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${(value as number).toFixed(1)}kg`,
                        "体重",
                      ]}
                      labelFormatter={(label: string) => `日付: ${label}`}
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "#bfdbfe",
                        backgroundColor: "#f9fafb",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weightKg"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive
                      animationDuration={400}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

