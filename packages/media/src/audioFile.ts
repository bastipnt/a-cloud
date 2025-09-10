import { parseBlob } from "music-metadata";

export const extractAudioMetadata = async (audioFile: Blob) => {
  const audioMetadata = await parseBlob(audioFile);
  console.log(audioMetadata);

  return audioMetadata;
};
