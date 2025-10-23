import Elysia from "elysia";
import { fileUploadBody, storeFileParams } from "./model";

export const uploadPlugin = new Elysia({ name: "upload/plugin" }).model({
  storeFileParams,
  fileUploadBody,
});
