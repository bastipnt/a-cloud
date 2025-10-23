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
  encryptBlobToFile,
  encryptBoxBase64,
  encryptBoxWithNonceBase64,
  encryptFile,
  encryptObject,
  type FileParams,
} from "./src/encrypt";

export {
  decryptBoxBase64,
  decryptFile,
  decryptFileToUnit8Array,
  decryptObject,
  decryptUnit8Array,
} from "./src/decrypt";

export { generateServerKeys } from "./generate-server-keys";
export { deriveKeyBase64, genFileKeyBase64, genNewUserKeys, genOTT } from "./src/generate";
export { getHashBase64, getHashBase64FromFile } from "./src/hash";
export { genPassword } from "./src/password";
export {
  deriveSrpClientSession,
  genSrpAttributes,
  genSrpClientEphemeral,
  verifySrpSession,
} from "./src/srpClient";
export { fromBase64 } from "./src/util/conversion-helper";
