"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./NavBar.module.css";

const LINKS = [
  { href: "/bmi", label: "BMI計算" },
  { href: "/progress-diagnosis", label: "ダイエット進捗診断" },
  { href: "/plan-creation", label: "ダイエットプラン作成" },
];

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const isHome = pathname === "/";

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
        if (!cancelled && data.authenticated) {
          setUser(data.user);
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

  const showNavPaths = ["/", ...LINKS.map((l) => l.href)];
  if (!showNavPaths.includes(pathname)) {
    return null;
  }

  const visibleLinks = LINKS.filter((link) => link.href !== pathname);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {!isHome && (
          <>
            <span className={styles.title}>ダイエットサポート</span>
            <Link href="/" className={styles.home}>
              ホーム
            </Link>
            {visibleLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </>
        )}
        <div className={styles.spacer} />
        <div className={styles.userArea}>
          {user ? (
            <>
              <span className={styles.userEmail}>
                {user.name ?? user.email}
              </span>
              <button
                type="button"
                className={`${styles.authButton} ${styles.logoutButton}`}
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className={`${styles.authButton} ${styles.loginLink}`}
            >
              ログイン
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

