"use client";

import React, { useState, useContext as _useContext } from "react";
import useRegisterOrReturnMongoUser from "./useRegisterOrReturnMongoUser";
import { NavPositionProvider } from "./NavPositionContext";

const Context = React.createContext();
const useContext = () => _useContext(Context);

function ContextProvider({ children }) {
  // use mongoUser ONLY if there is a SERVER component that is DEEP inside the client components
  // and you can NOT use getMongoUser() in that SERVER component
  const { mongoUser, mongoUserSet } = useRegisterOrReturnMongoUser();

  const [dialog, dialogSet] = useState({
    isOpen: false,
    title: "",
    text: "",
    action: () => {},
  });

  const [toast, toastSet] = useState({
    isOpen: false,
    title: "",
    text: "",
    action: () => {},
    showIcon: true,
  });

  const [isBurgerClicked, isBurgerClickedSet] = useState(false);

  // ! RETURN
  return (
    <Context.Provider
      value={{
        mongoUser,
        mongoUserSet,
        dialog,
        dialogSet,
        toast,
        toastSet,
        isBurgerClicked,
        isBurgerClickedSet,
      }}
    >
      <NavPositionProvider>{children}</NavPositionProvider>
    </Context.Provider>
  );
}

export { ContextProvider, useContext };
