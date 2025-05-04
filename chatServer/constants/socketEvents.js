// * Socket event name constants to prevent typos and make changes easier
const SOCKET_EVENTS = {
  CHAT: {
    MESSAGE: {
      SEND: "chat:message:send",
      RECEIVED: (chatId) => `chat:message:received:${chatId}`,
      DELETE: "chat:message:delete",
      DELETED: (chatId) => `chat:message:deleted:${chatId}`,
      HIDE: "chat:message:hide",
      HIDDEN: (chatId) => `chat:message:hidden:${chatId}`,
      ERROR: "chat:message:error"
    },
    USER: {
      JOIN: "user:join",
      LIST: "user:list"
    },
    ROOM: {
      VIEW: "chat:room:view",
      GET_UNREAD_COUNTS: "chat:room:get_unread_counts",
      UNREAD_COUNTS: "chat:room:unread_counts"
    }
  },
  NOTIFICATION: {
    NEW: "notification:new",
    GET: "notification:get",
    READ: "notification:read",
    READ_ALL: "notification:read:all",
    DELETE: "notification:delete",
    COUNT: "notification:count",
    USER: (userId) => `notification:user:${userId}`
  }
};

module.exports = SOCKET_EVENTS;
