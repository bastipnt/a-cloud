import { UserKeys } from "a-crypto/types";

export const useStorage = () => {
  const storeUserKeys = (userId: string, userKeys: UserKeys) => {
    localStorage.setItem(`userKeys-${userId}`, JSON.stringify(userKeys));
  };

  return { storeUserKeys };
};
