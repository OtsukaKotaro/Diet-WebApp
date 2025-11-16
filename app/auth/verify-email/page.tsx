"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token") ?? "";
    if (!token) {
      setStatus("error");
      setMessage("トークンが見つかりません。メール内のリンクをもう一度ご確認ください。");
      return;
    }

    async function verify() {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error ?? "メール認証に失敗しました。");
          return;
        }

        setStatus("success");
        setMessage("メールアドレスの確認が完了しました。ログインして記録を始めましょう。");
      } catch {
        setStatus("error");
        setMessage(
          "通信中にエラーが発生しました。時間をおいて再度お試しください。",
        );
      }
    }

    void verify();
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>メールアドレスの確認</h1>
        <p className={styles.message}>
          メール内のリンクからこのページを開くと、アカウントのメールアドレス確認を行います。
        </p>

        <p
          className={`${styles.status} ${
            status === "success"
              ? styles.success
              : status === "error"
                ? styles.error
                : ""
          }`}
        >
          {status === "idle" && "処理を開始しています…"}
          {status === "loading" && "メールアドレスを確認しています…"}
          {(status === "success" || status === "error") && message}
        </p>

        {status === "success" && (
          <Link href="/auth/login" className={styles.linkButton}>
            ログイン画面へ
          </Link>
        )}
      </div>
    </div>
  );
}
