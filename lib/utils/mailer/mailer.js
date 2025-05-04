"use server";
import nodemailer from "nodemailer";

// * how to setup:
// ! place with 2FactorAuth: https://myaccount.google.com/security
// https://stackoverflow.com/questions/26948516/nodemailer-invalid-login
// search: Since May 30, 2022, Google no longer supports less secure apps...
// link to app pass: https://myaccount.google.com/u/1/apppasswords?utm_source=google-account&utm_medium=myaccountsecurity&utm_campaign=tsv-settings&rapt=AEjHL4NP7rp6aFinpkeUX9FqAeo9rPdHOL6pER_F6OJTdahdyrq6BIjp94ynspbBnD3WHMKzjFyhk4_GiCoLM2sQV-L8DQsHOw
// Nodemailer for office 365 example
// https://github.com/nodemailer/nodemailer/issues/1482
// https://nodemailer.com/smtp/
export default async function mailer({
  toEmail,
  fromEmail,
  subject,
  html,
  attachments,
}) {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_ADMIN_EMAIL,
        pass: process.env.SMTP_APP_PASS,
      },
      secure: process.env.SMTP_SECURE === "true",
      tls: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
      // Add connection timeout
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify SMTP connection configuration
    await transporter.verify();

    // setup e-mail data
    const mailOptions = {
      // Must use admin email in the "from" field for authentication
      // but we can use a name that indicates the actual sender
      from: fromEmail
        ? `"Contact from ${fromEmail}" <${process.env.SMTP_ADMIN_EMAIL}>`
        : process.env.SMTP_ADMIN_EMAIL,
      to: toEmail,
      replyTo: fromEmail || process.env.SMTP_ADMIN_EMAIL, // Allow admin to reply directly to the user
      subject,
      html,
      attachments,
    };

    // send mail and wait for result
    const info = await transporter.sendMail(mailOptions);

    console.log(`Message sent to email: ${toEmail}`, info.response);
    return { success: true, info };
  } catch (error) {
    console.error("Mailer Error:", {
      error: error.message,
      stack: error.stack,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_ADMIN_EMAIL,
        secure: process.env.SMTP_SECURE,
      },
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }
}
