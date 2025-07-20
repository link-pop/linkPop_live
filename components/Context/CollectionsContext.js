"use client";

import { createContext, useState } from "react";

export const CollectionsContext = createContext();

export const CollectionsProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [mongoUser, setMongoUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(null);
  const [collectionsSearchResults, setCollectionsSearchResults] =
    useState(null);
  const [refreshUserLists, setRefreshUserLists] = useState(null);
  const [currentList, setCurrentList] = useState(null);

  return (
    <CollectionsContext.Provider
      value={{
        subscriptions,
        setSubscriptions,
        subscribers,
        setSubscribers,
        customLists,
        setCustomLists,
        mongoUser,
        setMongoUser,
        isLoading,
        setIsLoading,
        refreshData,
        setRefreshData,
        collectionsSearchResults,
        setCollectionsSearchResults,
        refreshUserLists,
        setRefreshUserLists,
        currentList,
        setCurrentList,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};
