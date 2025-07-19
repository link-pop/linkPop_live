import { createContext, useState } from "react";

export const ContentDepotContext = createContext();

export const ContentDepotProvider = ({ children }) => {
  const [contentDepotSearchResults, setContentDepotSearchResults] =
    useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [refreshUserLists, setRefreshUserLists] = useState(null);
  const [currentList, setCurrentList] = useState(null);

  return (
    <ContentDepotContext.Provider
      value={{
        contentDepotSearchResults,
        setContentDepotSearchResults,
        mongoUser,
        setMongoUser,
        refreshUserLists,
        setRefreshUserLists,
        currentList,
        setCurrentList,
      }}
    >
      {children}
    </ContentDepotContext.Provider>
  );
};
