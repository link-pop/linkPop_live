"use server";

import mailer from "@/lib/utils/mailer/mailer";
import { NextResponse } from "next/server";

// ! code start contactAPI
export async function POST(req) {
  try {
    const form = await req.json();

    // Check if SMTP config is available
    if (!process.env.SMTP_ADMIN_EMAIL) {
      console.error("SMTP_ADMIN_EMAIL environment variable is not set");
      return NextResponse.json(
        { error: "Email configuration missing" },
        { status: 500 }
      );
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      console.error("SMTP server configuration is incomplete");
      return NextResponse.json(
        { error: "Email server configuration missing" },
        { status: 500 }
      );
    }

    console.log("API: Sending contact email to:", process.env.SMTP_ADMIN_EMAIL);

    const result = await mailer({
      toEmail: process.env.SMTP_ADMIN_EMAIL,
      fromEmail: form.fromEmail || form.email,
      subject: `New Contact Form Submission`,
      html: `
        <h2>A new contact has been received</h2>
        ${Object.keys(form)
          .filter((item) => item !== "files" && item !== "fromEmail")
          .map((key) => `<p><strong>${key}:</strong> ${form[key]}</p>\n`)
          .join("")}
      `,
    });

    console.log("API: Contact email result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API: Failed to send notification email:", error);
    console.error("API: Email error details:", {
      to: process.env.SMTP_ADMIN_EMAIL,
      error: error.message,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        adminEmail: process.env.SMTP_ADMIN_EMAIL ? "Set" : "Not set",
        appPass: process.env.SMTP_APP_PASS ? "Set" : "Not set",
      },
    });

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
// ? code end contactAPI
