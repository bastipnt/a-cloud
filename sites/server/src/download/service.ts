import { dataDir } from "../upload/model";

export abstract class DownloadService {
  static getFile(userId: string, fileId: string, isThumbnail: boolean) {
    const fileType = isThumbnail ? "thumbnail" : "file";

    return Bun.file([dataDir, userId, fileType, fileId].join("/"));
  }
}
