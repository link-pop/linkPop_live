"use client";

import React from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext as useMainContext } from "@/components/Context/Context";
import Button2 from "@/components/ui/shared/Button/Button2";

const DeleteListConfirmationDialog = ({
  listName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { dialogSet } = useMainContext();

  const handleConfirm = () => {
    onConfirm();
    dialogSet({ isOpen: false });
  };

  const handleCancel = () => {
    onCancel();
    dialogSet({ isOpen: false });
  };

  return (
    <div className="fcc tac p20">
      <div className="mb20">
        <h3 className="text-lg font-semibold mb10 text-foreground">
          Delete List
        </h3>
        <p className="text-muted-foreground">
          Are you sure you want to delete "{listName}"? This action cannot be
          undone.
        </p>
      </div>

      <div className="f g10 jcfe">
        <Button2
          onClick={handleCancel}
          variant="outline"
          text={t("cancel")}
          disabled={isLoading}
        />
        <Button2
          onClick={handleConfirm}
          variant="danger"
          text={t("delete")}
          disabled={isLoading}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default DeleteListConfirmationDialog;
