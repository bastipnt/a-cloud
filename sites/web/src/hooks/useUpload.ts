import { uploadFile } from "@acloud/client";
import { useContext } from "react";
import { FilesContext } from "../providers/FilesProvider";
import { WorkerContext } from "../providers/WorkerProvider";

class NoMainKeyError extends Error {
  override name: string = "NoMainKeyError";
}

export const useUpload = () => {
  const { cryptoWorkerPool } = useContext(WorkerContext);
  const { addFiles } = useContext(FilesContext);

  const upload = async (files: File[], mainKey: Base64URLString) => {
    if (!mainKey) throw new NoMainKeyError();

    for (const file of files) {
      if (!cryptoWorkerPool || !cryptoWorkerPool.current) return;

      uploadFile(file, mainKey, cryptoWorkerPool.current).then((uploadedFile) => {
        addFiles([uploadedFile]);
      });
    }
  };

  return { upload };
};
