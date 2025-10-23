import { and, db, eq, filesTable, getDateNow } from "@acloud/db";
import { FileDataUploadError, UploadParams } from "./model";

export abstract class FileDataService {
  static async getFiles(userId: string) {
    return await db.query.filesTable.findMany({
      where: (f, { eq, and, isNull }) => and(eq(f.ownerId, userId), isNull(f.deletedAt)),
      orderBy: (f, { desc }) => desc(f.createdAt),
      columns: {
        ownerId: false,
        parentId: false,
      },
    });
  }

  static async getFile(userId: string, fileId: string) {
    return await db.query.filesTable.findFirst({
      where: (f, { eq, and }) => and(eq(f.ownerId, userId), eq(f.fileId, fileId)),
      columns: {
        ownerId: false,
        parentId: false,
      },
    });
  }

  static async saveFile(userId: string, uploadParams: UploadParams) {
    const isDir = !uploadParams.fileDecryptionHeader;

    const fileRes = await db
      .insert(filesTable)
      .values({
        ownerId: userId,
        isDir,
        ...uploadParams,
      })
      .returning({ fileId: filesTable.fileId });

    if (!fileRes || !fileRes[0]) throw new FileDataUploadError();

    return fileRes[0].fileId;
  }

  // TODO: if isDir also delete children
  static async softDeleteFile(userId: string, fileId: string) {
    await db
      .update(filesTable)
      .set({ deletedAt: getDateNow() })
      .where(and(eq(filesTable.ownerId, userId), eq(filesTable.fileId, fileId)));
  }
}
