import { decryptFile, decryptFileToUnit8Array } from "@acloud/crypto";
import { api } from "../api";

class FileDownloadError extends Error {
  override name: string = "FileDownloadError";
}

export type LoadThumbnailParams = {
  fileId: string;
  fileName: string;
  fileKey: Base64URLString;
  thumbnailDecryptionHeader: Base64URLString;
};

export const loadThumbnail = async ({
  fileId,
  fileName,
  fileKey,
  thumbnailDecryptionHeader,
}: LoadThumbnailParams) => {
  const res = await api.download.thumbnail({ fileId }).get();

  if (res.status !== 200 || !res.data) throw new FileDownloadError();
  const encryptedFileData = new Uint8Array(res.data as unknown as ArrayBuffer);

  return decryptFile(encryptedFileData, fileKey, thumbnailDecryptionHeader, fileName);
};

export type LoadImageParams = {
  fileId: string;
  fileName: string;
  fileKey: Base64URLString;
  fileDecryptionHeader: Base64URLString;
  chunkCount: number;
};

export const loadImage = async ({
  fileId,
  fileName,
  fileKey,
  fileDecryptionHeader,
  chunkCount,
}: LoadImageParams) => {
  const res = await api.download({ fileId }).get();

  if (res.status !== 200 || !res.data) throw new FileDownloadError();
  const encryptedFileData = new Uint8Array(res.data as unknown as ArrayBuffer);

  return decryptFile(encryptedFileData, fileKey, fileDecryptionHeader, fileName, chunkCount);
};

export const loadFileToUnit8Array = async ({
  fileId,
  fileName,
  fileKey,
  fileDecryptionHeader,
  chunkCount,
}: LoadImageParams) => {
  const res = await api.download({ fileId }).get();

  if (res.status !== 200 || !res.data) throw new FileDownloadError();
  const encryptedFileData = new Uint8Array(res.data as unknown as ArrayBuffer);

  return decryptFileToUnit8Array(
    encryptedFileData,
    fileKey,
    fileDecryptionHeader,
    fileName,
    chunkCount,
  );
};
