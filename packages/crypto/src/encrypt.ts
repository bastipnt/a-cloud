import sodium from "libsodium-wrappers-sumo";
import { genNonce } from "./generate";
import { fromBase64, toBase64 } from "./util/conversion-helper";
import { blobToUnit8Array, fileStreamToFile, readFileToStream } from "./util/file-helper";

type FileParams = {
  decryptionHeader: Base64URLString;
  chunkCount: number;
  fileSize: number;
  lastModifiedMs: number;
};

export const encryptFile = async (
  file: File,
  fileKey: Base64URLString,
): Promise<[File, FileParams]> => {
  await sodium.ready;
  const initPushResult = sodium.crypto_secretstream_xchacha20poly1305_init_push(
    await fromBase64(fileKey),
  );
  const { state, header } = initPushResult;

  const { stream, chunkCount, fileSize, lastModifiedMs } = await readFileToStream(file);

  const fileStreamReader = stream.getReader();
  const ref = { pullCount: 1 };

  const encryptedFileStream = new ReadableStream({
    async pull(controller) {
      const { value } = await fileStreamReader.read();
      if (value === undefined) return;
      const isFinished = ref.pullCount === chunkCount;

      const tag = isFinished
        ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
        : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;

      const encryptedFileChunk = sodium.crypto_secretstream_xchacha20poly1305_push(
        state,
        value,
        null,
        tag,
      );

      controller.enqueue(encryptedFileChunk);

      if (isFinished) {
        controller.close();
      }
      ref.pullCount++;
    },
  });

  return [
    await fileStreamToFile(encryptedFileStream),
    {
      decryptionHeader: await toBase64(header),
      chunkCount,
      fileSize,
      lastModifiedMs,
    },
  ];
};

export const encryptBlobToFile = async (
  blob: Blob,
  key: Base64URLString,
): Promise<[File, Base64URLString]> => {
  const blobArr = await blobToUnit8Array(blob);

  const [encryptedBlob, header] = await encryptUnit8ArrayBase64(blobArr, key);

  const encryptedFile = new File([new Blob([await fromBase64(encryptedBlob)])], "encrypted-file");

  return [encryptedFile, header];
};

export const encryptBoxWithNonceBase64 = async (
  data: Base64URLString,
  key: Base64URLString,
  nonce: Uint8Array,
): Promise<Base64URLString> => {
  await sodium.ready;

  const encryptedData = sodium.crypto_secretbox_easy(
    await fromBase64(data),
    nonce,
    await fromBase64(key),
  );

  return await toBase64(encryptedData);
};

/**
 *
 * @param data
 * @param key
 * @returns [data, nonce]
 */
export const encryptBoxBase64 = async (
  data: Base64URLString,
  key: Base64URLString,
): Promise<[Base64URLString, Base64URLString]> => {
  await sodium.ready;

  const nonce = await genNonce();

  const encryptedData = await encryptBoxWithNonceBase64(data, key, nonce);

  return [encryptedData, await toBase64(nonce)];
};

export const encryptObject = (value: object, key: Base64URLString) =>
  encryptUnit8ArrayBase64(new TextEncoder().encode(JSON.stringify(value)), key);

export const encryptUnit8ArrayBase64 = async (
  data: Uint8Array,
  key: Base64URLString,
): Promise<[Base64URLString, Base64URLString]> => {
  await sodium.ready;

  const initPushResult = sodium.crypto_secretstream_xchacha20poly1305_init_push(
    await fromBase64(key),
  );
  const { state, header } = initPushResult;

  const encryptedData = sodium.crypto_secretstream_xchacha20poly1305_push(
    state,
    data,
    null,
    sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL,
  );

  return [await toBase64(encryptedData), await toBase64(header)];
};
