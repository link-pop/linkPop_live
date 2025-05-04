const ChatMessage = require("../models/ChatMessageModel");
const ChatRoom = require("../models/ChatRoomModel");
const SOCKET_EVENTS = require("../constants/socketEvents");

// TODO rename to handleScheduledMessages
// * checks for scheduled messages that have now passed to Update chat room's last message
function startScheduledMessagesHandler(io) {
  setInterval(async () => {
    try {
      const now = new Date();
      // Find messages that were scheduled for a time that has now passed
      const scheduledMessages = await ChatMessage.find({
        $and: [{ scheduleAt: { $lte: now } }, { scheduleAt: { $ne: null } }],
      });

      for (const message of scheduledMessages) {
        // Update chat room's last message
        await ChatRoom.findOneAndUpdate(
          { _id: message.chatRoomId },
          { chatRoomLastMsg: message._id },
          { new: true }
        );

        // Clear scheduleAt to mark it as processed
        await ChatMessage.findByIdAndUpdate(message._id, {
          $set: { scheduleAt: null },
        });

        // Notify clients about the now-active message
        // Client side will handle population of createdBy and other fields
        io.emit(SOCKET_EVENTS.CHAT.MESSAGE.RECEIVED(message.chatRoomId), {
          _id: message._id,
          chatRoomId: message.chatRoomId,
          chatMsgText: message.chatMsgText,
          createdBy: message.createdBy, // Just send the ID, client will populate
          chatMsgStatus: message.chatMsgStatus,
          files: message.files || [],
          expirationPeriod: message.expirationPeriod,
          scheduleAt: null, // Already cleared above
          createdAtOriginal: message.createdAtOriginal,
          chatReplyToMsgId: message.chatReplyToMsgId,
        });
      }
      console.log(`Finished processing scheduled messages at: ${new Date()}`);
    } catch (error) {
      console.error("Error processing scheduled messages:", error);
      io.emit(SOCKET_EVENTS.CHAT.MESSAGE.ERROR, {
        error: "Error processing scheduled messages",
      });
    }
    // TODO !!!!! 1 min
  }, 60000 * 99); // Check every 99 minute 
}

module.exports = startScheduledMessagesHandler;
