"use client";

import { Store } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import CreatedBy from "@/components/Post/Post/CreatedBy";

export default function CartStoreOwnerHeader({
  storeOwner,
  totalItems,
  subtotal,
}) {
  const { t } = useTranslation();

  return (
    <div className="f aic g15 mb20 p15 bg-accent/20 border border-accent/30 rounded-xl">
      <div className="f aic jcc w50 h50 bg-accent/30 rounded-full">
        <Store className="w24 h24 text-accent-foreground" />
      </div>

      <div className="flex-1">
        <CreatedBy
          createdBy={{
            _id: storeOwner._id,
            name:
              storeOwner.username ||
              storeOwner.name ||
              storeOwner.email ||
              "Store Owner",
            profileImage: storeOwner.profileImage || storeOwner.avatar,
          }}
          showName={true}
          wrapClassName="mb5"
          nameClassName="font-bold text-lg text-foreground"
          imageClassName="w50 h50"
        />

        <div className="f aic g15 text-sm text-muted-foreground">
          <span className="f aic g5">
            <Store size={14} />
            {totalItems} {totalItems === 1 ? t("item") : t("items")}
          </span>
          <span className="w1 h1 bg-muted-foreground rounded-full"></span>
          <span className="font-semibold text-foreground">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
