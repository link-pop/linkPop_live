"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { updateUserList } from "@/lib/actions/updateUserList";
import Input from "@/components/ui/shared/Input/Input";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function RenameListModal({ list, onListRenamed, onClose }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState(list?.name || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!list?._id) {
      toastSet({
        isOpen: true,
        title: t("error"),
        text: "List not found",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!newName.trim()) {
      setError("List name is required");
      return;
    }

    if (newName.trim() === list.name) {
      // No change needed
      onClose?.();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await updateUserList(list._id, {
        name: newName.trim(),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toastSet({
        isOpen: true,
        title: t("success"),
        text: "List renamed successfully",
      });

      // Close modal and refresh the list
      onListRenamed?.(result.list);
      onClose?.();
    } catch (error) {
      console.error("❌ Error renaming list:", error);
      setError(error.message || "Failed to rename list");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p20 w-full max-w-md">
      <div className="f aic g10 mb20">
        <h2 className="text-lg font-semibold tac wf">Rename List</h2>
      </div>

      <form onSubmit={handleSubmit} className="fc g15">
        <Input
          label="List Name"
          name="name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          error={error}
          maxLength={50}
          required
          floating
        />

        <div className="f g10 mt10">
          <Button2
            type="button"
            text={t("cancel")}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          />
          <Button2
            type="submit"
            text={isLoading ? "Renaming..." : "Rename"}
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          />
        </div>
      </form>
    </div>
  );
}
