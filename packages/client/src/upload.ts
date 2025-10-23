import { genFileKeyBase64 } from "@acloud/crypto";
import {
  detectFileType,
  generateAudioThumbnail,
  generateImageThumbnailCanvas,
  generatePDFThumbnail,
  type FileData,
  type FileMetadata,
  type FileTypeResult,
} from "@acloud/media";
import { api } from "../api";
import type { CryptoWorkerPool } from "./worker-pools/crypto-worker-pool";

class FileInfoUploadError extends Error {
  override name: string = "FileInfoUploadError";
}

class FileUploadError extends Error {
  override name: string = "FileUploadError";
}

class ThumbnailUploadError extends Error {
  override name: string = "ThumbnailUploadError";
}

const generateThumbnail = async (
  file: File,
  fileType: FileTypeResult,
): Promise<Blob | undefined> => {
  if (fileType.mime.startsWith("image/")) {
    return generateImageThumbnailCanvas(file);
  }

  if (fileType.mime === "application/pdf") {
    return generatePDFThumbnail(file);
  }

  if (fileType.mime.startsWith("audio")) {
    return generateAudioThumbnail(file);
  }

  return undefined;
};

export const uploadFile = async (
  file: File,
  mainKey: Base64URLString,
  cryptoWorkerPool: CryptoWorkerPool,
): Promise<FileData> => {
  const fileKey = await genFileKeyBase64();
  const fileType = await detectFileType(file);
  const thumbnail = await generateThumbnail(file, fileType);

  let [encryptedThumbnail, thumbnailDecryptionHeader]: [
    File | undefined,
    Base64URLString | undefined,
  ] = [undefined, undefined];

  if (thumbnail) {
    [encryptedThumbnail, thumbnailDecryptionHeader] = await cryptoWorkerPool.encryptBlobToFile(
      thumbnail,
      await thumbnail.arrayBuffer(),
      fileKey,
    );
  }

  const [encryptedFile, fileParams] = await cryptoWorkerPool.encryptFile(
    file,
    await file.arrayBuffer(),
    fileKey,
  );

  const metadata: FileMetadata = {
    fileName: file.name,
    chunkCount: fileParams.chunkCount,
    fileSize: fileParams.fileSize,
    lastModifiedMs: fileParams.lastModifiedMs,
    fileType,
  };

  const [encryptedMetadata, metadataDecryptionHeader] = await cryptoWorkerPool.encryptObject(
    metadata,
    fileKey,
  );

  const [encryptedFileKey, fileKeyNonce] = await cryptoWorkerPool.encryptBoxBase64(
    fileKey,
    mainKey,
  );

  const fileDecryptionHeader = fileParams.decryptionHeader;

  const fileInfoRes = await api.files.post({
    encryptedFileKey,
    fileKeyNonce,

    fileDecryptionHeader,
    thumbnailDecryptionHeader,

    encryptedMetadata,
    metadataDecryptionHeader,
  });
  if (fileInfoRes.status !== 200 || !fileInfoRes.data) throw new FileInfoUploadError();

  const { fileId } = fileInfoRes.data;

  const fileUploadRes = await api.upload.file({ fileId }).post({ file: encryptedFile });
  if (fileUploadRes.status !== 200) throw new FileUploadError();

  if (encryptedThumbnail) {
    const thumbnailUploadRes = await api.upload
      .thumbnail({ fileId })
      .post({ file: encryptedThumbnail });
    if (thumbnailUploadRes.status !== 200) throw new ThumbnailUploadError();
  }

  return {
    fileId,
    fileKey,
    metadata,
    fileDecryptionHeader,
    thumbnailDecryptionHeader: thumbnailDecryptionHeader || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
};
