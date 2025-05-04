"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { applyReferralCode } from "@/lib/actions/referral/applyReferralCode";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";

export default function ApplyReferralCodeForm({ onSuccess = () => {} }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { toastSet } = useContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toastSet({
        isOpen: true,
        title: t("referralCodeRequired") || "Please enter a referral code",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await applyReferralCode(code.trim());

      if (result.success) {
        toastSet({
          isOpen: true,
          title: result.message || t("success"),
        });
        setCode("");
        onSuccess(result);
      } else {
        toastSet({
          isOpen: true,
          title: result.message || t("error"),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error applying referral code:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("applyReferralCode") || "Apply Referral Code"}</CardTitle>
        <CardDescription>
          {t("applyReferralCodeDesc") ||
            "If someone referred you, enter their code here to get started"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={t("enterReferralCode") || "Enter referral code"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? t("loading") : t("apply") || "Apply"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
