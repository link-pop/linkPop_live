import { useContext } from "@/components/Context/Context";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PostCopyText({ post, iconClassName }) {
  const { toastSet } = useContext();
  const { t } = useTranslation();

  const handleCopyText = () => {
    navigator.clipboard.writeText(removeHtmlFromText(post.chatMsgText));
    toastSet({ isOpen: true, title: t("textCopied") });
  };

  return (
    <div onClick={handleCopyText} className={`f g5 fwn ${iconClassName}`}>
      {t("copyMessageText")}
    </div>
  );
}
