import { createContext, useState } from "react";

export const ContentDepotContext = createContext();

export const ContentDepotProvider = ({ children }) => {
  const [contentDepotSearchResults, setContentDepotSearchResults] =
    useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [refreshUserLists, setRefreshUserLists] = useState(null);

  return (
    <ContentDepotContext.Provider
      value={{
        contentDepotSearchResults,
        setContentDepotSearchResults,
        mongoUser,
        setMongoUser,
        refreshUserLists,
        setRefreshUserLists,
      }}
    >
      {children}
    </ContentDepotContext.Provider>
  );
};
