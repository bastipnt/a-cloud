import { fileTypeFromBlob, type FileTypeResult } from "file-type";

const extToMime = {
  txt: "text/plain",
  md: "text/markdown",
  html: "text/html",
  csv: "text/csv",
  json: "application/json",
  svg: "image/svg+xml",
  xml: "application/xml",
};

export const isTextFile = async (file: File) => {
  // Read only the first few KB for efficiency
  const chunkSize = 4096;
  const blob = file.slice(0, chunkSize);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let nonPrintable = 0;
  const len = bytes.length;

  for (let i = 0; i < len; i++) {
    const byte = bytes[i]!;

    // allow common text control chars: tab(9), LF(10), CR(13)
    if (byte === 9 || byte === 10 || byte === 13) continue;

    // printable ASCII range
    if (byte >= 32 && byte <= 126) continue;

    // printable extended UTF-8 (>= 128 could be multi-byte)
    if (byte > 127) continue;

    // non-printable
    nonPrintable++;
  }

  // if too many non-printable chars → binary
  return nonPrintable / len < 0.05; // <5% non-printables → text
};

const getMimeFromExt = (ext: string) => {
  return extToMime[ext] || "";
};

const getExtensionFromName = (filename: string) => {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
};

const detectMimeByExt = (file: File): FileTypeResult => {
  const ext = getExtensionFromName(file.name);
  const mime = getMimeFromExt(ext);

  return { mime, ext };
};

export const detectFileType = async (file: File): Promise<FileTypeResult> => {
  const fileType = await fileTypeFromBlob(file);
  if (fileType !== undefined && fileType.ext !== "xml") return fileType;
  return detectMimeByExt(file);
};
