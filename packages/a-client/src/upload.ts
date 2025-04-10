import { mergeUint8Arrays } from "a-common";
import type { EncryptedFileStream } from "a-crypto";
import { client } from "..";

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
  const { encryptedFileStream, lastModifiedMs } = encryptedFile;
  const path = "/lol";
  console.log({ encryptedFileStream });

  const streamReader = encryptedFileStream.getReader();
  const uploadChunks = await combineChunksToFormUploadPart(streamReader);
  console.log({ uploadChunks });

  const uploadFile = new File([new Blob([uploadChunks])], "hello");

  const res = await client.upload.file.post({ file: uploadFile });

  console.log(res);
};
