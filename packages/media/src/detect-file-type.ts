import { fileTypeFromBlob } from "file-type";

export const detectFileType = async (file: File) => fileTypeFromBlob(file);
