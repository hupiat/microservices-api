import React, { Dispatch, SetStateAction, useState } from "react";
import { useContext } from "react";
import { Account, ContextChildren } from "../types";
import DataStore from "./DataStore";
import { API_ACCOUNTS, API_PREFIX } from "./paths";

interface IMiddlewareContext {
  user: Account | null;
  setUser: (user: Account | null) => Promise<void>;
  setUserState: Dispatch<SetStateAction<Account | null>>;
}

const SetupMiddlewareContext = React.createContext<
  IMiddlewareContext | undefined
>(undefined);

interface IProps {
  children?: ContextChildren;
}

const MiddlewareContext = ({ children }: IProps) => {
  const [user, setUserState] = useState<Account | null>(null);

  // State reducer (login + logout)
  const setUser = async (user: Account | null): Promise<void> => {
    if (!user) {
      await DataStore.doFetch(`${API_PREFIX}/${API_ACCOUNTS}/logout`, (url) =>
        fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      );
      localStorage.clear();
      setUserState(null);
    } else {
      const res = await DataStore.doFetch(
        `${API_PREFIX}/${API_ACCOUNTS}/login`,
        (url) =>
          fetch(url, {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              password: user.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          })
      );
      if (res!.status === 404) {
        throw Error("Bad credentials");
      } else {
        const json = await res!.json();
        localStorage.setItem("token", json.token);
        setUserState(user);
      }
    }
  };

  return (
    <SetupMiddlewareContext.Provider
      value={{
        user,
        setUser,
        setUserState,
      }}
    >
      {children}
    </SetupMiddlewareContext.Provider>
  );
};

export const useMiddlewareContext = (): IMiddlewareContext => {
  const context = useContext(SetupMiddlewareContext);
  if (!context) {
    throw Error("Context is not mounted");
  }
  return context;
};

export default MiddlewareContext;
