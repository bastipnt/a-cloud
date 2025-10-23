import { db, eq, filesTable } from "@acloud/db";
import { dataDir, FileStoreError } from "./model";

export abstract class UploadService {
  static async storeFile(userId: string, fileId: string, file: File, isThumbnail = false) {
    const fileType = isThumbnail ? "thumbnail" : "file";
    const bytes = await Bun.write([dataDir, userId, fileType, fileId].join("/"), file);
    if (bytes === 0) throw new FileStoreError();

    await db.update(filesTable).set({ isLocal: true }).where(eq(filesTable.fileId, fileId));
  }
}
