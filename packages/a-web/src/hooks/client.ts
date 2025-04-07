import { uploadStream, downloadFile, createNewUser } from "a-client";

export const useClient = () => {
  return { uploadStream, downloadFile, createNewUser };
};
