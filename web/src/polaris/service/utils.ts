import { READ_ONLY_NAMESPACE } from "./types";

export const isReadOnly = (namespace: string) => {
  return READ_ONLY_NAMESPACE.indexOf(namespace) !== -1;
};
