import { t } from "elysia";

export const AFileTypeBox = t.Object({
  file: t.File(),
});

class AFile {
  public file: File;

  constructor(file: File) {
    this.file = file;
  }
}

export default AFile;
