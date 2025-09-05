import { FileData } from "@acloud/media";
import { useContext, useEffect, useState } from "react";
import { Link } from "wouter";
import { useClient } from "../hooks/client";
import { FilesContext } from "../providers/FilesProvider";
import { getImagePreviewUrl, getPDFPreviewUrl } from "../utils/urlHelper";

const ThumbnailImage: React.FC<FileData> = ({
  fileId,
  metadata,
  fileKey,
  thumbnailDecryptionHeader,
}) => {
  const [imgSrc, setImg] = useState<string>();
  const { loadThumbnail } = useClient();
  const { addThumbnail, getThumbnail } = useContext(FilesContext);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!metadata.fileType?.mime) return;

    if (metadata.fileType.mime === "application/pdf") setPreviewUrl(getPDFPreviewUrl(fileId));
    else if (metadata.fileType.mime.startsWith("image")) setPreviewUrl(getImagePreviewUrl(fileId));
  }, [metadata.fileType]);

  const setImgSrc = (thumbnail: File) => setImg(URL.createObjectURL(thumbnail));

  useEffect(() => {
    if (!thumbnailDecryptionHeader) return;

    const thumbnail = getThumbnail(fileId);

    if (thumbnail) return setImgSrc(thumbnail.file);

    loadThumbnail({
      fileId,
      fileName: metadata.fileName,
      fileKey,
      thumbnailDecryptionHeader,
    }).then((thumbnailFile) => {
      setImgSrc(thumbnailFile);
      addThumbnail({ fileId, file: thumbnailFile });
    });
  }, []);

  return (
    <Link className="absolute h-full w-full" to={previewUrl}>
      <img
        className="h-full w-full object-cover"
        src={imgSrc}
        alt={`thumbnail of ${metadata.fileName}`}
      />
    </Link>
  );
};

export default ThumbnailImage;
