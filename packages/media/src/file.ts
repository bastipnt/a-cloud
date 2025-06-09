import type { FileType } from "@acloud/db";

export type EncryptedFileData = Omit<FileType, "ownerId" | "parentId">;

export type FileMetadata = {
  fileName: string;
  chunkCount: number;
  fileSize: number;
  lastModifiedMs: number;
};

export type FileData = {
  fileId: string;
  fileDecryptionHeader: Base64URLString | null;
  thumbnailDecryptionHeader: Base64URLString | null;
  fileKey: Base64URLString;
  createdAt: Date;
  updatedAt: Date;
  metadata: FileMetadata;
};
