import sodium from "libsodium-wrappers-sumo";
import { type EncryptedFileStream } from "..";
import { genNonce } from "./generate";
import { fromBase64, toBase64 } from "./util/conversion-helper";
import { readFileToStream } from "./util/file-helper";

const genOrGetKey = (): Uint8Array => {
  const encryptionKey = localStorage.getItem("encryptionKey");
  if (encryptionKey) {
    return new Uint8Array(JSON.parse(encryptionKey));
  }

  const newKey = sodium.crypto_secretstream_xchacha20poly1305_keygen();
  localStorage.setItem("encryptionKey", JSON.stringify(Array.from(newKey)));

  return newKey;
};

const setHeader = (header: Uint8Array) => {
  localStorage.setItem("encryptionHeader", JSON.stringify(Array.from(header)));
};

export const encryptFile = async (file: File): Promise<EncryptedFileStream> => {
  await sodium.ready;

  const key = genOrGetKey();
  const initPushRes = sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
  const [pushState, header] = [initPushRes.state, initPushRes.header];
  setHeader(header);

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
        pushState,
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

  return {
    encryptedFileStream,
    decryptionHeader: header,
    chunkCount,
    fileSize,
    lastModifiedMs,
  };
};

export const encryptBoxBase64 = async (data: string, key: string): Promise<[string, string]> => {
  await sodium.ready;

  const nonce = await genNonce();

  const encryptedData = sodium.crypto_secretbox_easy(
    await fromBase64(data),
    nonce,
    await fromBase64(key),
  );

  return [await toBase64(encryptedData), await toBase64(nonce)];
};
