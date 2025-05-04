"use client";

import { useState } from "react";
import { useContext } from "@/components/Context/Context";
import { BadgeDollarSign, X } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Input from "@/components/ui/shared/Input/Input";
import { formatPrice } from "@/lib/utils/formatPrice";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

export default function useAddFeedFormPostPrice({
  priceSet,
  price,
  expirationPeriod,
}) {
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const { dialogSet } = useContext();
  const { t } = useTranslation();

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value);
    priceSet(value);
  };

  const openPriceDialog = () => {
    dialogSet({
      isOpen: true,
      title: t("setPostPrice"),
      comp: (
        <div className="p15">
          <Input
            type="number"
            min={1}
            max={100}
            step={1}
            label={t("postPrice")}
            prefix="$"
            defaultValue={price || ""}
            onChange={handlePriceChange}
          />
          <p className="mt10 fz14 text-muted-foreground">
            {t("postPriceDescription")}
          </p>
        </div>
      ),
      confirmBtnText: t("setPrice"),
      action: () => {
        // The price is already set via the input onChange handler
        setIsPriceDialogOpen(false);
      },
    });
  };

  const PostPriceButton = () => {
    return (
      <IconButton
        icon={BadgeDollarSign}
        onClick={openPriceDialog}
        disabled={price > 0 || expirationPeriod}
        title={
          expirationPeriod
            ? t("cannotSetPriceWithExpiration")
            : t("setPostPrice")
        }
      />
    );
  };

  const PostPriceFormLabel = () => {
    if (!price || price <= 0) return null;

    return (
      <div className={`wf f aic g5 mb10`}>
        <div className={`mx15 wf f aic g5 p5 pr10 pl10 bg-accent br5`}>
          <BadgeDollarSign size={16} className={`brand`} />
          <span>{t("postPrice")}</span>
          <span className={`mla fz16`}>{formatPrice(price)}</span>
          <X size={16} className={`brand cp hs`} onClick={() => priceSet(0)} />
        </div>
      </div>
    );
  };

  return {
    PostPriceButton,
    PostPriceFormLabel,
    isPriceDialogOpen,
    setIsPriceDialogOpen,
  };
}
