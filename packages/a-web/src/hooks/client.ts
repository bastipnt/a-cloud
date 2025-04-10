import {
  downloadFile,
  finishSignUp,
  getUser,
  proofSignIn,
  signIn,
  signUp,
  uploadStream,
  verifyOTT,
} from "a-client";

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
