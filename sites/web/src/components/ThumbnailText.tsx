import { uint8ArrayToText } from "@acloud/common";
import { FileData } from "@acloud/media";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useClient } from "../hooks/client";
import { getMarkdownPreviewUrl } from "../utils/urlHelper";

const ThumbnailText: React.FC<FileData> = ({ fileId, fileKey, fileDecryptionHeader, metadata }) => {
  const [text, setText] = useState("");
  const { loadFileToUnit8Array } = useClient();

  useEffect(() => {
    if (!fileDecryptionHeader) return;
    loadFileToUnit8Array({
      fileId,
      fileKey,
      fileDecryptionHeader,
      chunkCount: metadata.chunkCount,
    }).then((fileData) => setText(uint8ArrayToText(fileData)));
  }, [fileId, fileKey, fileDecryptionHeader, metadata.chunkCount]);

  return (
    <Link
      className="absolute h-full w-full overflow-hidden bg-gray-800 p-2 text-[10px]"
      to={getMarkdownPreviewUrl(fileId)}
    >
      {/* <Markdown>{text}</Markdown> */}
      {text}
    </Link>
  );
};

export default ThumbnailText;
