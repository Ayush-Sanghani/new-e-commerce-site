import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getEmailFrom(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  return from || null;
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  name?: string | null;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  const from = getEmailFrom();

  if (!resend || !from) {
    console.error("Password reset email skipped: RESEND_API_KEY or EMAIL_FROM not set.");
    return { sent: false, error: "Email is not configured." };
  }

  const greeting = params.name?.trim() ? `Hi ${params.name.trim()},` : "Hi,";

  const { error } = await resend.emails.send({
    from,
    to: "ayushsanghani2@gmail.com",
    subject: "Reset your password",
    html: `
      <p>${greeting}</p>
      <p>We received a request to reset your password. Click the link below to choose a new password. This link expires in 1 hour.</p>
      <p><a href="${params.resetUrl}">Reset password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p style="color:#64748b;font-size:12px;">If the button does not work, copy and paste this URL into your browser:<br>${params.resetUrl}</p>
    `,
  });
  return { sent: true };
}
