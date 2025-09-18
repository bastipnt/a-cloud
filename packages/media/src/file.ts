import type { FileType } from "@acloud/db";
import type { FileTypeResult } from "file-type";

export type EncryptedFileData = Omit<FileType, "ownerId" | "parentId">;

export type FileMetadata = {
  fileName: string;
  chunkCount: number;
  fileSize: number;
  lastModifiedMs: number;
  fileType: FileTypeResult;
};

export type FileData = {
  fileId: string;
  fileDecryptionHeader: Base64URLString | null;
  thumbnailDecryptionHeader: Base64URLString | null;
  fileKey: Base64URLString;
  metadata: FileMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
