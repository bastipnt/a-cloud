import { mergeUint8Arrays } from "@acloud/common";
import type { EncryptedFileStream } from "@acloud/crypto";
import { api } from "../api";

const combineChunksToFormUploadPart = async (
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
) => {
  const combinedChunks: Uint8Array<ArrayBufferLike>[] = [];

  const handleChunk = async () => {
    const { done, value: chunk } = await streamReader.read();
    console.log(done, chunk);

    if (done) return;

    combinedChunks.push(chunk);
    await handleChunk();
  };

  await handleChunk();
  return mergeUint8Arrays(combinedChunks);
};

export const uploadStream = async (encryptedFile: EncryptedFileStream) => {
  const { encryptedFileStream } = encryptedFile;
  console.log({ encryptedFileStream });

  const streamReader = encryptedFileStream.getReader();
  const uploadChunks = await combineChunksToFormUploadPart(streamReader);
  console.log({ uploadChunks });

  const uploadFile = new File([new Blob([uploadChunks])], "hello");

  const res = await api.upload.file.post({ file: uploadFile });

  console.log(res);
};
