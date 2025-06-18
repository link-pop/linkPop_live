"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Toggle from "@/components/ui/shared/Toggle/Toggle";
import AddStoreItemForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddStoreItemForm";
import AddStoreAuctionItemForm from "@/components/Post/AddPostCustom/MoreThanFriend/AddStoreAuctionItemForm";
import { Package, Clock } from "lucide-react";

export default function AddStoreItemForms({
  col,
  mongoUser,
  updatingPost,
  onCustomSuccess,
  hideSubmitButton = false,
  customOnSubmit,
  submitBtnClassName,
  onReset,
  placeholder,
  submitBtnText,
}) {
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = useState("regular"); // "regular" or "auction"

  // If updating an existing post, set the form type based on the post type
  useState(() => {
    if (updatingPost?.type) {
      setActiveForm(updatingPost.type);
    }
  }, [updatingPost?.type]);

  const formOptions = [
    {
      key: "regular",
      label: t("regularStoreItem"),
      icon: <Package size={16} />,
      description: t("regularStoreItemDescription"),
    },
    {
      key: "auction",
      label: t("auctionItem"),
      icon: <Clock size={16} />,
      description: t("auctionItemDescription"),
    },
  ];

  const renderFormSelector = () => {
    // Don't show selector when updating an existing post
    if (updatingPost) return null;

    return (
      <div className="mb20">
        <h3 className="text-lg font-semibold mb10">{t("selectItemType")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveForm(option.key)}
              className={`p15 border rounded-lg text-left transition-all hover:shadow-sm ${
                activeForm === option.key
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
              }`}
            >
              <div className="f aic g10 mb8">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              <p className="text-sm opacity-80">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderActiveForm = () => {
    const commonProps = {
      col,
      mongoUser,
      updatingPost,
      onCustomSuccess,
      hideSubmitButton,
      customOnSubmit,
      submitBtnClassName,
      onReset,
      placeholder,
      submitBtnText,
    };

    if (activeForm === "auction") {
      return (
        <AddStoreAuctionItemForm
          {...commonProps}
          placeholder={placeholder || t("describeYourAuctionItem")}
          submitBtnText={submitBtnText || t("createAuction")}
        />
      );
    }

    return (
      <AddStoreItemForm
        {...commonProps}
        placeholder={placeholder || t("describeYourStoreItem")}
        submitBtnText={submitBtnText || t("addToStore")}
      />
    );
  };

  return (
    <div className="w-full">
      {renderFormSelector()}

      {/* Current Form Type Indicator */}
      <div className="mb10 p10 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="f aic g8">
          {formOptions.find((opt) => opt.key === activeForm)?.icon}
          <span className="text-sm font-medium">
            {updatingPost ? t("updating").replace("...", "") : t("creating")}{" "}
            {formOptions.find((opt) => opt.key === activeForm)?.label}
          </span>
        </div>
      </div>

      {renderActiveForm()}
    </div>
  );
}
