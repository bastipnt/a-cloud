import { api } from "../api";

export const downloadFile = async (id: string): Promise<Uint8Array | undefined> => {
  const res = await api.download.file({ id }).get();
  if (res.data === null) return;
  const buffer = res.data as unknown as ArrayBuffer;

  console.log("file:", res);
  return new Uint8Array(buffer);
};
