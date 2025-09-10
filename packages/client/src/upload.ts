import { createCryptoWorker, encryptObject, genFileKeyBase64 } from "@acloud/crypto";
import {
  detectFileType,
  generateAudioThumbnail,
  generateImageThumbnailCanvas,
  generatePDFThumbnail,
  type FileData,
  type FileMetadata,
} from "@acloud/media";
import { api } from "../api";

export class FileSaveError extends Error {
  override name: string = "FileSaveError";
}

export class FileUploadError extends Error {
  override name: string = "FileUploadError";
}

export class ThumbnailUploadError extends Error {
  override name: string = "ThumbnailUploadError";
}

const uploadFile = async (file: File, mainKey: Base64URLString): Promise<FileData> => {
  const fileKey = await genFileKeyBase64();
  const fileType = await detectFileType(file);

  const cryptoWorker = await createCryptoWorker().remote;

  let encryptedThumbnail: File | undefined;
  let thumbnailDecryptionHeader: Base64URLString | undefined;

  if (fileType.mime.startsWith("image/")) {
    const thumbnail = await generateImageThumbnailCanvas(file);
    [encryptedThumbnail, thumbnailDecryptionHeader] = await cryptoWorker.encryptBlobToFile(
      thumbnail,
      fileKey,
    );
  }

  if (fileType.mime === "application/pdf") {
    const thumbnail = await generatePDFThumbnail(file);
    [encryptedThumbnail, thumbnailDecryptionHeader] = await cryptoWorker.encryptBlobToFile(
      thumbnail,
      fileKey,
    );
  }

  if (fileType.mime.startsWith("audio")) {
    const thumbnail = await generateAudioThumbnail(file);

    // [encryptedThumbnail, thumbnailDecryptionHeader] = await cryptoWorker.encryptBlobToFile(
    //   thumbnail,
    //   fileKey,
    // );
  }

  const [encryptedFile, fileParams] = await cryptoWorker.encryptFile(file, fileKey);

  const fileName = file.name;
  const metadata: FileMetadata = {
    fileName,
    chunkCount: fileParams.chunkCount,
    fileSize: fileParams.fileSize,
    lastModifiedMs: fileParams.lastModifiedMs,
    fileType,
  };

  const [encryptedMetadata, metadataDecryptionHeader] = await encryptObject(metadata, fileKey);

  const [encryptedFileKey, fileKeyNonce] = await cryptoWorker.encryptBoxBase64(fileKey, mainKey);

  const fileDecryptionHeader = fileParams.decryptionHeader;

  const res = await api.files.post({
    encryptedFileKey,
    fileKeyNonce,

    fileDecryptionHeader,
    thumbnailDecryptionHeader,

    encryptedMetadata,
    metadataDecryptionHeader,
  });

  if (res.status !== 200) throw new FileSaveError();

  const fileId = res.data!.fileId;

  const uploadRes = await api.upload.file({ fileId }).post({ file: encryptedFile });

  if (uploadRes.status !== 200) throw new FileUploadError();

  if (encryptedThumbnail) {
    const uploadThumbnailRes = await api.upload
      .thumbnail({ fileId })
      .post({ file: encryptedThumbnail });

    if (uploadThumbnailRes.status !== 200) throw new ThumbnailUploadError();
  }

  return {
    fileId,
    fileKey,
    metadata,
    fileDecryptionHeader,
    thumbnailDecryptionHeader: thumbnailDecryptionHeader || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const uploadFiles = async (files: File[], mainKey: Base64URLString) => {
  const uploadedFileIds: FileData[] = [];

  for (const file of files) {
    const fileData = await uploadFile(file, mainKey);
    if (!fileData) console.error("Upload error");
    uploadedFileIds.push(fileData);
  }

  return uploadedFileIds;
};
