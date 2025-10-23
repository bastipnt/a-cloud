import { t } from "elysia";

export class FileDataUploadError extends Error {
  override name: string = "FileDataUploadError";
}

export const fileDataParams = t.Object({
  fileId: t.String(),
});

export const uploadParams = t.Object({
  parentId: t.Optional(t.String()),
  encryptedFileKey: t.String(),
  fileKeyNonce: t.String(),

  metadataDecryptionHeader: t.String(),
  encryptedMetadata: t.String(),

  fileDecryptionHeader: t.Optional(t.String()),
  thumbnailDecryptionHeader: t.Optional(t.String()),
});

export type UploadParams = typeof uploadParams.static;
