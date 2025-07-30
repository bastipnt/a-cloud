import { FileData } from "@acloud/media";
import { useEffect, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import Spinner from "../components/svg/Spinner";
import { useClient } from "../hooks/client";

const ImagePreview: React.FC = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<FileData["metadata"]>();
  const [matchImage, params] = useRoute("/image/:fileId");

  const { getFile, loadImage } = useClient();

  const load = async (fileId: string) => {
    const fileData = await getFile(fileId);
    if (!fileData.fileDecryptionHeader) return;

    setMetadata(fileData.metadata);

    const image = await loadImage({
      fileId,
      fileName: fileData.metadata.fileName,
      fileKey: fileData.fileKey,
      fileDecryptionHeader: fileData.fileDecryptionHeader,
      chunkCount: fileData.metadata.chunkCount,
    });

    if (!imgRef.current) return;
    const imgUrl = URL.createObjectURL(image);

    imgRef.current.src = imgUrl;

    setLoading(false);
  };

  useEffect(() => {
    if (!matchImage || !params.fileId) return;

    load(params.fileId);
  }, [matchImage, params?.fileId]);

  return (
    <section className="fixed top-0 left-0 h-full w-full bg-white p-4">
      <Link className="absolute cursor-pointer" to="/">
        Back
      </Link>
      {loading && <Spinner className="fixed top-4 right-4" />}
      <img
        className="h-full w-full object-contain text-center leading-[100vh]"
        src={undefined}
        alt={`${metadata?.fileName}`}
        ref={imgRef}
      />
    </section>
  );
};

export default ImagePreview;
