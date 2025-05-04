import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function ViewMoreCommentsLink({ postId, postType }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    pathname !== `/${postType}/${postId}` && (
      <Link
        href={`/${postType}/${postId}`}
        className="px10 fz15 my10 brand hover:underline"
      >
        {t("viewMoreComments")}
      </Link>
    )
  );
}
