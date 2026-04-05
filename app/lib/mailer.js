import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "mail.zakabdi.dev",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: "noodle-noreply@zakabdi.dev",
    pass: process.env.SMTP_PASSWORD,
  },
});