"use client";

import { useState, useEffect, useCallback } from "react";

export function useAuctionTimer(auctionItem) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [auctionStatus, setAuctionStatus] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!auctionItem?.auctionStartTime || !auctionItem?.auctionEndTime) {
      return null;
    }

    const now = new Date().getTime();
    const startTime = new Date(auctionItem.auctionStartTime).getTime();
    const endTime = new Date(auctionItem.auctionEndTime).getTime();

    let status = auctionItem.auctionStatus;
    let timeRemaining = null;

    if (now < startTime) {
      // Auction hasn't started yet
      status = "pending";
      timeRemaining = startTime - now;
      setIsActive(false);
    } else if (now >= startTime && now <= endTime) {
      // Auction is active
      status = "active";
      timeRemaining = endTime - now;
      setIsActive(true);
    } else {
      // Auction has ended
      status = "ended";
      timeRemaining = 0;
      setIsActive(false);
    }

    setAuctionStatus(status);
    return timeRemaining;
  }, [
    auctionItem?.auctionStartTime,
    auctionItem?.auctionEndTime,
    auctionItem?.auctionStatus,
  ]);

  const formatTimeLeft = useCallback((milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return null;

    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (days > 0) {
      return {
        days,
        hours,
        minutes,
        seconds,
        formatted: `${days}d ${hours}h ${minutes}m`,
      };
    } else if (hours > 0) {
      return {
        days,
        hours,
        minutes,
        seconds,
        formatted: `${hours}h ${minutes}m ${seconds}s`,
      };
    } else if (minutes > 0) {
      return {
        days,
        hours,
        minutes,
        seconds,
        formatted: `${minutes}m ${seconds}s`,
      };
    } else {
      return { days, hours, minutes, seconds, formatted: `${seconds}s` };
    }
  }, []);

  const getStatusInfo = useCallback(() => {
    switch (auctionStatus) {
      case "pending":
        return {
          label: "Starts in",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
      case "active":
        return {
          label: "Ends in",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "ended":
        return {
          label: "Auction ended",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          label: "Unknown",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
        };
    }
  }, [auctionStatus]);

  const isAuctionActive = useCallback(() => {
    return auctionStatus === "active" && isActive;
  }, [auctionStatus, isActive]);

  const isAuctionEnded = useCallback(() => {
    return (
      auctionStatus === "ended" || (!timeLeft && auctionStatus !== "pending")
    );
  }, [auctionStatus, timeLeft]);

  const hasAuctionStarted = useCallback(() => {
    return auctionStatus === "active" || auctionStatus === "ended";
  }, [auctionStatus]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    // Initial calculation
    updateTimeLeft();

    // Update every second if auction is pending or active
    const interval = setInterval(() => {
      updateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return {
    timeLeft,
    formattedTimeLeft: formatTimeLeft(timeLeft),
    auctionStatus,
    statusInfo: getStatusInfo(),
    isActive: isAuctionActive(),
    isEnded: isAuctionEnded(),
    hasStarted: hasAuctionStarted(),
  };
}
