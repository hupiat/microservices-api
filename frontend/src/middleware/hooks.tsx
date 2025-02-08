import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import DataStore from "./DataStore";
import { Account, BusinessObject, WorkflowStep } from "../types";
import { API_ACCOUNTS, API_PREFIX } from "./paths";

export type StoreSnapshot<T extends BusinessObject> = [
  Array<T> | null,
  DataStore<T>
];

// Initialization (synchro to API, data fetch)

const useStoreData = <T extends BusinessObject>(
  store: DataStore<T>,
  fetchAll: boolean
): T[] | null => {
  const [data, setData] = useState<T[] | null>(null);

  const getSnapshot = () => data;

  return useSyncExternalStore<T[] | null>(
    (onStoreChange) => {
      const suscriber = (newData: Set<T>) => {
        if (
          !data ||
          newData.size !== data.length ||
          !data.every((item) => newData.has(item))
        ) {
          onStoreChange();
          setData(Array.from(newData));
        }
      };

      const init = async () => {
        // Queries implemented in DataStore.ts
        store.subscribe(suscriber);

        // Fetching base data (getAll)
        if (!store.isSync() && store.hasAPI()) {
          if (fetchAll) {
            await store.fetchAll();
          } else {
            store.emptySynchronize();
          }
        }
      };

      init();

      return () => store.unsubscribe(suscriber);
    },
    getSnapshot,
    getSnapshot
  );
};

// Creation

const useStoreDataCreate = <T extends BusinessObject>(
  path: string,
  fetchAll: boolean = true
): StoreSnapshot<T> => {
  // This one is most generic tho, and can be overrided easily
  // by more relevant workflow
  function logInfo<T extends BusinessObject>(op: WorkflowStep, obj: T) {
    // Toast.show({
    //   type: "success",
    //   text1: op.toLocaleUpperCase(),
    //   text2: "Data has been updated in database",
    // });
    console.log(op, obj);
  }

  // This one is great, and could be even more generic in details message,
  // but still errors should not happen in production, we let them as an "error code"
  // for the users
  const logError = (details: Error) => {
    // Toast.show({
    //   type: "error",
    //   text1: "ERROR WHILE UPDATING DATABASE",
    //   text2: details.message,
    // });
    console.error(details);
  };

  const store = useRef<DataStore<T>>(
    new DataStore<T>(path, logError, logInfo, API_PREFIX)
  );

  useEffect(() => {
    store.current.formatUrlThenSet(path, API_PREFIX);
  }, [path]);

  const data = useStoreData(store.current, fetchAll);
  return [data, store.current];
};

// Business

export const useStoreDataAccounts = (): StoreSnapshot<Account> =>
  useStoreDataCreate<Account>(API_ACCOUNTS, false);
