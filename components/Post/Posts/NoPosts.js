import { useTranslation } from "@/components/Context/TranslationContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function NoPosts({ col = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = localStorage.getItem("theme") || "light";
  const themeImg =
    theme === "light" ? "/img/noPosts.svg" : "/img/noPostsDark.svg";
  const { t } = useTranslation();

  // Feeds: all other is null
  return ["/feeds", "/users"].includes(`/${col?.name.toLowerCase()}`) ? (
    <div className="👋 por maw600 fcc wf cp">
      <img className="wf ha" src={themeImg} />
    </div>
  ) : ["/chatrooms"].includes(pathname) ? (
    <div className="mxa mt30 px15 tac miwf">
      {searchParams.has("chatId")
        ? t("noMessages")
        : t("pleaseSubscribeToACreatorToAccessThisFeature")}
    </div>
  ) : ["/notifications"].includes(pathname) ? (
    <div className="mxa mt30 px15 tac miwf">{t("noNotifications")}</div>
  ) : ["/products", "/articles"].includes(pathname) ? (
    <div className="👋 por fcc wf cp motion-preset-bounce">
      <div className="poa white tracking-[1px] t5 zi2 fz11 wf tac">
        no {col?.name} found
      </div>
      <div className="poa tdu text-red-200 tracking-[1px] t82 zi2 fz11 wf tac">
        clear filters
      </div>
      <img className="w200 ha hover:saturate-[.3]" src="/img/404.svg" />
    </div>
  ) : (
    <div className="👋 por maw600 fcc wf cp">
      <img className="wf ha" src={themeImg} />
    </div>
  );
}
