import { FileData } from "@acloud/media";
import { useLoadThumbnail } from "../../hooks/thumbnail";
import FileIcon from "../svg/FileIcon";

const ThumbnailImage: React.FC<FileData> = ({
  fileId,
  metadata,
  fileKey,
  thumbnailDecryptionHeader,
}) => {
  const imgSrc = useLoadThumbnail({ fileId, metadata, fileKey, thumbnailDecryptionHeader });

  if (!imgSrc)
    return (
      <span className="inline-flex h-full w-full items-center justify-center">
        <FileIcon className="h-24 w-24" extension={metadata.fileType.ext} />
      </span>
    );

  return (
    <img
      className="h-full w-full object-cover"
      src={imgSrc}
      alt={`thumbnail of ${metadata.fileName}`}
    />
  );
};

export default ThumbnailImage;
