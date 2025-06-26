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
      READ_STATUS_UPDATED: (chatId) =>
        `chat:message:read_status_updated:${chatId}`,
      ERROR: "chat:message:error",
    },
    USER: {
      JOIN: "user:join",
      LIST: "user:list",
    },
    ROOM: {
      VIEW: "chat:room:view",
      GET_UNREAD_COUNTS: "chat:room:get_unread_counts",
      UNREAD_COUNTS: "chat:room:unread_counts",
    },
  },
  NOTIFICATION: {
    NEW: "notification:new",
    GET: "notification:get",
    READ: "notification:read",
    READ_ALL: "notification:read:all",
    DELETE: "notification:delete",
    COUNT: "notification:count",
    USER: (userId) => `notification:user:${userId}`,
    ERROR: "notification:error",
    BATCH_COMPLETE: "notification:batch_complete",
  },
  STORE: {
    AUCTION: {
      STARTED: "store:auction:started",
      ENDED: "store:auction:ended",
      ENDED_NO_BIDS: "store:auction:ended_no_bids",
      WON: "store:auction:won",
      SOLD: "store:auction:sold",
      BID_PLACED: "store:auction:bid_placed",
      OUTBID: "store:auction:outbid",
      UPDATED: "store:auction:updated",
      ERROR: "store:auction:error",
      BIDDER_NOTIFICATION: "store:auction:bidder_notification",
      BID_RESTRICTED: (userId) => `auction:bid_restricted:${userId}`,
      MONITOR_ERROR: "auction:monitor_error",
    },
  },
};

module.exports = SOCKET_EVENTS;
