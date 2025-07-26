"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function DeleteUserListConfirmationDialog({
  listName,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  const { dialogSet } = useContext();

  const handleConfirm = () => {
    onConfirm?.();
    dialogSet({ isOpen: false });
  };

  const handleCancel = () => {
    onCancel?.();
    dialogSet({ isOpen: false });
  };

  return (
    <div className="p20 w-full max-w-md">
      <div className="f aic g10 mb20">
        <h2 className="text-lg font-semibold tac wf">Delete List</h2>
      </div>

      <div className="mb20">
        <p className="tac text-foreground mb10">
          Are you sure you want to delete "{listName}"?
        </p>
      </div>

      <div className="f g10">
        <Button2
          type="button"
          text={t("cancel")}
          variant="outline"
          onClick={handleCancel}
          className="flex-1"
        />
        <Button2
          type="button"
          text="Delete List"
          onClick={handleConfirm}
          className="flex-1"
        />
      </div>
    </div>
  );
}
