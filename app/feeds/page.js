// !!! DON'T TOUCH THIS FILE !!!

import { MAIN_ROUTE } from "@/lib/utils/constants";
import { redirect } from "next/navigation";

export default function page() {
  // ! VERY SPECIFIC FOR MoreThanFriend =>
  // ! REDIRECT from /feeds (filter logic not working OK) to /
  redirect(MAIN_ROUTE);

  return null;
}
