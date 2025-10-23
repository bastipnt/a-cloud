import { t } from "elysia";
import { resolve } from "path";

export const dataDir = resolve(__dirname, "../../../../data");

export class FileStoreError extends Error {
  override name: string = "FileStoreError";
}

export const fileUploadBody = t.Object({
  file: t.File(),
});

export const storeFileParams = t.Object({
  fileId: t.String(),
});
