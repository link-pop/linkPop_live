"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { renameUserList } from "@/lib/actions/renameUserList";
import Input from "@/components/ui/shared/Input/Input";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function RenameUserListModal({ list, onListRenamed, onClose }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: list?.name || "",
    description: list?.description || "",
  });
  const [errors, setErrors] = useState({});

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
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t("listName") + " is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await renameUserList(list._id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
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
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to rename list",
        variant: "destructive",
      });
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
          label={t("listName")}
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
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
            text={isLoading ? "Renaming..." : "Rename List"}
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          />
        </div>
      </form>
    </div>
  );
}
