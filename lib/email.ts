import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${appUrl}/auth/verify-email?token=${encodeURIComponent(
    token,
  )}`;

  if (!resend) {
    console.log("[sendVerificationEmail]", { to, verifyUrl });
    return;
  }

  await resend.emails.send({
    from: "no-reply@example.com",
    to,
    subject: "メールアドレスの確認",
    text: `以下のリンクをクリックしてメールアドレスを確認してください:\n\n${verifyUrl}\n\nこのリンクは24時間で有効期限が切れます。`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  if (!resend) {
    console.log("[sendPasswordResetEmail]", { to, resetUrl });
    return;
  }

  await resend.emails.send({
    from: "no-reply@example.com",
    to,
    subject: "パスワード再設定",
    text: `以下のリンクからパスワードを再設定してください:\n\n${resetUrl}\n\nこのリンクは1時間で有効期限が切れます。`,
  });
}
