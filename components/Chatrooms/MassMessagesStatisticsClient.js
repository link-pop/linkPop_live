"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getMassMessagesStatistics } from "@/lib/actions/getMassMessagesStatistics";
import MassMessagesStatisticsTable from "./MassMessagesStatisticsTable";
import MassMessagesTypeSwitch from "./MassMessagesTypeSwitch";
import PostsLoader from "@/components/Post/Posts/PostsLoader";
import Button from "@/components/ui/shared/Button/Button2";
import { useRouter, useSearchParams } from "next/navigation";

// * Client component for mass messages statistics
export default function MassMessagesStatisticsClient({ mongoUser, isAdmin }) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [massMessages, setMassMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const messageType = searchParams.get("messageType") || "all";
      const searchQuery = searchParams.get("q") || "";
      const result = await getMassMessagesStatistics({
        limit: 50,
        messageType,
        searchQuery,
      });

      if (result.success) {
        setMassMessages(result.massMessages);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("❌ Error fetching mass messages statistics:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const handleBackClick = () => {
    router.push("/chatrooms");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <PostsLoader isLoading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button text={t("goBack")} onClick={handleBackClick} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto">
      {/* Type Switch */}
      <MassMessagesTypeSwitch mongoUser={mongoUser} />

      {/* Statistics Table */}
      {massMessages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <div className="text-lg mb-2">
            {searchParams.get("q")
              ? "No messages match your search"
              : "No mass messages found"}
          </div>
          <div className="text-sm mb-4">
            {searchParams.get("q")
              ? "Try adjusting your search terms"
              : "Send your first mass message to see statistics here"}
          </div>
          <Button
            text={t("newMessage")}
            onClick={() => router.push("/chatrooms/send")}
            className="mt-4"
          />
        </div>
      ) : (
        <MassMessagesStatisticsTable
          massMessages={massMessages}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
