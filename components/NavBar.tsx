"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavBar.module.css";

const LINKS = [
  { href: "/bmi", label: "BMI計算" },
  { href: "/progress-diagnosis", label: "ダイエット進捗診断" },
  { href: "/plan-creation", label: "ダイエットプラン作成" },
];

export function NavBar() {
  const pathname = usePathname();

  const showNavPaths = LINKS.map((l) => l.href);
  if (!showNavPaths.includes(pathname)) {
    return null;
  }

  const visibleLinks = LINKS.filter((link) => link.href !== pathname);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <span className={styles.title}>ダイエットサポート</span>
        <Link href="/" className={styles.home}>
          ホーム
        </Link>
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

