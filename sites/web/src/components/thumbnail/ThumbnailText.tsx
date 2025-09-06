import { uint8ArrayToText } from "@acloud/common";
import { FileData } from "@acloud/media";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useClient } from "../../hooks/client";
import Markdown from "../Markdown";

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
      {metadata.fileType.mime === "text/markdown" ? (
        <Markdown thumbnail>{text}</Markdown>
      ) : (
        <SyntaxHighlighter
          language={metadata.fileType.ext}
          style={atomOneDark}
          customStyle={{ backgroundColor: "inherit" }}
          wrapLongLines
        >
          {text}
        </SyntaxHighlighter>
      )}
    </pre>
  );
};

export default ThumbnailText;
