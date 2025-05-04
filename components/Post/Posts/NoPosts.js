import { useTranslation } from "@/components/Context/TranslationContext";
import { usePathname, useRouter } from "next/navigation";

export default function NoPosts({ col }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = localStorage.getItem("theme") || "light";
  const themeImg =
    theme === "light" ? "/img/noPosts.svg" : "/img/noPostsDark.svg";
  const { t } = useTranslation();

  const dropSearchParams = () => {
    router.push(`/${col.name.toLowerCase()}`);
  };

  // Feeds: all other is null
  return ["/feeds", "/users"].includes(`/${col.name.toLowerCase()}`) ? (
    <div className="👋 por fcc wf cp" onClick={dropSearchParams}>
      <img className="wf ha" src={themeImg} />
    </div>
  ) : ["/chatrooms"].includes(pathname) ? (
    <div className="mxa mt30 px15 tac miwf">{t("noMessages")}</div>
  ) : ["/notifications"].includes(pathname) ? (
    <div className="mxa mt30 px15 tac miwf">{t("noNotifications")}</div>
  ) : ["/products", "/articles"].includes(pathname) ? (
    <div
      className="👋 por fcc wf cp motion-preset-bounce"
      onClick={dropSearchParams}
    >
      <div className="poa white tracking-[1px] t5 zi2 fz11 wf tac">
        no {col.name} found
      </div>
      <div className="poa tdu text-red-200 tracking-[1px] t82 zi2 fz11 wf tac">
        clear filters
      </div>
      <img className="w200 ha hover:saturate-[.3]" src="/img/404.svg" />
    </div>
  ) : (
    <div className="👋 fcc wf h300">
      <div className="fz14 tracking-[1px] gray">{t("noPosts")}</div>
    </div>
  );
}
