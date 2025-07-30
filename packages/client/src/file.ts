import { decryptBoxBase64, decryptObject } from "@acloud/crypto";
import type { EncryptedFileData, FileData, FileMetadata } from "@acloud/media";
import { api } from "../api";

export class FilesLoadingError extends Error {
  override message = "FilesLoadingError";
}

export class FileLoadingError extends Error {
  override message = "FileLoadingError";
}

class NotAFileError extends Error {
  override message = "NotAFileError";
}

const getFileData = async (
  encryptedFileData: EncryptedFileData,
  mainKey: Base64URLString,
): Promise<FileData> => {
  const {
    encryptedFileKey,
    fileKeyNonce,
    fileId,
    fileDecryptionHeader,
    thumbnailDecryptionHeader,
    metadataDecryptionHeader,
    createdAt,
    updatedAt,
    encryptedMetadata,
  } = encryptedFileData;
  const fileKey = await decryptBoxBase64(encryptedFileKey, fileKeyNonce, mainKey);

  if (!metadataDecryptionHeader) throw new NotAFileError();

  const metadata = await decryptObject<FileMetadata>(
    encryptedMetadata,
    fileKey,
    metadataDecryptionHeader,
  );

  return {
    fileId,
    fileDecryptionHeader,
    thumbnailDecryptionHeader,
    fileKey,
    metadata,
    createdAt,
    updatedAt,
  };
};

export const getFiles = async (mainKey: Base64URLString): Promise<FileData[]> => {
  const res = await api.files.get();
  if (!res.data) throw new FilesLoadingError();

  const files = res.data.files;

  return Promise.all(files.map((f) => getFileData(f, mainKey)));
};

export const getFile = async (fileId: string, mainKey: Base64URLString): Promise<FileData> => {
  const res = await api.files({ fileId }).get();

  if (!res.data || !res.data.file) throw new FileLoadingError();

  const file = res.data.file;

  return getFileData(file, mainKey);
};
