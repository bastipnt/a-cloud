import Elysia from "elysia";
import { fileDataParams, uploadParams } from "./model";

export const fileDataPlugin = new Elysia({ name: "fileData/plugin" }).model({
  fileDataParams,
  uploadParams,
});
