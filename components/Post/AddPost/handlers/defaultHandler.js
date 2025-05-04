import { MAIN_ROUTE } from "@/lib/utils/constants";

export const defaultHandler = ({ res, form, router, toastSet, col, mode }) => {
  if (mode === "add") {
    // router.push(`/${col.name.toLowerCase()}`);
    // router.push(MAIN_ROUTE);
    router.back();
    toastSet({ isOpen: true, title: `${col.name.slice(0, -1)} created` });
  } else {
    // router.push(`/${col.name.toLowerCase()}`);
    // router.push(MAIN_ROUTE);
    router.back();
    toastSet({ isOpen: true, title: `${col.name.slice(0, -1)} updated` });
  }
};
