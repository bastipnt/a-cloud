import {
  decryptBoxBase64,
  decryptFile,
  deriveKeyBase64,
  encryptFile,
  genNewUserKeys,
} from "@acloud/crypto";

export const useCrypto = () => {
  return { encryptFile, decryptFile, genNewUserKeys, deriveKeyBase64, decryptBoxBase64 };
};
