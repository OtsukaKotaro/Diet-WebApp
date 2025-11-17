"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./NavBar.module.css";

type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

type NavLink = {
  href: string;
  label: string;
  requiresAuth?: boolean;
};

const LINKS: NavLink[] = [
  { href: "/", label: "ホーム" },
  { href: "/bmi", label: "BMIチェッカー" },
  { href: "/progress-diagnosis", label: "進捗診断" },
  { href: "/plan-creation", label: "プラン作成" },
  { href: "/diet-records", label: "ダイエット記録", requiresAuth: true },
  { href: "/diet-records/calendar", label: "カレンダー表示", requiresAuth: true },
  { href: "/diet-records/graph", label: "グラフ表示", requiresAuth: true },
  { href: "/diet-records/gallery", label: "マイギャラリー", requiresAuth: true },
];

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);

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
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ""}`}
        aria-label="メニューを開く"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>

      <div
        className={`${styles.menuOverlay} ${open ? styles.menuOverlayOpen : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <span className={styles.menuTitle}>メニュー</span>
            <button
              type="button"
              className={styles.menuClose}
              aria-label="メニューを閉じる"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          {user ? (
            <div className={styles.menuUser}>
              <span className={styles.menuUserName}>
                {user.name ?? user.email}
              </span>
              <Link
                href="/mypage"
                className={styles.menuUserLink}
                onClick={() => setOpen(false)}
              >
                マイページ
              </Link>
            </div>
          ) : (
            <div className={styles.menuUser}>
              <span className={styles.menuUserName}>ゲスト</span>
            </div>
          )}

          <nav className={styles.menuLinks}>
            {LINKS.map((link) => {
              const disabled = link.requiresAuth && !user;
              const isActive = pathname === link.href;

              if (disabled) {
                return (
                  <span
                    key={link.href}
                    className={`${styles.menuLink} ${styles.menuLinkDisabled}`}
                  >
                    {link.label}
                  </span>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.menuLink} ${
                    isActive ? styles.menuLinkActive : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.menuFooter}>
            {user ? (
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                ログアウト
              </button>
            ) : (
              <Link
                href="/auth/login"
                className={styles.loginLink}
                onClick={() => setOpen(false)}
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

