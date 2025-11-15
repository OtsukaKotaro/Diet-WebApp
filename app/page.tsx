import Link from "next/link";
import styles from "./page.module.css";

type Feature = {
  href: string;
  title: string;
  desc: string;
  badge: string;
};

const features: Feature[] = [
  {
    href: "/bmi",
    title: "BMIチェック",
    desc: "身長と体重から、現在のBMIと体型の目安を確認します。",
    badge: "基本",
  },
  {
    href: "/progress-diagnosis",
    title: "進捗診断",
    desc: "開始日・現在体重・目標体重から、進捗率やペースを診断します。",
    badge: "モチベ維持",
  },
  {
    href: "/plan-creation",
    title: "プラン作成",
    desc: "目標日と目標体重から、無理のない減量プランを自動で作成します。",
    badge: "計画づくり",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {/* Hero section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} />
            ダイエットを「見える化」して続けやすく
          </div>

          <h1 className={styles.title}>
            自分のペースで続けられる
            <br />
            ダイエットサポートWebアプリ
          </h1>

          <p className={styles.subtitle}>
            BMIチェック・進捗診断・プラン作成など、
            今の状態と目標に合わせて「続けやすいダイエット」をサポートします。
            まずは気になるツールから試してみましょう。
          </p>

          <div className={styles.heroActions}>
            <Link href="/progress-diagnosis" className={styles.primaryButton}>
              進捗を診断する
              <span style={{ fontSize: "11px" }}>→</span>
            </Link>
            <Link href="/plan-creation" className={styles.secondaryLink}>
              プランを立てる
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section>
          <h2 className={styles.sectionHeader}>ツール一覧</h2>

          <div className={styles.cards}>
            {features.map((feature) => (
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
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

