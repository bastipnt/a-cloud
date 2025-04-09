import {
  uploadStream,
  downloadFile,
  signUp,
  finishSignUp,
  verifyOTT,
  signIn,
  proofSignIn,
  getUser,
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
