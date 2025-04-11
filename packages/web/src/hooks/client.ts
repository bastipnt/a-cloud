import {
  downloadFile,
  finishSignUp,
  getUser,
  proofSignIn,
  signIn,
  signUp,
  uploadStream,
  verifyOTT,
} from "@acloud/client";

export const useClient = () => {
  return {
    uploadStream,
    downloadFile,
    signIn,
    proofSignIn,
    signUp,
    finishSignUp,
    verifyOTT,
    getUser,
  };
};
