import { FileData } from "@acloud/media";
import { useEffect, useRef } from "react";
import { Link } from "wouter";
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

  return (
    <Link
      className="relative block overflow-hidden rounded-lg after:block after:pb-[100%] after:content-['']"
      to={`/image/${fileId}`}
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
