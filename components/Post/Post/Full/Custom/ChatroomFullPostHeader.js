import useWindowWidth from "@/hooks/useWindowWidth";
import CreatedBy from "../../CreatedBy";
import { MOBILE_SM } from "@/lib/utils/constants";

export default function ChatroomFullPostHeader({ chat, mongoUser }) {
  const { windowWidth } = useWindowWidth();
  const personaUserChattingWith = chat.chatRoomUsers.find(
    (user) => user._id !== mongoUser._id
  );

  return (
    <div
      className={`z51 pof t0 h60 p10 border-l bg-background wf ${
        windowWidth <= MOBILE_SM && "l49"
      }`}
    >
      <CreatedBy createdBy={personaUserChattingWith} />
    </div>
  );
}
