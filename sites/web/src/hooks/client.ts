import {
  getFiles as _getFiles,
  finishSignUp,
  getUser,
  loadThumbnail,
  proofSignIn,
  signIn,
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

  return {
    uploadFiles,
    signIn,
    proofSignIn,
    signUp,
    finishSignUp,
    verifyOTT,
    getUser,
    getFiles,
    loadThumbnail,
  };
};
