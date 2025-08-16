import { FileData } from "@acloud/media";
import { PointerEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { Link, useLocation, useRoute } from "wouter";
import Close from "../components/svg/Close";
import Spinner from "../components/svg/Spinner";
import { useClient } from "../hooks/client";
import { useModalScroll } from "../hooks/modalScroll";
import { useScroll } from "../hooks/useMouse";
import { FilesContext } from "../providers/FilesProvider";
import { KeyboardContext } from "../providers/KeyboardProvider";
import { clamp } from "../utils/numberUtils";
import { getImagePreviewUrl, IMAGE_SLUG } from "../utils/urlHelper";

const MAX_ZOOM = 6 as const;
const MIN_ZOOM = 1 as const;
const WHEEL_ZOOM_SPEED = 0.01 as const;

type ImgDimensions = {
  tx: number;
  ty: number;
  scale: number;
};

const ImagePreview: React.FC = () => {
  useModalScroll();

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSrc, setImgSrc] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<FileData["metadata"]>();
  const [imgDimensions, setImgDimensions] = useState<ImgDimensions>({ tx: 0, ty: 0, scale: 1 });

  const [matchImage, params] = useRoute(`/${IMAGE_SLUG}/:fileId`);
  const [_, navigate] = useLocation();
  const { getThumbnail, nextFileId, prevFileId } = useContext(FilesContext);
  const { keyPressed } = useContext(KeyboardContext);

  const getTransform = (newTx: number, newTy: number, newScale: number) => {
    const maxTx = 0;
    const maxTy = 0;
    const minTx = (1 - newScale) * window.innerWidth;
    const minTy = (1 - newScale) * window.innerHeight;

    return {
      tx: clamp(newTx, minTx, maxTx),
      ty: clamp(newTy, minTy, maxTy),
    };
  };

  const zoom = (zoomFactor: number, mouseX?: number, mouseY?: number) =>
    setImgDimensions((prevDimensions) => {
      const prevScale = prevDimensions.scale;
      const newScale = clamp(prevScale * zoomFactor, MIN_ZOOM, MAX_ZOOM);

      const prevTx = prevDimensions.tx;
      const prevTy = prevDimensions.ty;

      const mx = mouseX ?? window.innerWidth / 2;
      const my = mouseY ?? window.innerHeight / 2;

      const imgX = (mx - prevTx) / prevScale;
      const imgY = (my - prevTy) / prevScale;

      const newTx = mx - imgX * newScale;
      const newTy = my - imgY * newScale;

      return {
        ...getTransform(newTx, newTy, newScale),
        scale: newScale,
      };
    });

  useScroll((e) => {
    // Normalize delta across devices/modes
    const deltaPixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const zoomFactor = Math.exp(-deltaPixels * WHEEL_ZOOM_SPEED);

    const mx = e.clientX;
    const my = e.clientY;

    zoom(zoomFactor, mx, my);
  });

  const { getFile, loadImage } = useClient();

  const setImgUrl = (imgFile: File) => {
    const imgUrl = URL.createObjectURL(imgFile);
    setImgSrc(imgUrl);
  };

  const load = async (fileId: string) => {
    setLoading(true);
    const thumbnail = getThumbnail(fileId);

    if (thumbnail) setImgUrl(thumbnail.file);

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

    setImgUrl(image);
    setLoading(false);
  };

  useEffect(() => {
    if (!matchImage || !params.fileId) return;

    load(params.fileId);
  }, [matchImage, params?.fileId, getFile]);

  const zoomIn = () => zoom(1.5);
  const zoomOut = () => zoom(0.5);
  const resetZoom = () => setImgDimensions({ tx: 0, ty: 0, scale: 1 });

  const customNavigate = (to: string) => {
    resetZoom();
    navigate(to);
  };

  useEffect(() => {
    if (keyPressed("ArrowRight")) customNavigate(`/${IMAGE_SLUG}/${nextFileId(params!.fileId)}`);
    else if (keyPressed("ArrowLeft"))
      customNavigate(`/${IMAGE_SLUG}/${prevFileId(params!.fileId)}`);
    else if (keyPressed("Escape")) customNavigate("/");
    else if (keyPressed("+")) zoomIn();
    else if (keyPressed("-")) zoomOut();
    else if (keyPressed(" ")) resetZoom();
  }, [keyPressed, nextFileId, prevFileId]);

  type PanPos = { x: number; y: number };

  const [panning, setPanning] = useState(false);
  const panPos = useRef<PanPos>({ x: 0, y: 0 });

  const handlePointerDown = (e: PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    setPanning(true);
    panPos.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = () => setPanning(false);
  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLImageElement>) => {
      if (!panning) return;
      e.preventDefault();

      const oldPanPos = panPos.current;
      const dx = e.clientX - oldPanPos.x;
      const dy = e.clientY - oldPanPos.y;

      setImgDimensions((prevImgDimensions) => ({
        ...prevImgDimensions,
        ...getTransform(
          prevImgDimensions.tx + dx,
          prevImgDimensions.ty + dy,
          prevImgDimensions.scale,
        ),
      }));

      panPos.current = { x: e.clientX, y: e.clientY };
    },
    [panning],
  );

  return (
    <section className="fixed top-0 left-0 flex h-full w-full flex-row justify-center bg-white align-middle dark:bg-gray-900">
      <Link className="absolute top-4 right-4 z-10 cursor-pointer" to="/">
        <Close />
      </Link>
      <div className="absolute bottom-4 z-10 flex flex-row gap-8 rounded-sm bg-gray-500 px-4 py-2">
        <Link className="cursor-pointer" to={getImagePreviewUrl(prevFileId(params!.fileId))}>
          Prev
        </Link>
        <Link className="cursor-pointer" to={getImagePreviewUrl(nextFileId(params!.fileId))}>
          Next
        </Link>
      </div>
      {loading && <Spinner className="fixed top-4 right-4" />}
      <img
        className={twJoin(
          "h-full w-full object-contain text-center leading-[100vh]",
          panning && "cursor-move",
        )}
        src={imgSrc}
        alt={`${metadata?.fileName}`}
        ref={imgRef}
        style={{
          transform: `translate(${imgDimensions.tx}px, ${imgDimensions.ty}px) scale(${imgDimensions.scale})`,
          transformOrigin: "0 0",
          userSelect: "none",
          imageRendering: imgDimensions.scale > 1.2 ? "pixelated" : "auto",
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
    </section>
  );
};

export default ImagePreview;
