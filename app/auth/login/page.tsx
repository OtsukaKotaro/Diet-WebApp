"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "ログインに失敗しました。");
        return;
      }

      // ログイン成功時はトップページへ遷移
      router.push("/");
      router.refresh();
    } catch {
      setError(
        "通信中にエラーが発生しました。時間をおいて再度お試しください。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.subtitle}>
          登録済みのメールアドレスとパスワードでログインして、記録機能を利用できます。
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            メールアドレス
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.label}>
            パスワード
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className={styles.linkRow}>
          アカウントをお持ちでない場合は{" "}
          <Link href="/auth/register" className={styles.link}>
            新規登録
          </Link>
          へ
        </p>
      </div>
    </div>
  );
}

