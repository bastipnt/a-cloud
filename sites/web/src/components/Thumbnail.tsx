import { FileData } from "@acloud/media";
import { Link } from "wouter";
import FileIcon from "./svg/FileIcon";
import ThumbnailImage from "./ThumbnailImage";
import ThumbnailText from "./ThumbnailText";

const Thumbnail: React.FC<FileData> = (fileData) => {
  const { metadata, fileId } = fileData;

  let thumbnailEl: React.ReactNode;

  if (!!fileData.thumbnailDecryptionHeader) thumbnailEl = <ThumbnailImage {...fileData} />;
  else if (metadata.fileType.mime.startsWith("text")) thumbnailEl = <ThumbnailText {...fileData} />;
  else
    thumbnailEl = (
      <Link className="absolute h-full w-full" to={`/download/${fileId}`}>
        <FileIcon className="absolute h-full w-full" />
      </Link>
    );

  return (
    <li className="relative block overflow-hidden rounded-lg after:block after:pb-[100%] after:content-['']">
      {thumbnailEl}
      <span className="absolute right-2 bottom-2 rounded-md bg-emerald-600/90 px-2">
        {metadata.fileType.ext}
      </span>
    </li>
  );
};

export default Thumbnail;
