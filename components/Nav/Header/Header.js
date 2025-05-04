import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import CustomNavigation from "./Custom/CustomNavigation";
import Logo from "./Logo";
import HeaderCartIcon from "@/components/Cart/HeaderCartIcon";
import HeaderLikeIcon from "../../Like/HeaderLikeIcon";
import { getAllMongoCollectionsData } from "@/lib/utils/mongo/getAllMongoCollectionsData";
import HeaderOrderIcon from "./HeaderOrderIcon";
import HeaderReviewIcon from "@/components/Review/HeaderReviewIcon";
import HeaderViewIcon from "@/app/api/analytics/HeaderViewIcon";
import HeaderPostsSearchIcon from "@/components/Post/Search/FromOtherPage/HeaderPostsSearchIcon";

export default async function Header() {
  const { isAdmin, mongoUser } = await getMongoUser();
  const cols = await getAllMongoCollectionsData();
  const headerIconClassName = "abounce gray hover:text-[var(--color-brand)] cp";

  // className "w114" to center nav links (Logo & ClerkSignInButton should have one width)
  return (
    <>
      <header className="fixed t0 l0 z-50 wf bg_glass px-4">
        <div
          className="max-w-[1600px] wf fcc !fwn jcsb mxa h64"
          style={{ flexShrink: 1 }}
        >
          <Logo className="w114" />
          <DesktopNavigation {...{ isAdmin }} />
          <MobileNavigation {...{ isAdmin }} />
          <div className="fcc !fwn g5">
            <HeaderPostsSearchIcon
              {...{ cols, className: headerIconClassName }}
            />
            <div className="hidden min-[390px]:fcc !fwn g5">
              <HeaderViewIcon {...{ cols, className: headerIconClassName }} />
              <HeaderLikeIcon {...{ cols, className: headerIconClassName }} />
              <HeaderReviewIcon {...{ cols, className: headerIconClassName }} />
              <HeaderOrderIcon
                {...{ className: headerIconClassName, mongoUser }}
              />
            </div>
            <HeaderCartIcon {...{ className: headerIconClassName }} />
          </div>
          {/* <CustomNavigation {...{ isAdmin }} /> */}
        </div>
      </header>
      {/* // ! HACK: fixed */}
      <div className="h64 wf bg_white" />
    </>
  );
}
