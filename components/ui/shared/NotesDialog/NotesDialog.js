"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import CreatedBy from "@/components/Post/Post/CreatedBy";
import Button2 from "@/components/ui/shared/Button/Button2";
import { getUserNote } from "@/lib/actions/getUserNote";
import { saveUserNote } from "@/lib/actions/saveUserNote";
import { deleteUserNote } from "@/lib/actions/deleteUserNote";
import Textarea from "../Textarea/Textarea";

export default function NotesDialog({ chatroom, mongoUser, onClose }) {
  const { t } = useTranslation();
  const { toastSet } = useContext();
  const [noteText, setNoteText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasExistingNote, setHasExistingNote] = useState(false);

  // Get the other user in the chatroom (not the current user)
  const otherUser = chatroom?.chatRoomUsers?.find(
    (user) => user._id?.toString() !== mongoUser?._id?.toString()
  );

  useEffect(() => {
    loadNote();
  }, [chatroom?._id]);

  const loadNote = async () => {
    if (!chatroom?._id) return;

    setIsLoading(true);
    try {
      const result = await getUserNote({
        entityType: "chatroom",
        entityId: chatroom._id,
      });

      if (result.success && result.note) {
        setNoteText(result.note.noteText || "");
        setHasExistingNote(true);
      } else {
        setNoteText("");
        setHasExistingNote(false);
      }
    } catch (error) {
      console.error("❌ Error loading note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chatroom?._id || !noteText.trim()) {
      toastSet({
        isOpen: true,
        title: t("error"),
        text: t("noteTextRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveUserNote({
        entityType: "chatroom",
        entityId: chatroom._id,
        noteText: noteText.trim(),
      });

      if (result.success) {
        setHasExistingNote(true);
        toastSet({
          isOpen: true,
          title: t("success"),
          text: t("noteSaved"),
        });
        onClose?.();
      } else {
        throw new Error(result.error || "Failed to save note");
      }
    } catch (error) {
      console.error("❌ Error saving note:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || t("errorSavingNote"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!hasExistingNote) {
      setNoteText("");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUserNote({
        entityType: "chatroom",
        entityId: chatroom._id,
      });

      if (result.success) {
        setNoteText("");
        setHasExistingNote(false);
        toastSet({
          isOpen: true,
          title: t("success"),
          text: t("noteDeleted"),
        });
      } else {
        throw new Error(result.error || "Failed to delete note");
      }
    } catch (error) {
      console.error("❌ Error deleting note:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || t("errorDeletingNote"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-1 w-full max-w-md">
      {/* Header with user info */}
      <div className="mb-4 px-2">
        <CreatedBy
          createdBy={otherUser}
          showName={true}
          className="!gap-3"
          imageClassName="!w-12 !h-12"
          nameClassName="font-medium text-base"
          wrapClassName="cursor-default"
        />
      </div>

      {/* Notes input */}
      <div className="mb-4">
        <Textarea
          label={t("notes")}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          maxLength={1000}
          className="w-full"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-2">
        <Button2
          text={t("clear")}
          variant="outline"
          onClick={handleClear}
          disabled={isDeleting || isSaving || (!noteText && !hasExistingNote)}
          className="flex-1"
        />
        <Button2
          text={t("save")}
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isDeleting || !noteText.trim()}
          className="flex-1"
        />
      </div>
    </div>
  );
}
