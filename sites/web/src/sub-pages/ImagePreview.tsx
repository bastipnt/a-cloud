import { FileData } from "@acloud/media";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import Spinner from "../components/svg/Spinner";
import { useClient } from "../hooks/client";
import { useModalScroll } from "../hooks/modalScroll";
import { FilesContext } from "../providers/FilesProvider";
import { KeyboardContext } from "../providers/KeyboardProvider";

const ImagePreview: React.FC = () => {
  useModalScroll();

  const imgRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<FileData["metadata"]>();
  const [matchImage, params] = useRoute("/image/:fileId");
  const [_, navigate] = useLocation();
  const { getThumbnail, nextFileId, prevFileId } = useContext(FilesContext);
  const { keyPressed } = useContext(KeyboardContext);

  const { getFile, loadImage } = useClient();

  const setImgSrc = (imgFile: File) => {
    if (!imgRef.current) return;
    const imgUrl = URL.createObjectURL(imgFile);

    imgRef.current.src = imgUrl;
  };

  const load = async (fileId: string) => {
    setLoading(true);
    const thumbnail = getThumbnail(fileId);

    if (thumbnail) setImgSrc(thumbnail.file);

    const fileData = await getFile(fileId);
    if (fileData === null || !fileData.fileDecryptionHeader) return;

    setMetadata(fileData.metadata);

    const image = await loadImage({
      fileId,
      fileName: fileData.metadata.fileName,
      fileKey: fileData.fileKey,
      fileDecryptionHeader: fileData.fileDecryptionHeader,
      chunkCount: fileData.metadata.chunkCount,
    });

    setImgSrc(image);
    setLoading(false);
  };

  useEffect(() => {
    if (!matchImage || !params.fileId) return;

    load(params.fileId);
  }, [matchImage, params?.fileId, getFile]);

  useEffect(() => {
    if (keyPressed("ArrowRight")) navigate(`/image/${nextFileId(params!.fileId)}`);
    else if (keyPressed("ArrowLeft")) navigate(`/image/${prevFileId(params!.fileId)}`);
    else if (keyPressed("Escape")) navigate("/");
  }, [keyPressed, nextFileId, prevFileId]);

  return (
    <section className="fixed top-0 left-0 h-full w-full bg-white p-4 dark:bg-gray-900">
      <div className="absolute flex flex-row gap-8">
        <Link className="cursor-pointer" to="/">
          Back
        </Link>
        <Link className="cursor-pointer" to={`/image/${prevFileId(params!.fileId)}`}>
          Prev
        </Link>
        <Link className="cursor-pointer" to={`/image/${nextFileId(params!.fileId)}`}>
          Next
        </Link>
      </div>
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
