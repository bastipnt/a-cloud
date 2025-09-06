import { FileData } from "@acloud/media";
import { useContext, useEffect, useState } from "react";
import { useClient } from "../../hooks/client";
import { FilesContext } from "../../providers/FilesProvider";

const ThumbnailImage: React.FC<FileData> = ({
  fileId,
  metadata,
  fileKey,
  thumbnailDecryptionHeader,
}) => {
  const [imgSrc, setImg] = useState<string>();
  const { loadThumbnail } = useClient();
  const { addThumbnail, getThumbnail } = useContext(FilesContext);

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
    <img
      className="h-full w-full object-cover"
      src={imgSrc}
      alt={`thumbnail of ${metadata.fileName}`}
    />
  );
};

export default ThumbnailImage;
