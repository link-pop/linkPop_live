"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useChat } from "./ChatContext";
import SOCKET_EVENTS from "@/chatServer/constants/socketEvents";
import { usePathname, useRouter } from "next/navigation";
import { useContext as useAppContext } from "./Context";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import getNotificationIcon from "./getNotificationIcon";
import { getOne } from "@/lib/actions/crud";
import NotificationPost from "@/components/Post/Post/Custom/NotificationPost";
import { SITE2 } from "@/config/env";

const NotificationContext = createContext();

// Create a custom hook for throttling function calls
function useThrottle(callback, delay) {
  const lastRun = useRef(0);
  const timeoutRef = useRef(null);

  return (...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;

    if (timeSinceLastRun >= delay) {
      lastRun.current = now;
      return callback(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastRun);
    }
  };
}

export function NotificationProvider({ children, mongoUser }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [userCache, setUserCache] = useState({});
  const { socket, connected } = useChat();
  const pathname = usePathname();
  const lastPathRef = useRef(pathname);
  const initialFetchDoneRef = useRef(false);
  const { toastSet } = useAppContext();
  const router = useRouter();

  // Track if we're already fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);
  // Track the last time we fetched notifications
  const lastFetchTimeRef = useRef(0);
  // Minimum time between fetches (3 seconds)
  const MIN_FETCH_INTERVAL = 3000;

  // Function to fetch user data by ID with cache
  const fetchUserById = async (userId) => {
    if (!userId || SITE2) return null;

    // Check cache first
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const userData = await getOne({
        col: "users",
        data: { _id: userId },
      });

      if (userData) {
        // Update cache
        setUserCache((prev) => ({
          ...prev,
          [userId]: userData,
        }));

        return userData;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    return null;
  };

  // Throttled version of the notification fetch function
  const fetchNotifications = useThrottle((userId) => {
    if (!socket || !connected || isFetchingRef.current || SITE2) return;

    const now = Date.now();
    if (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) return;

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    socket.emit(SOCKET_EVENTS.NOTIFICATION.GET, { userId });
    socket.emit(SOCKET_EVENTS.NOTIFICATION.COUNT, { userId });

    // Reset the fetching flag after a short delay
    setTimeout(() => {
      isFetchingRef.current = false;
    }, 500);
  }, MIN_FETCH_INTERVAL);

  useEffect(() => {
    if (!mongoUser?._id || !socket || !connected || SITE2) return;

    // Only request notifications if this is a new navigation, first load, or page reload
    if (lastPathRef.current !== pathname || !initialFetchDoneRef.current) {
      fetchNotifications(mongoUser._id);
      lastPathRef.current = pathname;
      initialFetchDoneRef.current = true;
    }

    // Process array of notifications
    const processNotifications = (notificationsArray) => {
      if (!Array.isArray(notificationsArray)) return;

      setNotifications(notificationsArray);

      // Update unread count
      const unreadNotifications = notificationsArray.filter((n) => !n.read);
      setUnreadCount(unreadNotifications.length);

      // Fetch user data for all notifications, but batch the requests
      const userIdsToFetch = new Set();
      notificationsArray.forEach((notification) => {
        if (
          notification.sourceUserId &&
          typeof notification.sourceUserId === "string" &&
          !userCache[notification.sourceUserId]
        ) {
          userIdsToFetch.add(notification.sourceUserId);
        }
      });

      // Only fetch users we don't already have in cache
      userIdsToFetch.forEach((userId) => {
        fetchUserById(userId);
      });
    };

    // Listen for notifications
    const handleNotifications = (data) => {
      if (Array.isArray(data)) {
        // Process notifications array
        processNotifications(data);
      } else if (data && typeof data === "object") {
        // Handle single notification object
        setNotifications((prev) => {
          if (!Array.isArray(prev)) {
            prev = []; // Reset to empty array if not an array
          }

          // Check if notification already exists
          const exists = prev.some((n) => n._id === data._id);
          const updatedNotifications = exists
            ? prev.map((n) => (n._id === data._id ? data : n))
            : [data, ...prev];

          // Update unread count
          const unreadNotifications = updatedNotifications.filter(
            (n) => !n.read
          );
          setUnreadCount(unreadNotifications.length);

          // Show toast for new notification
          if (!exists && !data.read) {
            showNotificationToast(data);
          }

          return updatedNotifications;
        });
      }
    };

    // Listen for notification count
    const handleNotificationCount = (data) => {
      if (data?.userId === mongoUser._id) {
        setUnreadCount(data.count);
        // Use the messageCount sent from the server
        if (data.messageCount !== undefined) {
          setMessageCount(data.messageCount);
        }
      }
    };

    // Make sure we remove any existing listeners before adding new ones
    socket.off(SOCKET_EVENTS.NOTIFICATION.USER(mongoUser._id));
    socket.off(SOCKET_EVENTS.NOTIFICATION.COUNT);

    // Add listeners
    socket.on(
      SOCKET_EVENTS.NOTIFICATION.USER(mongoUser._id),
      handleNotifications
    );
    socket.on(SOCKET_EVENTS.NOTIFICATION.COUNT, handleNotificationCount);

    return () => {
      socket.off(
        SOCKET_EVENTS.NOTIFICATION.USER(mongoUser._id),
        handleNotifications
      );
      socket.off(SOCKET_EVENTS.NOTIFICATION.COUNT, handleNotificationCount);
    };
  }, [socket, connected, mongoUser?._id, pathname, userCache]);

  // Handle reconnection with throttling
  useEffect(() => {
    if (
      mongoUser?._id &&
      socket &&
      connected &&
      initialFetchDoneRef.current &&
      !SITE2
    ) {
      fetchNotifications(mongoUser._id);
    }
  }, [connected, socket, mongoUser?._id]);

  // Function to show toast notification
  const showNotificationToast = async (notification) => {
    if (SITE2) return;

    // Don't show toast if we're already on the page the notification is for
    // * KEEP COMMENTED OUT
    // if (notification.link && pathname === notification.link) return;

    // Get user data
    let userData = null;
    if (notification.sourceUserId) {
      // If sourceUserId is a string, fetch the user data
      if (typeof notification.sourceUserId === "string") {
        userData = await fetchUserById(notification.sourceUserId);
      } else {
        // If it's already an object, use it directly
        userData = notification.sourceUserId;
      }
    }

    // Create a copy of the notification with the full user object for sourceUserId
    const notificationWithUserData = {
      ...notification,
      sourceUserId: userData || notification.sourceUserId,
    };

    // Show toast with notification details
    toastSet({
      isOpen: true,
      title: null,
      showIcon: false,
      comp: (
        <NotificationPost
          post={notificationWithUserData}
          col={{ name: "notifications", settings: { noFullPost: true } }}
          showCreatedAtTimeAgo={false}
          showNotificationUnread={false}
          className="border-none"
          onClick={() => {
            router.push(notificationWithUserData.link);
            if (notificationWithUserData.type === "message") {
              setTimeout(() => {
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                });
              }, 1000);
            }
          }}
        />
      ),
    });
  };

  // Throttled version of markAsRead to prevent spam
  const markAsRead = useThrottle((notificationId) => {
    if (!socket || !connected || SITE2) return;
    socket.emit(SOCKET_EVENTS.NOTIFICATION.READ, { notificationId });
  }, 500);

  // Throttled version of markAllAsRead to prevent spam
  const markAllAsRead = useThrottle(() => {
    if (!socket || !connected || !mongoUser?._id || SITE2) return;
    socket.emit(SOCKET_EVENTS.NOTIFICATION.READ_ALL, { userId: mongoUser._id });
  }, 500);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        messageCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
