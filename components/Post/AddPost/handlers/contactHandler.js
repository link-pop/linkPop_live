import { MAIN_ROUTE } from "@/lib/utils/constants";

export const contactHandler = async ({ res, form, router, dialogSet }) => {
  // * Send email notification to admin
  try {
    // Use the API endpoint instead of calling mailer directly
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        fromEmail: form.email, // Explicitly pass the user's email as fromEmail
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send contact email");
    }

    console.log("Contact form submitted successfully:", data);
  } catch (error) {
    console.error("Failed to send notification email:", error);

    // Still show success to user but log the error for admin
    console.error("Contact form error:", {
      form: JSON.stringify(form),
      error: error.message,
    });
  }

  dialogSet({
    isOpen: true,
    showCancelBtn: false,
    text: "thankYouForContactingUs",
    isTranslationKey: true,
  });
  router.push(MAIN_ROUTE);
};
