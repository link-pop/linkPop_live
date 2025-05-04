"use server";

import mailer from "@/lib/utils/mailer/mailer";

// ! code start sendErrorToAdmin
export const sendErrorToAdmin = async ({
  error,
  subject = "Application Error Report",
  context = {},
}) => {
  // Only send error if not in DEV_MODE
  // if (process.env.DEV_MODE) {
  //   // In dev mode, skip sending admin email
  //   return { skipped: true, reason: "DEV_MODE enabled" };
  // }
  try {
    if (!error) {
      return { error: "Error object is required" };
    }

    if (!process.env.SMTP_ADMIN_EMAIL) {
      console.error("SMTP_ADMIN_EMAIL environment variable is not set");
      return { error: "Admin email not configured" };
    }

    // Format error details
    const errorDetails = {
      message: error.message || "Unknown error",
      stack: error.stack || "No stack trace available",
      context: JSON.stringify(context, null, 2),
      timestamp: new Date().toISOString(),
      environment: process.env.DEV_MODE
        ? "development (DEV_MODE)"
        : "production",
    };

    // Create HTML content
    const html = `
      <h2>Error Report</h2>
      <p><strong>Timestamp:</strong> ${errorDetails.timestamp}</p>
      <p><strong>Environment:</strong> ${errorDetails.environment}</p>
      <p><strong>Error Message:</strong> ${errorDetails.message}</p>
      <h3>Context:</h3>
      <pre>${errorDetails.context}</pre>
      <h3>Stack Trace:</h3>
      <pre>${errorDetails.stack}</pre>
    `;

    // Send email to admin
    const result = await mailer({
      toEmail: process.env.SMTP_ADMIN_EMAIL,
      subject: `${subject} - ${errorDetails.message.substring(0, 50)}`,
      html,
    });

    console.log("Admin notification sent:", result);

    return { success: true, result };
  } catch (err) {
    console.error("Error sending admin notification:", err);
    return { error: `Failed to send admin notification: ${err.message}` };
  }
};
// ? code end sendErrorToAdmin
