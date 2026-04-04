const nodemailer = require("nodemailer");
const env = require("../config/env");

const dns = require("dns");

// Force IPv4 DNS resolution (Render free tier doesn't support IPv6)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST || process.env.MAIL_HOST,
  port: Number(env.MAIL_PORT || process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: env.MAIL_USER || process.env.MAIL_USER,
    pass: env.MAIL_PASS || process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async ({ to, subject, html, text }) => {
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
