import { db, filesTable } from "@acloud/db";
import Elysia, { t } from "elysia";
import { withUserId } from "./user";

class FileUploadError extends Error {
  override name: string = "FileUploadError";
}

const fileParams = t.Object({
  fileId: t.String(),
});

const uploadParams = t.Object({
  parentId: t.Optional(t.String()),
  encryptedFileKey: t.String(),
  fileKeyNonce: t.String(),

  metadataDecryptionHeader: t.String(),
  encryptedMetadata: t.String(),

  fileDecryptionHeader: t.Optional(t.String()),
  thumbnailDecryptionHeader: t.Optional(t.String()),
});

type UploadParams = typeof uploadParams.static;

class FileController {
  async getFiles(userId: string) {
    return await db.query.filesTable.findMany({
      where: (f, { eq }) => eq(f.ownerId, userId),
      orderBy: (f, { desc }) => desc(f.createdAt),
      columns: {
        ownerId: false,
        parentId: false,
      },
    });
  }

  async getFile(userId: string, fileId: string) {
    return await db.query.filesTable.findFirst({
      where: (f, { eq, and }) => and(eq(f.ownerId, userId), eq(f.fileId, fileId)),
      columns: {
        ownerId: false,
        parentId: false,
      },
    });
  }

  async saveFile(userId: string, uploadParams: UploadParams) {
    const isDir = !uploadParams.fileDecryptionHeader;

    const fileRes = await db
      .insert(filesTable)
      .values({
        ownerId: userId,
        isDir,
        ...uploadParams,
      })
      .returning({ fileId: filesTable.fileId });

    if (!fileRes || !fileRes[0]) throw new FileUploadError();

    return fileRes[0].fileId;
  }
}

const fileService = new Elysia({ name: "file/service" }).model({ fileParams, uploadParams });

export const fileRoutes = new Elysia({ prefix: "/files" })
  .decorate("fileController", new FileController())
  .use(fileService)
  .use(withUserId)
  .get("/", async ({ fileController, userId }) => {
    const files = await fileController.getFiles(userId);

    return { files };
  })
  .get(
    "/:fileId",
    async ({ params: { fileId }, fileController, userId }) => {
      const file = await fileController.getFile(userId, fileId);

      return { file };
    },
    { params: "fileParams" },
  )
  .post(
    "/",
    async ({ body, fileController, userId }) => {
      const fileId = await fileController.saveFile(userId, body);

      return { message: "saved", fileId };
    },
    { body: "uploadParams" },
  );
