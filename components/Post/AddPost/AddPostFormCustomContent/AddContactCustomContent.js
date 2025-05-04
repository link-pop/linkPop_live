"use client";

import Input from "@/components/ui/shared/Input/Input";
import Textarea from "@/components/ui/shared/Textarea/Textarea";
import Button2 from "@/components/ui/shared/Button/Button2";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useState, useEffect } from "react";

export default function AddContactCustomContent(props) {
  const { col } = props;
  const { mongoUser } = useContext();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor form submission state from parent component
  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;

    const handleSubmit = () => {
      setIsSubmitting(true);
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  if (col.name !== "contacts") return null;

  // Get user's email if available
  const userEmail = mongoUser?.email || mongoUser?.primaryEmailAddress || "";

  return (
    <>
      <div className="bg-background fcc g50 wf mx-auto mt100 p-6">
        <div className="fc g15 maw550 wf">
          <h2 className="text-2xl text-foreground mb-2">{t("contactUs")}</h2>

          <Input
            label={t("name")}
            name="name"
            required
            defaultValue={mongoUser?.name || mongoUser?.fullName || ""}
          />
          <Input
            label={t("email")}
            type="email"
            name="email"
            required
            defaultValue={userEmail}
          />
          <Textarea
            label={t("message")}
            name="message"
            required
            className="bg-background text-foreground"
          />

          <Button2
            type="submit"
            text={isSubmitting ? t("loading") : t("submit")}
            variant="primary"
            className="wfc"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </>
  );
}
