import { streamEncryptionChunkSize, type FileStream } from "../..";

export const readFileToStream = async (file: File): Promise<FileStream> => {
  console.log(file);

  const N = streamEncryptionChunkSize;
  const fileSize = file.size;
  const chunkCount = Math.ceil(fileSize / N);
  const lastModifiedMs = file.lastModified;

  let pending: Uint8Array | undefined;
  const transformer = new TransformStream<Uint8Array, Uint8Array>({
    async transform(
      chunk: Uint8Array,
      controller: TransformStreamDefaultController
    ) {
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
