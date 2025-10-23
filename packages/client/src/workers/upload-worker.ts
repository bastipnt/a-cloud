import {
  encryptBlobToFile,
  encryptBoxBase64,
  encryptFile,
  encryptObject,
  genFileKeyBase64,
} from "@acloud/crypto";
import { detectFileType, type FileMetadata } from "@acloud/media";
import { expose } from "comlink";
import { api } from "../../api";

class UploadWorker {
  genFileKeyBase64() {
    return genFileKeyBase64();
  }

  detectFileType(file: File) {
    return detectFileType(file);
  }

  async encryptThumbnail(
    thumbnail: Blob | undefined,
    fileKey: Base64URLString,
  ): Promise<[File, Base64URLString] | [undefined, undefined]> {
    if (!thumbnail) return [undefined, undefined];
    return encryptBlobToFile(thumbnail, fileKey);
  }

  async encryptFile(file: File, fileKey: Base64URLString) {
    return encryptFile(file, fileKey);
  }

  encryptMetadata(metadata: FileMetadata, fileKey: Base64URLString) {
    return encryptObject(metadata, fileKey);
  }

  encryptFileKey(fileKey: Base64URLString, mainKey: Base64URLString) {
    return encryptBoxBase64(fileKey, mainKey);
  }

  async uploadFileInfo(
    encryptedFileKey: Base64URLString,
    fileKeyNonce: Base64URLString,

    fileDecryptionHeader: Base64URLString,
    thumbnailDecryptionHeader: Base64URLString | undefined,

    encryptedMetadata: Base64URLString,
    metadataDecryptionHeader: Base64URLString,
  ): Promise<string | undefined> {
    const res = await api.files.post({
      encryptedFileKey,
      fileKeyNonce,

      fileDecryptionHeader,
      thumbnailDecryptionHeader,

      encryptedMetadata,
      metadataDecryptionHeader,
    });

    if (res.status !== 200) return undefined;

    return res.data.fileId;
  }

  async uploadFile(fileId: string, encryptedFile: File): Promise<boolean> {
    const res = await api.upload.file({ fileId }).post({ file: encryptedFile });
    return res.status === 200;
  }

  async uploadThumbnail(fileId: string, encryptedThumbnail: File): Promise<boolean> {
    const res = await api.upload.thumbnail({ fileId }).post({ file: encryptedThumbnail });
    return res.status === 200;
  }
}

expose(UploadWorker);
export type { UploadWorker };
