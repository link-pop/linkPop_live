"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function AddStoreItemButton({ mongoUser, visitedMongoUser }) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Refresh store items when component mounts (useful when navigating back)
  useEffect(() => {
    queryClient.invalidateQueries(["storeItems", visitedMongoUser?._id]);
  }, [queryClient, visitedMongoUser?._id]);

  const handleAddStoreItem = () => {
    router.push("/add/storeitems");
  };

  return (
    <button
      onClick={handleAddStoreItem}
      className="f aic g10 px20 py10 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors"
    >
      <Plus size={20} />
      <span>{t("addStoreItem")}</span>
    </button>
  );
}
