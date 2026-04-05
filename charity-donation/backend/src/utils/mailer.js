const nodemailer = require("nodemailer");
const axios = require("axios");
const env = require("../config/env");

// Use Brevo HTTP API in production (Render blocks SMTP ports)
// Falls back to nodemailer SMTP for local development
const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

// --- SMTP transporter (local dev) ---
const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST || process.env.MAIL_HOST,
  port: Number(env.MAIL_PORT || process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: env.MAIL_USER || process.env.MAIL_USER,
    pass: env.MAIL_PASS || process.env.MAIL_PASS,
  },
});

// --- Brevo HTTP API (production) ---
const sendMailBrevo = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.MAIL_FROM;

  const res = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "HopeFund", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html || undefined,
      textContent: text || undefined,
    },
    {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("[Brevo] Email sent:", res.data);
  return res.data;
};

// --- Main sendMail function ---
const sendMail = async ({ to, subject, html, text }) => {
  if (isProduction) {
    return sendMailBrevo({ to, subject, html, text });
  }

  // Local dev: use SMTP
  return transporter.sendMail({
    from: `"HopeFund" <${process.env.MAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendMail,
};
