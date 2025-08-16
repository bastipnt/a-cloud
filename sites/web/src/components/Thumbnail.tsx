import { FileData } from "@acloud/media";
import { useContext, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useClient } from "../hooks/client";
import { FilesContext } from "../providers/FilesProvider";
import { getImagePreviewUrl, getPDFPreviewUrl } from "../utils/urlHelper";

const Thumbnail: React.FC<FileData> = ({
  fileId,
  metadata,
  fileKey,
  thumbnailDecryptionHeader,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const { loadThumbnail } = useClient();
  const { addThumbnail, getThumbnail } = useContext(FilesContext);

  const previewUrl =
    metadata.fileType?.mime === "application/pdf"
      ? getPDFPreviewUrl(fileId)
      : getImagePreviewUrl(fileId);

  const setImgSrc = (thumbnail: File) => {
    if (!imgRef.current) return;
    const imgUrl = URL.createObjectURL(thumbnail);

    imgRef.current.src = imgUrl;
  };

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
    <Link
      className="relative block overflow-hidden rounded-lg after:block after:pb-[100%] after:content-['']"
      to={previewUrl}
    >
      <img
        className="absolute h-full w-full object-cover"
        src={undefined}
        alt={`thumbnail of ${metadata.fileName}`}
        ref={imgRef}
      />
    </Link>
  );
};

export default Thumbnail;
