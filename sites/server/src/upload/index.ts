import Elysia from "elysia";
import { withUserIdPlugin } from "../user/plugins";
import { uploadPlugin } from "./plugins";
import { UploadService } from "./service";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(withUserIdPlugin)
  .use(uploadPlugin)
  .decorate("uploadService", UploadService)
  .post(
    "/file/:fileId",
    async ({ body: { file }, params: { fileId }, uploadService, userId }) => {
      await uploadService.storeFile(userId, fileId, file);

      return { message: "stored file", fileId };
    },
    {
      body: "fileUploadBody",
      params: "storeFileParams",
    },
  )
  .post(
    "/thumbnail/:fileId",
    async ({ body: { file }, params: { fileId }, uploadService, userId }) => {
      await uploadService.storeFile(userId, fileId, file, true);

      return { message: "stored file", fileId };
    },
    {
      body: "fileUploadBody",
      params: "storeFileParams",
    },
  );
