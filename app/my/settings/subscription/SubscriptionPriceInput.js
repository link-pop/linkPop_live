"use client";

import { useEffect, useState } from "react";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import Button2 from "@/components/ui/shared/Button/Button2";
import { updateSubscriptionPrice } from "@/lib/actions/updateSubscriptionPrice";
import Input from "@/components/ui/shared/Input/Input";

export default function SubscriptionPriceInput({ mongoUser }) {
  const [price, setPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toastSet } = useContext();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        if (mongoUser) {
          setCurrentPrice(mongoUser.subscriptionPrice);
          setPrice(mongoUser.subscriptionPrice.toString());
        }
      } catch (error) {
        console.error("Error fetching current price:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCurrentPrice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await updateSubscriptionPrice(price);

      if (result.success) {
        setCurrentPrice(result.price);
        toastSet({
          isOpen: true,
          title: t("success"),
          text: t("subscriptionPriceUpdated"),
        });
      } else {
        throw new Error(result.error || t("unknownError"));
      }
    } catch (error) {
      console.error("Error updating subscription price:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="f fdc g16 p16">
        <div className="skeleton h20 w100"></div>
        <div className="skeleton h40 w200"></div>
        <div className="skeleton h40 w120"></div>
      </div>
    );
  }

  return (
    <div className="f fdc g16 p15">
      <form onSubmit={handleSubmit} className="f fdc g15 w100">
        <div className="f fdc g8">
          <div className="f aic g8 por">
            <Input
              prefix="$"
              label={t("pricePerMonth")}
              id="subscriptionPrice"
              type="number"
              min="0"
              max="100"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="miw200"
              placeholder="0-100"
              required
            />
          </div>
        </div>

        <Button2
          type="submit"
          disabled={loading}
          className="w-fit"
          variant="primary"
        >
          <div className="abounce f fwn aic g2 fz14">
            {loading ? t("updating") : t("save")}
          </div>
        </Button2>
      </form>
    </div>
  );
}
