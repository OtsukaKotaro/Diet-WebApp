"use client";

import { useEffect, useState, FormEvent } from "react";
import styles from "./page.module.css";

type Profile = {
  email: string;
  name: string | null;
  startDate: string | null;
  startWeightKg: number | null;
  goalWeightKg: number | null;
  targetDate: string | null;
};

export default function MyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setError(null);
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          credentials: "include",
        });
        if (response.status === 401) {
          setError("ログインが必要です。");
          setLoading(false);
          return;
        }
        const data = await response.json();
        setProfile({
          email: data.email,
          name: data.name ?? null,
          startDate: data.startDate ?? null,
          startWeightKg: data.startWeightKg ?? null,
          goalWeightKg: data.goalWeightKg ?? null,
          targetDate: data.targetDate ?? null,
        });
      } catch {
        setError("プロフィールの取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          startDate: profile.startDate || null,
          startWeightKg:
            profile.startWeightKg === null || Number.isNaN(profile.startWeightKg)
              ? null
              : profile.startWeightKg,
          goalWeightKg:
            profile.goalWeightKg === null || Number.isNaN(profile.goalWeightKg)
              ? null
              : profile.goalWeightKg,
          targetDate: profile.targetDate || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "プロフィールの更新に失敗しました。");
        return;
      }

      setProfile({
        email: data.email,
        name: data.name ?? null,
        startDate: data.startDate ?? null,
        startWeightKg: data.startWeightKg ?? null,
        goalWeightKg: data.goalWeightKg ?? null,
        targetDate: data.targetDate ?? null,
      });
      setSuccess("プロフィールを保存しました。");
    } catch {
      setError("プロフィールの更新中にエラーが発生しました。");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>マイページ</h1>
          <p className={styles.subtitle}>読み込み中です…</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>マイページ</h1>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>マイページ</h1>
        <p className={styles.subtitle}>
          アカウント情報と、ダイエットの基本設定（開始日・体重・目標体重など）を登録できます。
        </p>

        <section>
          <h2 className={styles.sectionTitle}>アカウント情報</h2>
          <div className={styles.form}>
            <label className={styles.label}>
              メールアドレス
              <input
                className={`${styles.input} ${styles.readonlyInput}`}
                type="email"
                value={profile.email}
                readOnly
              />
            </label>
            <label className={styles.label}>
              お名前（任意）
              <input
                className={styles.input}
                type="text"
                value={profile.name ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value || null })
                }
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>ダイエットの基本設定</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              ダイエット開始日
              <input
                className={styles.input}
                type="date"
                value={profile.startDate ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, startDate: e.target.value || null })
                }
              />
            </label>

            <label className={styles.label}>
              開始時の体重 (kg)
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={
                  profile.startWeightKg !== null &&
                  !Number.isNaN(profile.startWeightKg)
                    ? profile.startWeightKg
                    : ""
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    startWeightKg:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="例: 80.0"
              />
            </label>

            <label className={styles.label}>
              目標体重 (kg)
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={
                  profile.goalWeightKg !== null &&
                  !Number.isNaN(profile.goalWeightKg)
                    ? profile.goalWeightKg
                    : ""
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    goalWeightKg:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="例: 70.0"
              />
            </label>

            <label className={styles.label}>
              目標日
              <input
                className={styles.input}
                type="date"
                value={profile.targetDate ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    targetDate: e.target.value || null,
                  })
                }
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <button className={styles.button} type="submit" disabled={saving}>
              {saving ? "保存中..." : "プロフィールを保存する"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

