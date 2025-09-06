import { uint8ArrayToText } from "@acloud/common";
import { FileData } from "@acloud/media";
import { useEffect, useState } from "react";
import { useClient } from "../../hooks/client";

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
    <pre className="overflow-hidden bg-gray-800 p-2 text-[8px]">
      {/* <Markdown>{text}</Markdown> */}
      {text}
    </pre>
  );
};

export default ThumbnailText;
