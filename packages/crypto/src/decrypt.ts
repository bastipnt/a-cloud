import { mergeUint8Arrays } from "@acloud/common";
import sodium from "libsodium-wrappers-sumo";
import { streamEncryptionChunkSize, type FileStream } from "..";
import { readFileToStream } from "./util/file-helper";

const getHeader = (): Uint8Array | undefined => {
  const encryptionHeader = localStorage.getItem("encryptionHeader");
  console.log({ encryptionHeader });

  if (!encryptionHeader) return;

  const parsedEncryptionHeader = JSON.parse(encryptionHeader);
  console.log(parsedEncryptionHeader);
  console.log(Uint8Array.from(parsedEncryptionHeader));

  return new Uint8Array(JSON.parse(encryptionHeader));
};

const getKey = (): Uint8Array | undefined => {
  const encryptionKey = localStorage.getItem("encryptionKey");
  if (!encryptionKey) return;

  return new Uint8Array(JSON.parse(encryptionKey));
};

export const decryptFile = async (encryptedFile: Uint8Array): Promise<Uint8Array | undefined> => {
  await sodium.ready;

  const header = getHeader();
  const key = getKey();
  if (!header || !key) return;

  const pullState = sodium.crypto_secretstream_xchacha20poly1305_init_pull(header, key);

  const decryptionChunkSize =
    streamEncryptionChunkSize + sodium.crypto_secretstream_xchacha20poly1305_ABYTES;
  let bytesRead = 0;
  const decryptedChunks = [];

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
