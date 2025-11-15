"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/bmi", label: "BMI計算" },
  { href: "/progress-diagnosis", label: "ダイエット進捗診断" },
  { href: "/plan-creation", label: "プラン作成" },
];

export function NavBar() {
  const pathname = usePathname();

  // ナビを表示するのは BMI / 進捗診断 / プラン作成 のみ
  const showNavPaths = LINKS.map((l) => l.href);
  if (!showNavPaths.includes(pathname)) {
    return null;
  }

  // 現在の画面はナビから除外
  const visibleLinks = LINKS.filter((link) => link.href !== pathname);

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        marginBottom: "1rem",
        padding: "0.75rem 1rem",
      }}
    >
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/">ホーム</Link>
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

