import { BusinessObject, WithoutId, WorkflowStep } from "../types";

// Observable pattern
export default class DataStore<T extends BusinessObject> {
  private static logError: (details: Error) => void;
  private static logInfo: <T extends BusinessObject>(
    op: WorkflowStep,
    obj: T
  ) => void;

  private url?: string;
  private subscribers = new Set<(data: Set<T>) => void>();

  // Should be readonly but as a low level stub would be just a ts thing
  // data is stated then in react components
  data?: Set<T>;

  // Init server API
  formatUrlThenSet(url: string, apiPrefix?: string): DataStore<T> {
    this.url = undefined;
    if (apiPrefix) {
      url = url.trim();
      const split = url.split("/");
      if (split[0].toLocaleLowerCase() === apiPrefix.toLocaleLowerCase()) {
        split.shift();
        url = split.join("/");
      }
      this.url = apiPrefix + "/" + url;
    }
    return this;
  }

  constructor(
    url: string,
    logError: (details: Error) => void,
    logInfo: <T extends BusinessObject>(op: WorkflowStep, obj: T) => void,
    apiPrefix?: string
  ) {
    DataStore.logError = logError;
    DataStore.logInfo = logInfo;
    this.formatUrlThenSet(url, apiPrefix);
  }

  // Utilities

  isSync(): boolean {
    return this.hasAPI() && !!this.data;
  }

  hasSuscribers(): boolean {
    return this.subscribers.size !== 0;
  }

  hasAPI(): boolean {
    return !!this.url;
  }

  static async doFetch(
    url: string,
    callback: (url: string) => Promise<Response>,
    shouldLog: boolean = true
  ): Promise<Response | undefined> {
    try {
      const res = await callback(url);
      if (!res.ok) {
        throw Error("Server error");
      }
      return res;
    } catch (e) {
      if (shouldLog) {
        this.logError(e as Error);
      }
      throw e;
    }
  }

  // data is public, stay private (to use a Set)
  private getById(id: number): T | undefined {
    if (this.data) {
      let other;
      for (const otherObj of this.data) {
        if (otherObj.id === id) {
          other = otherObj;
          break;
        }
      }
      return other;
    }
  }

  // Suscribers
  // Listeners should update React states and manage data flow from this class

  private notify(): void {
    if (this.isSync()) {
      this.subscribers.forEach((notify) => notify(this.data!));
    }
  }

  subscribe(notify: (data: Set<T>) => void): void {
    this.subscribers.add(notify);
  }

  unsubscribe(notify: (data: Set<T>) => void): void {
    this.subscribers.delete(notify);
  }

  emptySynchronize(): void {
    if (!this.hasAPI()) {
      throw Error(
        "DataStore#emptySynchronize: cannot perform unless API uri is provided"
      );
    }
    this.data = new Set<T>();
    this.notify();
  }

  // Loads from server

  async fetchAll(longitude?: number, latitude?: number): Promise<void> {
    await DataStore.doFetch(this.url!, async (url) => {
      if (longitude && latitude) {
        url = url + `/${longitude}/${latitude}`;
      }
      this.data?.clear(); // Better cleaning up for js engine
      this.data = undefined;
      const res = await fetch(url);
      this.data = new Set(await res.json());
      this.notify();
      return res;
    });
  }

  async fetchById(id: number): Promise<void> {
    await DataStore.doFetch(this.url! + "/" + id, async (url) => {
      const res = await fetch(url);
      const obj = await res.json();
      if (this.data) {
        const other = this.getById(id);
        if (other) {
          this.data.delete(other);
        }
      } else {
        this.data = new Set<T>();
      }
      this.data.add(obj);
      this.notify();
      DataStore.logInfo("read", obj);
      return res;
    });
  }

  // Update store remotely
  // Designed to lead backend API design itself =)

  private checkForSyncBeforeProcessing(): void {
    if (!this.isSync()) {
      throw Error(
        "DataStore#checkForSyncBeforeProcessing: cannot perform unless data is fetched"
      );
    }
  }

  async add(obj: WithoutId<T>): Promise<void> {
    this.checkForSyncBeforeProcessing();
    await DataStore.doFetch(this.url!, async (url) => {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res!.json();
      obj.id = json.id;
      obj.created_at = json.created_at;
      this.data!.add(obj as T);
      this.notify();
      DataStore.logInfo("add", obj as BusinessObject);
      return res;
    });
  }

  async update(obj: T): Promise<void> {
    this.checkForSyncBeforeProcessing();
    await DataStore.doFetch(this.url!, async (url) => {
      const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json",
        },
      });
      obj = await res.json();
      const local = this.getById(obj.id);
      if (local) {
        this.data!.delete(local);
      }
      this.data!.add(obj);
      this.notify();
      DataStore.logInfo("edit", obj);
      return res;
    });
  }

  async delete(id: number): Promise<Boolean> {
    this.checkForSyncBeforeProcessing();
    let ok = false;
    await DataStore.doFetch(this.url! + "/" + id, async (url) => {
      const res = await fetch(url, {
        method: "DELETE",
      });
      const local = this.getById(id);
      ok = res.ok;
      if (local && ok) {
        // query should throws an exception but nvm
        this.data!.delete(local);
        this.notify();
        DataStore.logInfo("delete", local);
      }
      return res;
    });
    return ok;
  }
}
