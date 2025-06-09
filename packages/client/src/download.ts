import { decryptFile } from "@acloud/crypto";
import { api } from "../api";

class FileDownloadError extends Error {
  override name: string = "FileDownloadError";
}

// export const downloadFile = async (id: string): Promise<Uint8Array | undefined> => {
//   const res = await api.download.file({ id }).get();
//   if (res.data === null) return;
//   const buffer = res.data as unknown as ArrayBuffer;

//   console.log("file:", res);
//   return new Uint8Array(buffer);
// };

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
