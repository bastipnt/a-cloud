export interface FileStream {
  stream: ReadableStream<Uint8Array>;
  chunkCount: number;
  fileSize: number;
  lastModifiedMs: number;
  file?: File | Blob;
}

export interface EncryptedFileData extends Omit<FileStream, "file" | "stream"> {
  encryptedFile: File;
  decryptionHeader: Base64URLString;
  key: Base64URLString;
}

export const streamEncryptionChunkSize = 4 * 1024 * 1024;

export {
  encryptFile,
  encryptBoxBase64,
  encryptBoxWithNonceBase64,
  encryptObject,
  encryptBlobToFile,
} from "./src/encrypt";

export { decryptFile, decryptBoxBase64, decryptUnit8Array, decryptObject } from "./src/decrypt";

export { genNewUserKeys, genOTT, genFileKeyBase64, deriveKeyBase64 } from "./src/generate";
export { getHashBase64 } from "./src/hash";
export { createCryptoWorker } from "./src/util/worker-helper";
export {
  genSrpAttributes,
  genSrpClientEphemeral,
  deriveSrpClientSession,
  verifySrpSession,
} from "./src/srpClient";
export { generateServerKeys } from "./generate-server-keys";
export { genPassword } from "./src/password";
