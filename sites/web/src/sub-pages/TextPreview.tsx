import { uint8ArrayToText } from "@acloud/common";
import { FileData } from "@acloud/media";
import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Link, useRoute } from "wouter";
import Close from "../components/svg/Close";
import Spinner from "../components/svg/Spinner";
import { useClient } from "../hooks/client";
import { useModalScroll } from "../hooks/modalScroll";
import { TEXT_SLUG } from "../utils/urlHelper";

const TextPreview: React.FC = () => {
  useModalScroll();

  const [text, setText] = useState("");
  const { loadFileToUnit8Array, getFile } = useClient();

  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<FileData["metadata"]>();
  const [matchMarkdown, params] = useRoute(`/${TEXT_SLUG}/:fileId`);

  const load = async (fileId: string) => {
    setLoading(true);

    const fileData = await getFile(fileId);
    if (fileData === null || !fileData.fileDecryptionHeader) return;

    setMetadata(fileData.metadata);

    const textData = await loadFileToUnit8Array({
      fileId,
      fileKey: fileData.fileKey,
      fileDecryptionHeader: fileData.fileDecryptionHeader,
      chunkCount: fileData.metadata.chunkCount,
    });

    setText(uint8ArrayToText(textData));
    setLoading(false);
  };

  useEffect(() => {
    if (!matchMarkdown || !params.fileId) return;

    load(params.fileId);
  }, [matchMarkdown, params?.fileId, getFile]);

  return (
    <section className="fixed top-0 left-0 h-full w-full overflow-y-scroll bg-white align-middle dark:bg-gray-900">
      <div className="sticky top-0 left-0 z-10 flex w-full flex-row justify-between bg-gray-900/70 p-4">
        <h2 className="text-lg">{metadata?.fileName}</h2>
        <Link className="cursor-pointer" to="/">
          <Close />
        </Link>
      </div>
      {loading && <Spinner className="fixed right-4 bottom-4" />}
      {text && (
        <div className="p-8">
          <SyntaxHighlighter
            language={metadata?.fileType.ext}
            style={atomOneDark}
            customStyle={{ backgroundColor: "inherit" }}
            showLineNumbers
            wrapLongLines
          >
            {text}
          </SyntaxHighlighter>
        </div>
      )}
    </section>
  );
};

export default TextPreview;
