import useWindowWidth from "@/hooks/useWindowWidth";
import CreatedBy from "../../CreatedBy";
import { MOBILE_SM } from "@/lib/utils/constants";
import BackButton from "@/components/ui/shared/BackButton/BackButton";

export default function ChatroomFullPostHeader({ chat, mongoUser }) {
  const { windowWidth } = useWindowWidth();
  const personaUserChattingWith = chat.chatRoomUsers.find(
    (user) => user._id !== mongoUser._id
  );

  return (
    <div
      className={`!w-[598px] !maw-[598px] wf fixed z51 t0 border-b border-l border-r h60 p10 bg-background flex items-center ${
        windowWidth <= MOBILE_SM ? "!miwf" : ""
      }`}
    >
      {windowWidth <= MOBILE_SM && <BackButton className="mr-2" />}
      <CreatedBy createdBy={personaUserChattingWith} />
    </div>
  );
}
