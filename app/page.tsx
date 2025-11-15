"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        padding: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        ダイエットサポート
      </h1>

      <ul>
        <li>
          <Link href="/bmi">BMI計算</Link>
        </li>
        <li>
          <Link href="/progress-diagnosis">ダイエット進捗診断</Link>
        </li>
        <li>
          <Link href="/plan-creation">プラン作成</Link>
        </li>
      </ul>
    </main>
  );
}

