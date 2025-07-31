"use client";

import { useState, useEffect, useCallback } from "react";
import { getOne } from "@/lib/actions/crud";

export default function usePollDataWithRefetch(pollId) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPoll = useCallback(async () => {
    if (!pollId) {
      setPoll(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pollData = await getOne({
        col: "polls",
        data: { _id: pollId },
      });

      if (pollData.error) {
        setError(pollData.error);
      } else {
        setPoll(pollData);
      }
    } catch (err) {
      console.error("❌ Error fetching poll:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  return { poll, loading, error, refetch: fetchPoll };
}
