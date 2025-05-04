"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";
import { usePathname } from "next/navigation";
import { SITE2 } from "@/config/env";

const ChatContext = createContext();

export function ChatProvider({ children, mongoUser }) {
  const [connected, setConnected] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const socketRef = useRef(null);
  const pathname = usePathname();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!mongoUser?._id || SITE2) return;

    const initializeSocket = () => {
      if (socketRef.current && socketRef.current.connected) return;

      const CHAT_SERVER_URL =
        process.env.NEXT_PUBLIC_CHAT_SERVER_URL || "http://localhost:3001";

      const newSocket = io(CHAT_SERVER_URL, {
        transports: ["websocket"],
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        forceNew: false,
        autoConnect: true,
        reconnection: true,
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        newSocket.emit(SOCKET_EVENTS.CHAT.USER.JOIN, mongoUser._id);

        // Request unread counts when connected
        newSocket.emit(SOCKET_EVENTS.CHAT.ROOM.GET_UNREAD_COUNTS, {
          userId: mongoUser._id,
        });
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnected(false);
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log("Max reconnection attempts reached");
          newSocket.disconnect();
        }
      });

      // Listen for unread counts updates
      newSocket.on(SOCKET_EVENTS.CHAT.ROOM.UNREAD_COUNTS, (data) => {
        if (data.userId === mongoUser._id) {
          console.log("Received unread counts:", data.unreadCounts);
          setUnreadCounts(data.unreadCounts);
        }
      });

      // Listen for active users list updates
      newSocket.on(SOCKET_EVENTS.CHAT.USER.LIST, (userList) => {
        console.log("Received active users list:", userList);
        setActiveUsers(userList);
      });

      socketRef.current = newSocket;
    };

    initializeSocket();

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (socketRef.current && !socketRef.current.connected) {
          console.log("Page became visible, reconnecting socket");
          initializeSocket();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.off(SOCKET_EVENTS.CHAT.ROOM.UNREAD_COUNTS);
        socketRef.current.off(SOCKET_EVENTS.CHAT.USER.LIST);
      }
    };
  }, [mongoUser?._id]);

  // Handle pathname changes
  useEffect(() => {
    if (!socketRef.current || !mongoUser?._id || SITE2) return;

    // Ensure socket is connected after navigation
    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, [pathname, mongoUser?._id]);

  // Cleanup socket on application close
  useEffect(() => {
    if (SITE2) return;

    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Mark messages as read when chat room is active
  useEffect(() => {
    if (!socketRef.current || !mongoUser?._id || !activeChatRoom || SITE2)
      return;

    // Emit event to mark messages as read in this chat room
    socketRef.current.emit(SOCKET_EVENTS.CHAT.ROOM.VIEW, {
      chatId: activeChatRoom,
      userId: mongoUser._id,
    });
  }, [activeChatRoom, mongoUser?._id]);

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const setActiveChatRoomId = (chatRoomId) => {
    setActiveChatRoom(chatRoomId);
  };

  const getUnreadCount = (chatRoomId) => {
    return unreadCounts[chatRoomId] || 0;
  };

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  };

  const isUserOnline = (userId) => {
    return activeUsers.includes(userId);
  };

  return (
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        userId: mongoUser?._id,
        replyTo,
        onReply: handleReply,
        onCancelReply: cancelReply,
        unreadCounts,
        getUnreadCount,
        getTotalUnreadCount,
        setActiveChatRoomId,
        activeChatRoom,
        activeUsers,
        isUserOnline,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
