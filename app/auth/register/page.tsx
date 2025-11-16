"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "登録に失敗しました。");
        return;
      }

      setSuccessMessage(
        "登録が完了しました。確認メールを送信しましたので、メール内のリンクを開いて認証を完了してください。",
      );
      setPassword("");
    } catch {
      setError("通信中にエラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>新規登録</h1>
        <p className={styles.subtitle}>
          メールアドレスとパスワードを登録して、ダイエットの経過を記録できるようにします。
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            名前（任意）
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {successMessage && (
            <p className={styles.success}>{successMessage}</p>
          )}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>
      </div>
    </div>
  );
}

