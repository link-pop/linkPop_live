import CreatedBy from "../CreatedBy";

export default function ChatmessagePostCreatedBy({
  post,
  isOwnMessage,
  chatRoomMainPersona,
}) {
  return (
    <>
      {/* // ! don't delete next 3 comments */}
      {/* // * If not a chat room, show created by */}
      {/* // * If not own message, show created by */}
      {/* // * If own message, DO NOT show created by */}
      {chatRoomMainPersona ? (
        chatRoomMainPersona
      ) : (
        <>
          {!isOwnMessage && (
            <CreatedBy
              wrapClassName={`asfe`}
              className="miw40 mih40 !g0 mr5"
              showName={false}
              createdBy={post.createdBy}
            />
          )}
        </>
      )}
    </>
  );
}
