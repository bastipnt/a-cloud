import { mergeUint8Arrays } from "@acloud/common";
import { streamEncryptionChunkSize } from "@acloud/crypto";
import sodium from "libsodium-wrappers-sumo";
import { fromBase64, toBase64 } from "./util/conversion-helper";
import { unit8ArrayToFile } from "./util/file-helper";

class FileDecryptionError extends Error {
  override name: string = "FileDecryptionError";
}

export const decryptFile = async (
  encryptedFileData: Uint8Array,
  fileKey: Base64URLString,
  decryptionHeader: Base64URLString,
  fileName: string,
): Promise<File> => {
  await sodium.ready;

  const fileData = await decryptFileUnit8Array(
    encryptedFileData,
    fileKey,
    decryptionHeader,
    encryptedFileData.length,
  );

  if (!fileData) throw new FileDecryptionError();

  return unit8ArrayToFile(fileData, fileName);
};

export const decryptUnit8Array = async (
  encryptedFileData: Uint8Array,
  fileKey: Base64URLString,
  decryptionHeader: Base64URLString,
) => {
  const pullState = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
    await fromBase64(decryptionHeader),
    await fromBase64(fileKey),
  );

  const pullResult = sodium.crypto_secretstream_xchacha20poly1305_pull(
    pullState,
    encryptedFileData,
  );

  return pullResult.message;
};

export const decryptFileUnit8Array = async (
  encryptedFile: Uint8Array,
  fileKey: Base64URLString,
  decryptionHeader: Base64URLString,
  predefinedChunkSize?: number,
): Promise<Uint8Array | undefined> => {
  await sodium.ready;

  const pullState = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
    await fromBase64(decryptionHeader),
    await fromBase64(fileKey),
  );

  const decryptionChunkSize =
    predefinedChunkSize ||
    streamEncryptionChunkSize + sodium.crypto_secretstream_xchacha20poly1305_ABYTES;
  let bytesRead = 0;
  const decryptedChunks: Uint8Array[] = [];

  let tag = sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;
  while (tag !== sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL) {
    let chunkSize = decryptionChunkSize;
    if (bytesRead + chunkSize > encryptedFile.length) {
      chunkSize = encryptedFile.length - bytesRead;
    }
    const buffer = encryptedFile.slice(bytesRead, bytesRead + chunkSize);
    const pullResult = sodium.crypto_secretstream_xchacha20poly1305_pull(pullState, buffer);
    decryptedChunks.push(pullResult.message);
    tag = pullResult.tag;
    bytesRead += chunkSize;
  }

  return mergeUint8Arrays(decryptedChunks);
};

export const decryptObject = async <T>(
  encryptedData: Base64URLString,
  key: Base64URLString,
  decryptionHeader: Base64URLString,
): Promise<T> => {
  const rawData = await decryptUnit8Array(await fromBase64(encryptedData), key, decryptionHeader);
  const data = new TextDecoder().decode(rawData);

  return JSON.parse(data);
};

export const decryptBox = async (
  encryptedData: Base64URLString,
  nonce: Base64URLString,
  key: Base64URLString,
) => {
  await sodium.ready;

  return sodium.crypto_secretbox_open_easy(
    await fromBase64(encryptedData),
    await fromBase64(nonce),
    await fromBase64(key),
  );
};

export const decryptBoxBase64 = async (
  encryptedData: Base64URLString,
  nonce: Base64URLString,
  key: Base64URLString,
) => toBase64(await decryptBox(encryptedData, nonce, key));
