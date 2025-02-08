// --------------------------------------
// TECHNICAL
// --------------------------------------

import { JSX } from "react";

export type ContextChildren =
  | JSX.Element
  | JSX.Element[]
  | Array<JSX.Element | undefined>;

export type WorkflowStep = "read" | "add" | "edit" | "delete";

// --------------------------------------
// BUSINESS
// --------------------------------------

export interface BusinessObject {
  id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Account extends BusinessObject {
  email: string;
  name: string;
  password?: string;
}

// -----------------------------------------------------
// OTHERS (utilities)
// -----------------------------------------------------

export type WithoutId<T extends BusinessObject> = Omit<
  Omit<T, "created_at">,
  "id"
> &
  Partial<Pick<T, "id">> &
  Partial<Pick<T, "created_at">>;
