// import { mergeUint8Arrays } from "@acloud/common";
// import type { EncryptedFileStream } from "@acloud/crypto";

// interface PartEtag {
//   PartNumber: number;
//   ETag: string;
// }

// const multipartChunksPerPart = 5;

// const combineChunksToFormUploadPart = async (
//   streamReader: ReadableStreamDefaultReader<Uint8Array>,
// ) => {
//   const combinedChunks = [];
//   for (let i = 0; i < multipartChunksPerPart; i++) {
//     const { done, value: chunk } = await streamReader.read();
//     if (done) {
//       break;
//     }
//     combinedChunks.push(chunk);
//   }
//   return mergeUint8Arrays(combinedChunks);
// };

// export const multipartStreamUpload = async (encryptedFile: EncryptedFileStream) => {
//   const { chunkCount, encryptedFileStream } = encryptedFile;

//   const uploadPartCount = Math.ceil(chunkCount / multipartChunksPerPart);
//   // const streamReader = encryptedFileStream.getReader();

//   for (let i = 0; i < uploadPartCount; i++) {
//     // const uploadChunk = await combineChunksToFormUploadPart(streamReader);
//     // api.upload.file.post({ filePart: uploadChunk });
//   }

//   // api.upload.file
//   //   .post({ file: aFiles.map((aFile) => aFile.file)[0] })
//   //   .then((data) => console.log(data))
//   //   .catch((err) => console.error(err));
// };
