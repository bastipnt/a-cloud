import {
  getFile as _getFile,
  getFiles as _getFiles,
  uploadFile as _uploadFile,
  CryptoWorkerPool,
  finishSignUp,
  getUser,
  loadFileToUnit8Array,
  loadImage,
  loadThumbnail,
  proofSignIn,
  signIn,
  signOut,
  signUp,
  softDeleteFile,
  verifyOTT,
} from "@acloud/client";
import { FileData } from "@acloud/media";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { KeysContext } from "../providers/KeysProvider";
import { useStorage } from "./storage";

export const useClient = () => {
  const { keyEncryptionKey } = useContext(KeysContext);
  const { getMainKeyBase64 } = useStorage();
  const mainKeyRef = useRef<Base64URLString | null>(null);
  const [mainKey, setMainKey] = useState<Base64URLString | null>(null);

  const setMainKeyAsync = useCallback(async () => {
    if (!keyEncryptionKey) return;
    const newMainKey = await getMainKeyBase64(keyEncryptionKey);
    setMainKey(newMainKey);
    mainKeyRef.current = newMainKey;
  }, [keyEncryptionKey, getMainKeyBase64]);

  useEffect(() => {
    setMainKeyAsync();
  }, [setMainKeyAsync]);

  const getFiles = useCallback(async (): Promise<FileData[]> => {
    if (!mainKey) return [];
    return _getFiles(mainKey);
  }, [mainKey]);

  const getFile = useCallback(
    async (fileId: string): Promise<FileData | null> => {
      if (!mainKey) return null;
      return _getFile(fileId, mainKey);
    },
    [mainKey],
  );

  const uploadFile = useCallback(
    async (file: File, cryptoWorkerPool: CryptoWorkerPool) => {
      if (!mainKey || !cryptoWorkerPool) return null;
      return _uploadFile(file, mainKey, cryptoWorkerPool);
    },
    [mainKey],
  );

  return {
    uploadFile,
    signIn,
    proofSignIn,
    signUp,
    signOut,
    softDeleteFile,
    finishSignUp,
    verifyOTT,
    getUser,
    getFiles,
    getFile,
    loadThumbnail,
    loadImage,
    loadFileToUnit8Array,
  };
};
