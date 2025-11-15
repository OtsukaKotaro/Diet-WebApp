"use client";

import Link from "next/link";

export default function Home() {
  const containerStyle: React.CSSProperties = {
    padding: "1.5rem",
    maxWidth: 640,
    margin: "0 auto",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gap: "1rem",
    marginTop: "1.5rem",
  };

  const tileStyle: React.CSSProperties = {
    display: "block",
    padding: "1rem 1.25rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    textDecoration: "none",
    color: "inherit",
  };

  const tileTitleStyle: React.CSSProperties = {
    fontWeight: "bold",
    marginBottom: "0.25rem",
  };

  const tileDescStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#4b5563",
  };

  return (
    <main style={containerStyle}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        ダイエットサポート
      </h1>

      <div style={gridStyle}>
        <Link href="/bmi" style={tileStyle}>
          <div style={tileTitleStyle}>BMI計算</div>
          <div style={tileDescStyle}>
            身長と体重から現在のBMIと状態をチェックします。
          </div>
        </Link>

        <Link href="/progress-diagnosis" style={tileStyle}>
          <div style={tileTitleStyle}>ダイエット進捗診断</div>
          <div style={tileDescStyle}>
            開始日・体重・目標から、今の進み具合とペースを診断します。
          </div>
        </Link>

        <Link href="/plan-creation" style={tileStyle}>
          <div style={tileTitleStyle}>ダイエットプラン作成</div>
          <div style={tileDescStyle}>
            目標日と目標体重から、期間中の理想的な減量プランを作成します。
          </div>
        </Link>
      </div>
    </main>
  );
}

