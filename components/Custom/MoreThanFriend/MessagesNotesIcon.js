"use client";

import { NotebookPen } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { useChatSearch } from "@/contexts/ChatSearchContext";
import NotesDialog from "@/components/ui/shared/NotesDialog/NotesDialog";

const MessagesNotesIcon = () => {
  const { t } = useTranslation();
  const { dialogSet, mongoUser } = useContext();
  const { currentChatroom } = useChatSearch();

  const handleNotesClick = () => {
    if (!currentChatroom) {
      console.warn("No current chatroom available for notes");
      return;
    }

    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      showBtns: false,
      contentClassName: "max-w-md p-0",
      comp: (
        <NotesDialog
          chatroom={currentChatroom}
          mongoUser={mongoUser}
          onClose={() => dialogSet({ isOpen: false })}
        />
      ),
    });
  };

  return (
    <div title={t("notes")} onClick={handleNotesClick}>
      <NotebookPen className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesNotesIcon;
