import NotificationTypeSwitch from "../../Custom/MoreThanFriend/NotificationTypeSwitch";

export default function NotificationPostsTopCustomContent({ col, mongoUser }) {
  if (col.name !== "notifications") return null;

  return (
    <div className={`wf`}>
      <NotificationTypeSwitch {...{ mongoUser }} />
    </div>
  );
}
