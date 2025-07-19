"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { createUserList } from "@/lib/actions/createUserList";
import Input from "@/components/ui/shared/Input/Input";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function CreateListModal({ mongoUser, onListCreated, onClose }) {
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [errors, setErrors] = useState({});

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

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
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await createUserList({
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: formData.slug.trim(),
        targetCollection: "attachments",
        filterCriteria: {},
        color: "#3b82f6",
        icon: "folder",
      });

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
      console.error("❌ Error creating list:", error);
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
        <h2 className="text-lg font-semibold tac wf">{t("createList")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="fc g15">
        <Input
          label={t("listName")}
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          error={errors.name}
          maxLength={50}
          required
          floating
        />

        {/* // ! don't uncomment this! */}
        {/* <Textarea
          label={t("listDescription")}
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          error={errors.description}
          maxLength={200}
          floating
        />

        <Input
          label="URL Slug"
          name="slug"
          value={formData.slug}
          onChange={(e) =>
            setFormData({ ...formData, slug: generateSlug(e.target.value) })
          }
          error={errors.slug}
          maxLength={50}
          helperText="Used in URL (auto-generated from name)"
          required
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
            text={isLoading ? t("creating") : t("createList")}
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          />
        </div>
      </form>
    </div>
  );
}
