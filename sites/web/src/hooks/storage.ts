import { KeyParams } from "@acloud/server";
import { useCrypto } from "./crypto";

class MainKeyRetrievalError extends Error {
  name: string = "MainKeyRetrievalError";
}

export const useStorage = () => {
  const { decryptBoxBase64 } = useCrypto();

  const storeEmail = (email: string) => {
    localStorage.setItem("email", email);
  };

  const getEmail = () => {
    return localStorage.getItem("email");
  };

  const storeKeyParams = (keyParams: KeyParams) => {
    localStorage.setItem("keyParams", JSON.stringify(keyParams));
  };

  const storeKeyEncryptionKey = (keyEncryptionKey: Base64URLString) => {
    sessionStorage.setItem("keyEncryptionKey", keyEncryptionKey);
  };

  const getMainKeyBase64 = async () => {
    const rawKeyParams = localStorage.getItem("keyParams");
    const keyEncryptionKey = sessionStorage.getItem("keyEncryptionKey");

    // TODO: likely means user is not logged in correctly -> sign out
    if (!rawKeyParams || !keyEncryptionKey) throw new MainKeyRetrievalError();

    const keyParams = JSON.parse(rawKeyParams) as KeyParams;

    return decryptBoxBase64(keyParams.encryptedMainKey, keyParams.mainKeyNonce, keyEncryptionKey);
  };

  return { storeEmail, getEmail, storeKeyParams, storeKeyEncryptionKey, getMainKeyBase64 };
};
