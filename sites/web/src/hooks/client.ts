import {
  getFile as _getFile,
  getFiles as _getFiles,
  finishSignUp,
  getUser,
  loadImage,
  loadThumbnail,
  proofSignIn,
  signIn,
  signOut,
  signUp,
  uploadFiles,
  verifyOTT,
} from "@acloud/client";
import { useStorage } from "./storage";

export const useClient = () => {
  const { getMainKeyBase64 } = useStorage();

  const getFiles = async () => {
    const mainKey = await getMainKeyBase64();

    return _getFiles(mainKey);
  };

  const getFile = async (fileId: string) => {
    const mainKey = await getMainKeyBase64();

    return _getFile(fileId, mainKey);
  };

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
