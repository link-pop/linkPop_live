"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { createPostLabelList } from "@/lib/actions/createPostLabelList";
import Input from "@/components/ui/shared/Input/Input";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function CreatePostLabelListModal({
  mongoUser,
  onListCreated,
  onClose,
}) {
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mongoUser?._id) {
      toastSet({
        isOpen: true,
        title: t("error"),
        text: "User not authenticated",
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
      const result = await createPostLabelList(
        formData.name.trim(),
        formData.description.trim(),
        "#3b82f6", // Default color
        "tag" // Default icon for post labels
      );

      if (result.error) {
        throw new Error(result.error);
      }

      toastSet({
        isOpen: true,
        title: t("success"),
        text: t("listCreated"),
      });

      // Close modal and refresh the list
      onListCreated?.(result.list);
      onClose?.();
    } catch (error) {
      console.error("❌ Error creating post label list:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || t("errorCreatingList"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p20 w-full max-w-md">
      <div className="f aic g10 mb20">
        <h2 className="text-lg font-semibold tac wf">
          {t("createPostLabelList")}
        </h2>
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

        {/* Description field commented out for now */}
        {/* <Input
          label={t("description")}
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          maxLength={200}
          floating
        /> */}

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
            text={isLoading ? t("creating") : t("createPostLabelList")}
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          />
        </div>
      </form>
    </div>
  );
}
