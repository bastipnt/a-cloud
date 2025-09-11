import { FileData } from "@acloud/media";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useIntersection } from "../../hooks/intersection";
import {
  getDownloadUrl,
  getImagePreviewUrl,
  getMarkdownPreviewUrl,
  getPDFPreviewUrl,
  getTextPreviewUrl,
} from "../../utils/urlHelper";
import FileIcon from "../svg/FileIcon";
import MoreIcon from "../svg/MoreIcon";
import ThumbnailAudio from "./ThumbnailAudio";
import ThumbnailImage from "./ThumbnailImage";
import ThumbnailText from "./ThumbnailText";

const Thumbnail: React.FC<FileData> = (fileData) => {
  const { metadata, fileId } = fileData;
  const liRef = useRef<HTMLLIElement>(null);
  const [showThumbnail, setShowThumbnail] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (metadata.fileType.mime === "application/pdf") setPreviewUrl(getPDFPreviewUrl(fileId));
    else if (metadata.fileType.mime.startsWith("image")) setPreviewUrl(getImagePreviewUrl(fileId));
    else if (metadata.fileType.mime === "text/markdown")
      setPreviewUrl(getMarkdownPreviewUrl(fileId));
    else if (metadata.fileType.mime.startsWith("text")) setPreviewUrl(getTextPreviewUrl(fileId));
    else if (metadata.fileType.mime === "application/json")
      setPreviewUrl(getTextPreviewUrl(fileId));
    else setPreviewUrl(getDownloadUrl(fileId));
  }, [metadata.fileType.mime, fileId]);

  let thumbnailEl: React.ReactNode;

  if (fileData.thumbnailDecryptionHeader) thumbnailEl = <ThumbnailImage {...fileData} />;
  else if (
    metadata.fileType.mime.startsWith("text") ||
    metadata.fileType.mime === "application/json"
  )
    thumbnailEl = <ThumbnailText {...fileData} />;
  else if (metadata.fileType.mime.startsWith("audio"))
    thumbnailEl = <ThumbnailAudio {...fileData} />;
  else {
    thumbnailEl = (
      <FileIcon
        className="absolute h-full w-full p-4 text-violet-400"
        extension={metadata.fileType.ext}
      />
    );
  }

  useIntersection(liRef, (elements) => {
    const [element] = elements;
    if (element.isIntersecting) setShowThumbnail(true);
  });

  return (
    <li ref={liRef}>
      <Link to={previewUrl} className="space-y-2">
        <span className="relative block overflow-hidden rounded-lg after:block after:pb-[100%] after:content-['']">
          <span className="absolute h-full w-full bg-gray-800">{showThumbnail && thumbnailEl}</span>
          <span className="absolute right-1 bottom-1 rounded-lg bg-gray-800 p-1">
            <FileIcon className="h-8 w-8" extension={metadata.fileType.ext} />
          </span>
        </span>
        <p className="flex flex-row px-1">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {metadata.fileName.replace(/\.[^/.]+$/, "")}
          </span>
          <span className="text-gray-400">.{metadata.fileType.ext}</span>
        </p>
      </Link>
      <div className="flex flex-row items-center justify-between px-1">
        <span className="text-xs text-gray-400">
          {new Date(metadata.lastModifiedMs).toLocaleDateString("de-DE")}
        </span>
        <button className="cursor-pointer">
          <MoreIcon className="text-gray-300" size={20} />
        </button>
      </div>
    </li>
  );
};

export default Thumbnail;
