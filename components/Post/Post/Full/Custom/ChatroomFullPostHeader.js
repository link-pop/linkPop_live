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
      className={`w-full fixed z-[51] top-0 border-b h-[60px] p-2.5 bg-background flex items-center ${
        windowWidth <= MOBILE_SM ? "min-w-full" : ""
      }`}
    >
      {windowWidth <= MOBILE_SM && <BackButton className="mr-2" />}
      <CreatedBy createdBy={personaUserChattingWith} />
    </div>
  );
}
