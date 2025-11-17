/* eslint-disable react/jsx-curly-brace-presence */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Feature = {
  href: string;
  title: string;
  desc: string;
  badge: string;
  requiresAuth?: boolean;
};

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

const features: Feature[] = [
  {
    href: "/bmi",
    title: "BMIチェッカー",
    desc: "身長と体重から、現在のBMIと体型の目安を確認できます。",
    badge: "基本",
  },
  {
    href: "/progress-diagnosis",
    title: "進捗診断",
    desc: "開始日・現在体重・目標体重から、ダイエットの進捗率とペースを診断します。",
    badge: "モチベ維持",
  },
  {
    href: "/plan-creation",
    title: "プラン作成",
    desc: "目標日と目標体重から、無理のない減量プランを自動で作成します。",
    badge: "計画づくり",
  },
  {
    href: "/diet-records",
    title: "ダイエット記録",
    desc: "日付と体重を記録して、日々の変化を振り返れます。",
    badge: "記録",
    requiresAuth: true,
  },
  {
    href: "/diet-records/calendar",
    title: "カレンダー表示",
    desc: "カレンダーから日付を選んで、これまでの記録を確認・編集できます。",
    badge: "記録",
    requiresAuth: true,
  },
];

export default function HomePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        // ignore
      }
    }

    void fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} />
            {"ダイエットを「見える化」して続けやすく"}
          </div>

          <h1 className={styles.title}>
            自分のペースで続けられる
            <br />
            ダイエットサポート Web アプリ
          </h1>

          <p className={styles.subtitle}>
            {
              "BMIチェック・進捗診断・プラン作成など、今の状態と目標に合わせて「続けやすいダイエット」をサポートします。まずは気になるツールから試してみましょう。"
            }
          </p>
        </section>

        <section>
          <h2 className={styles.sectionHeader}>ツール一覧</h2>

          <div className={styles.cards}>
            {features.map((feature) => {
              const requiresAuth = feature.requiresAuth;
              const disabled = requiresAuth && !user;

              if (disabled) {
                return (
                  <div
                    key={feature.href}
                    className={`${styles.card} ${styles.cardDisabled}`}
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{feature.title}</h3>
                      <span className={styles.cardBadge}>{feature.badge}</span>
                    </div>
                    <p className={styles.cardDescription}>{feature.desc}</p>
                    <p className={styles.cardNotice}>
                      ログインするとこの機能が使えるようになります。
                    </p>
                  </div>
                );
              }

              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                    <span className={styles.cardBadge}>{feature.badge}</span>
                  </div>
                  <p className={styles.cardDescription}>{feature.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

