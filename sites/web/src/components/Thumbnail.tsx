import { FileData } from "@acloud/media";
import { useEffect, useRef } from "react";
import { useClient } from "../hooks/client";

const Thumbnail: React.FC<FileData> = ({
  fileId,
  metadata,
  fileKey,
  thumbnailDecryptionHeader,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const { loadThumbnail } = useClient();

  useEffect(() => {
    if (!thumbnailDecryptionHeader) return;

    loadThumbnail({
      fileId,
      fileName: metadata.fileName,
      fileKey,
      thumbnailDecryptionHeader,
    }).then((thumbnail) => {
      if (!imgRef.current) return;
      const imgUrl = URL.createObjectURL(thumbnail);

      imgRef.current.src = imgUrl;
    });
  }, []);

  return <img src={undefined} alt={`thumbnail of ${metadata.fileName}`} ref={imgRef} />;
};

export default Thumbnail;
