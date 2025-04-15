export interface FileStream {
  stream: ReadableStream<Uint8Array>;
  chunkCount: number;
  fileSize: number;
  lastModifiedMs: number;
  file?: File | Blob;
}

export interface EncryptedFileStream extends Omit<FileStream, "file" | "stream"> {
  encryptedFileStream: ReadableStream<Uint8Array>;
  decryptionHeader: Uint8Array<ArrayBufferLike>;
}

export const streamEncryptionChunkSize = 4 * 1024 * 1024;

export { encryptFile, encryptBoxBase64, encryptBoxWithNonceBase64 } from "./src/encrypt";
export { decryptFile } from "./src/decrypt";
export { genNewUserKeys, genOTT } from "./src/generate";
export { getHashBase64 } from "./src/hash";
export { createCryptoWorker } from "./src/util/worker-helper";
export {
  genSrpAttributes,
  genSrpClientEphemeral,
  deriveSrpClientSession,
  verifySrpSession,
} from "./src/srpClient";
export { generateServerKeys } from "./generate-server-keys";
