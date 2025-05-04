import ChatmessagePost from "@/components/Post/Post/Custom/ChatmessagePost";
import UpdateWelcomeMessageButton from "./UpdateWelcomeMessageButton";
import DeleteWelcomeMessageButton from "./DeleteWelcomeMessageButton";
import AddWelcomeMessageForm from "./AddWelcomeMessageForm";
import WelcomeMessageToggle from "./WelcomeMessageToggle";

export default function WelcomeMessage({ mongoUser }) {
  const isWelcomeMessageEnabled = mongoUser?.welcomeMessageSend !== false;

  return (
    <div>
      {mongoUser?.welcomeMessage ? (
        <div>
          <WelcomeMessageToggle mongoUser={mongoUser}>
            <div className={`${isWelcomeMessageEnabled ? "" : "op3"}`}>
              <ChatmessagePost
                post={mongoUser.welcomeMessage}
                mongoUser={mongoUser}
                col={{
                  name: "chatmessages",
                  settings: { noFullPost: true, noOtherIcons: true },
                }}
              />
            </div>

            <div className={`f jce aic`}>
              <UpdateWelcomeMessageButton {...{ mongoUser }} />
              <DeleteWelcomeMessageButton />
            </div>
          </WelcomeMessageToggle>
        </div>
      ) : (
        <div>
          <AddWelcomeMessageForm {...{ mongoUser }} />
        </div>
      )}
    </div>
  );
}
