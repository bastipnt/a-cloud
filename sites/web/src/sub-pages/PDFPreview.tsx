import { FileData } from "@acloud/media";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import Close from "../components/svg/Close";
import Spinner from "../components/svg/Spinner";
import { useClient } from "../hooks/client";
import { useModalScroll } from "../hooks/modalScroll";
import { PDF_SLUG } from "../utils/urlHelper";

const PDFPreview: React.FC = () => {
  useModalScroll();

  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<FileData["metadata"]>();
  const [pdfUrl, setPDFUrl] = useState<string | null>(null);

  const [matchPDF, params] = useRoute(`/${PDF_SLUG}/:fileId`);

  const { getFile, loadImage } = useClient();

  const load = async (fileId: string) => {
    setLoading(true);

    const fileData = await getFile(fileId);
    if (fileData === null || !fileData.fileDecryptionHeader) return;

    setMetadata(fileData.metadata);

    const pdf = await loadImage({
      fileId,
      fileName: fileData.metadata.fileName,
      fileKey: fileData.fileKey,
      fileDecryptionHeader: fileData.fileDecryptionHeader,
      chunkCount: fileData.metadata.chunkCount,
    });

    setPDFUrl(URL.createObjectURL(pdf));
    setLoading(false);
  };

  useEffect(() => {
    if (!matchPDF || !params.fileId) return;

    load(params.fileId);
  }, [matchPDF, params?.fileId, getFile]);

  return (
    <section className="fixed top-0 left-0 flex h-full w-full flex-col justify-center bg-white align-middle dark:bg-gray-900">
      <div className="flex flex-row justify-between p-4">
        <h1>{metadata?.fileName}</h1>
        <Link className="top-4 right-4 z-10 cursor-pointer" to="/">
          <Close />
        </Link>
      </div>
      {loading && <Spinner className="fixed top-4 right-4" />}
      {pdfUrl && <iframe src={pdfUrl} className="h-full w-full" title="PDF" />}
    </section>
  );
};

export default PDFPreview;
