import { uint8ArrayToText } from "@acloud/common";
import { FileData } from "@acloud/media";
import { useEffect, useState } from "react";
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
    <section className="fixed top-0 left-0 flex h-full w-full flex-row justify-center bg-white align-middle dark:bg-gray-900">
      <Link className="absolute top-4 right-4 z-10 cursor-pointer" to="/">
        <Close />
      </Link>
      {loading && <Spinner className="fixed top-4 right-4" />}
      {text && (
        <pre className="overflow-x-hidden overflow-y-scroll p-16 break-words whitespace-pre-wrap">
          {text}
        </pre>
      )}
    </section>
  );
};

export default TextPreview;
