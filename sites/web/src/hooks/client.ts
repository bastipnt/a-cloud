import {
  getFile as _getFile,
  getFiles as _getFiles,
  uploadFiles as _uploadFiles,
  finishSignUp,
  getUser,
  loadImage,
  loadThumbnail,
  proofSignIn,
  signIn,
  signOut,
  signUp,
  verifyOTT,
} from "@acloud/client";
import { FileData } from "@acloud/media";
import { useCallback, useContext, useEffect, useState } from "react";
import { KeysContext } from "../providers/KeysProvider";
import { useStorage } from "./storage";

export const useClient = () => {
  const { keyEncryptionKey } = useContext(KeysContext);
  const { getMainKeyBase64 } = useStorage();
  const [mainKey, setMainKey] = useState<Base64URLString>();

  const setMainKeyAsync = useCallback(async () => {
    if (!keyEncryptionKey) return;
    const newMainKey = await getMainKeyBase64(keyEncryptionKey);
    setMainKey(newMainKey);
  }, [keyEncryptionKey]);

  useEffect(() => {
    setMainKeyAsync();
  }, [keyEncryptionKey]);

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

  const uploadFiles = useCallback(
    async (files: File[]): Promise<FileData[] | null> => {
      if (!mainKey) return null;
      return await _uploadFiles(files, mainKey);
    },
    [mainKey],
  );

  return {
    uploadFiles,
    signIn,
    proofSignIn,
    signUp,
    signOut,
    finishSignUp,
    verifyOTT,
    getUser,
    getFiles,
    getFile,
    loadThumbnail,
    loadImage,
  };
};
