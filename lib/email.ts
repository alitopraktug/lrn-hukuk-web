import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env, absoluteUrl } from "@/lib/env";
import { escapeHtml, singleLine, multiLine } from "@/lib/text";

/**
 * E-posta gönderimi — herhangi bir SMTP sağlayıcısıyla çalışır (Google Workspace, Microsoft 365, hosting e-postası…).
 * Sağlayıcıya özgü SDK kullanılmaz; böylece sağlayıcı değiştirmek yalnızca ortam değişkenlerini değiştirmektir.
 * Başlık enjeksiyonuna karşı: konu/isim alanları tek satıra indirilir, Reply-To adresi ayrıca doğrulanır.
 */
let transporter: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(env.smtp && env.contactFromEmail);
}

function getTransport(): Transporter {
  if (transporter) return transporter;
  const smtp = env.smtp;
  if (!smtp) throw new Error("SMTP yapılandırılmamış (SMTP_HOST).");
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.user && smtp.password ? { user: smtp.user, pass: smtp.password } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

type Mail = { to: string; subject: string; text: string; html?: string; replyTo?: { name: string; address: string } };

async function send(mail: Mail): Promise<void> {
  const from = env.contactFromEmail;
  if (!from) throw new Error("CONTACT_FROM_EMAIL tanımlı değil.");
  await getTransport().sendMail({
    from: { name: "LRN Hukuk Web Sitesi", address: from },
    to: mail.to,
    subject: singleLine(mail.subject).slice(0, 200),
    text: mail.text,
    html: mail.html,
    replyTo: mail.replyTo ? { name: singleLine(mail.replyTo.name).slice(0, 100), address: mail.replyTo.address } : undefined,
  });
}

export type ContactMail = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  receivedAt: Date;
};

export async function sendContactNotification(to: string, msg: ContactMail): Promise<void> {
  const when = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(msg.receivedAt);
  const text = [
    "Web sitesi iletişim formundan yeni bir mesaj alındı.",
    "",
    `Ad Soyad : ${singleLine(msg.name)}`,
    `E-posta  : ${msg.email}`,
    `Telefon  : ${msg.phone ? singleLine(msg.phone) : "—"}`,
    `Konu     : ${singleLine(msg.subject)}`,
    `Tarih    : ${when}`,
    "",
    multiLine(msg.message),
    "",
    "—",
    "Bu e-postayı yanıtladığınızda yanıt doğrudan gönderene iletilir.",
  ].join("\n");

  // HTML sürümünde tüm kullanıcı girdisi escape edilir; ham HTML render edilmez.
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b665d;white-space:nowrap">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#252524;max-width:640px">
<p style="margin:0 0 12px">Web sitesi iletişim formundan yeni bir mesaj alındı.</p>
<table style="border-collapse:collapse;margin-bottom:16px">${row("Ad Soyad", singleLine(msg.name))}${row("E-posta", msg.email)}${row("Telefon", msg.phone ? singleLine(msg.phone) : "—")}${row("Konu", singleLine(msg.subject))}${row("Tarih", when)}</table>
<div style="white-space:pre-wrap;border-left:3px solid #1e3b26;padding:4px 0 4px 14px">${escapeHtml(multiLine(msg.message))}</div>
</div>`;

  await send({
    to,
    subject: `[İletişim Formu] ${singleLine(msg.subject)}`,
    text,
    html,
    replyTo: { name: msg.name, address: msg.email },
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = absoluteUrl(`/admin/sifre-sifirla/${token}`);
  await send({
    to,
    subject: "Yönetim paneli parola sıfırlama",
    text: `Yönetim paneli için parola sıfırlama talebi aldık.\n\nParolanızı belirlemek için 30 dakika içinde şu bağlantıyı açın:\n${link}\n\nBu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; parolanız değişmez.`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#252524;max-width:560px"><p>Yönetim paneli için parola sıfırlama talebi aldık.</p><p>Parolanızı belirlemek için <strong>30 dakika içinde</strong> aşağıdaki bağlantıyı açın:</p><p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p><p style="color:#6b665d">Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; parolanız değişmez.</p></div>`,
  });
}

export async function sendTestEmail(to: string): Promise<void> {
  await send({
    to,
    subject: "LRN Hukuk – SMTP test e-postası",
    text: "Bu bir test e-postasıdır. SMTP ayarları çalışıyor.",
  });
}
