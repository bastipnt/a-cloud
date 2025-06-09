import { mergeUint8Arrays } from "@acloud/common";
import { streamEncryptionChunkSize, type FileStream } from "@acloud/crypto";

export const readFileToStream = async (file: File): Promise<FileStream> => {
  const N = streamEncryptionChunkSize;
  const fileSize = file.size;
  const chunkCount = Math.ceil(fileSize / N);
  const lastModifiedMs = file.lastModified;

  let pending: Uint8Array | undefined;
  const transformer = new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
      let next: Uint8Array;

      if (pending) {
        next = new Uint8Array(pending.length + chunk.length);
        next.set(pending);
        next.set(chunk, pending.length);
        pending = undefined;
      } else {
        next = chunk;
      }
      while (next.length >= N) {
        controller.enqueue(next.slice(0, N));
        next = next.slice(N);
      }
      if (next.length) pending = next;
    },
    flush(controller: TransformStreamDefaultController) {
      if (pending) controller.enqueue(pending);
    },
  });

  const stream = file.stream().pipeThrough(transformer);

  return { stream, chunkCount, fileSize, lastModifiedMs, file };
};

const combineChunksToFormUploadPart = async (
  streamReader: ReadableStreamDefaultReader<Uint8Array>,
) => {
  const combinedChunks: Uint8Array<ArrayBufferLike>[] = [];

  const handleChunk = async () => {
    const { done, value: chunk } = await streamReader.read();

    if (done) return;

    combinedChunks.push(chunk);
    await handleChunk();
  };

  await handleChunk();
  return mergeUint8Arrays(combinedChunks);
};

export const unit8ArrayToFile = (fileData: Uint8Array, fileName: string) =>
  new File([new Blob([fileData])], fileName);

export const fileStreamToFile = async (
  encryptedFileStream: ReadableStream<Uint8Array<ArrayBufferLike>>,
) => {
  const streamReader = encryptedFileStream.getReader();
  const uploadChunks = await combineChunksToFormUploadPart(streamReader);
  return unit8ArrayToFile(uploadChunks, "encrypted-file");
};

export const blobToUnit8Array = async (blob: Blob) => {
  const buffer = await new Response(blob).arrayBuffer();
  return new Uint8Array(buffer);
};
