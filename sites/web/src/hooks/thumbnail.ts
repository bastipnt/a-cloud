import { FileData } from "@acloud/media";
import { useContext, useEffect, useState } from "react";
import { FilesContext } from "../providers/FilesProvider";
import { useClient } from "./client";

export const useLoadThumbnail = ({
  fileId,
  metadata,
  fileKey,
  thumbnailDecryptionHeader,
}: Pick<FileData, "fileId" | "metadata" | "fileKey" | "thumbnailDecryptionHeader">) => {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>();

  const { loadThumbnail } = useClient();
  const { addThumbnail, getThumbnail } = useContext(FilesContext);

  const setThumbnailSrcFromFile = (thumbnail: File) =>
    setThumbnailSrc(URL.createObjectURL(thumbnail));

  useEffect(() => {
    if (!thumbnailDecryptionHeader) return;

    const thumbnail = getThumbnail(fileId);
    if (thumbnail) return setThumbnailSrcFromFile(thumbnail.file);

    loadThumbnail({
      fileId,
      fileName: metadata.fileName,
      fileKey,
      thumbnailDecryptionHeader,
    }).then((thumbnailFile) => {
      setThumbnailSrcFromFile(thumbnailFile);
      addThumbnail({ fileId, file: thumbnailFile });
    });
  }, []);

  return thumbnailSrc;
};
