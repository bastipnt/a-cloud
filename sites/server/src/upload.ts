import { resolve } from "path";
import { db, eq, filesTable } from "@acloud/db";
import Elysia, { t } from "elysia";
import { withUserId } from "./user";

// TODO: make configable
export const dataDir = resolve(__dirname, "../../../data");

class FileStoreError extends Error {
  override name: string = "FileStoreError";
}

const fileUploadBody = t.Object({
  file: t.File(),
});

const storeFileParams = t.Object({
  fileId: t.String(),
});

class UploadController {
  async storeFile(userId: string, fileId: string, file: File, isThumbnail = false) {
    const fileType = isThumbnail ? "thumbnail" : "file";
    const bytes = await Bun.write([dataDir, userId, fileType, fileId].join("/"), file);
    if (bytes === 0) throw new FileStoreError();

    await db.update(filesTable).set({ isLocal: true }).where(eq(filesTable.fileId, fileId));
  }
}

const uploadService = new Elysia({ name: "upload/service" }).model({
  storeFileParams,
  fileUploadBody,
});

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(withUserId)
  .use(uploadService)
  .decorate("uploadController", new UploadController())
  .post(
    "/file/:fileId",
    async ({ body: { file }, params: { fileId }, uploadController, userId }) => {
      await uploadController.storeFile(userId, fileId, file);

      return { message: "stored file", fileId };
    },
    {
      body: "fileUploadBody",
      params: "storeFileParams",
    },
  )
  .post(
    "/thumbnail/:fileId",
    async ({ body: { file }, params: { fileId }, uploadController, userId }) => {
      await uploadController.storeFile(userId, fileId, file, true);

      return { message: "stored file", fileId };
    },
    {
      body: "fileUploadBody",
      params: "storeFileParams",
    },
  );
