"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getOne } from "@/lib/actions/crud";

/**
 * Custom hook for managing auction item data with real-time updates
 * @param {string} auctionItemId - The auction item ID
 * @param {Object} initialData - Initial auction item data
 * @returns {Object} Auction item data and management functions
 */
export function useAuctionItem(auctionItemId, initialData = null) {
  const queryClient = useQueryClient();

  const {
    data: auctionItem,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auctionItem", auctionItemId],
    queryFn: async () => {
      if (!auctionItemId) return initialData;

      try {
        const result = await getOne({
          col: "storeitems",
          id: auctionItemId,
          populate: ["createdBy", "auctionCurrentBid.bidderId"],
        });

        return result?.error ? initialData : result;
      } catch (error) {
        console.error("❌ Error fetching auction item:", error);
        return initialData;
      }
    },
    enabled: Boolean(auctionItemId),
    initialData: initialData,
    staleTime: 15 * 1000, // 15 seconds - more frequent updates for auction data
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds for live auctions
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Optimistically update auction item after bid placement
  const updateAuctionAfterBid = useCallback(
    (newBidData) => {
      if (!auctionItemId) return;

      queryClient.setQueryData(["auctionItem", auctionItemId], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          auctionCurrentBid: {
            amount: newBidData.amount,
            bidderId: newBidData.bidderId,
            bidTime: newBidData.bidTime || new Date(),
          },
          auctionBids: [
            ...(oldData.auctionBids || []),
            {
              bidderId: newBidData.bidderId,
              amount: newBidData.amount,
              bidTime: newBidData.bidTime || new Date(),
              isWinning: true,
            },
          ],
        };
      });
    },
    [auctionItemId, queryClient]
  );

  // Update auction item after buy now
  const updateAuctionAfterBuyNow = useCallback(
    (buyerData) => {
      if (!auctionItemId) return;

      queryClient.setQueryData(["auctionItem", auctionItemId], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          auctionStatus: "ended",
          auctionWinnerId: buyerData.buyerId,
          auctionCurrentBid: {
            amount: oldData.auctionBuyNowPrice,
            bidderId: buyerData.buyerId,
            bidTime: new Date(),
          },
        };
      });
    },
    [auctionItemId, queryClient]
  );

  // Invalidate and refetch auction data
  const refreshAuctionData = useCallback(async () => {
    if (!auctionItemId) return;

    queryClient.invalidateQueries(["auctionItem", auctionItemId]);
    return await refetch();
  }, [auctionItemId, queryClient, refetch]);

  // Invalidate related queries (e.g., store items list)
  const invalidateRelatedQueries = useCallback(() => {
    // Invalidate store items queries that might include this auction
    queryClient.invalidateQueries(["storeItems"]);
    queryClient.invalidateQueries(["posts", "storeitems"]);
  }, [queryClient]);

  return {
    auctionItem,
    isLoading,
    error,
    refetch,
    updateAuctionAfterBid,
    updateAuctionAfterBuyNow,
    refreshAuctionData,
    invalidateRelatedQueries,
  };
}
