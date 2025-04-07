import { decryptFile, encryptFile, genNewUserKeys } from "a-crypto";

export const useCrypto = () => {
  return { encryptFile, decryptFile, genNewUserKeys };
};
