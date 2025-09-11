import * as pdfjsLib from "pdfjs-dist";
// @ts-expect-error
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { extractAudioMetadata } from "./audioFile";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_THUMBNAIL_DIMENSION = 720;
const MAX_THUMBNAIL_SIZE = 100 * 1024; // 100 KB

class ThumbnailCreationError extends Error {
  override name: string = "ThumbnailCreationError";
}

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });

const canvasToCompressedJPEG = async (
  canvas: HTMLCanvasElement,
  maxSize: number,
  quality = 0.7,
  prevBlobSize = Number.MAX_SAFE_INTEGER,
) => {
  const minQuality = 0.5;
  const blob = await canvasToBlob(canvas, quality);
  if (!blob) throw new ThumbnailCreationError();
  const newBlobSize = blob.size;

  if (newBlobSize <= maxSize || quality <= minQuality) return blob;
  if (((prevBlobSize - newBlobSize) / prevBlobSize) * 100 < 10) return blob;

  const newQuality = (quality -= 1);
  return canvasToCompressedJPEG(canvas, maxSize, newQuality, newBlobSize);
};

const scaledImageDimensions = (
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } => {
  if (width == 0 || height == 0) return { width: 0, height: 0 };

  const widthScaleFactor = maxDimension / width;
  const heightScaleFactor = maxDimension / height;

  const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
  const resizedDimensions = {
    width: Math.round(width * scaleFactor),
    height: Math.round(height * scaleFactor),
  };

  if (resizedDimensions.width == 0 || resizedDimensions.height == 0) return { width: 0, height: 0 };

  return resizedDimensions;
};

export const generateImageThumbnailCanvas = async (image: File | Blob) => {
  const canvas = document.createElement("canvas");
  const canvasCtx = canvas.getContext("2d")!;

  const imageURL = URL.createObjectURL(image);

  await new Promise((resolve, reject) => {
    const image = new Image();

    image.setAttribute("src", imageURL);

    image.onload = () => {
      try {
        URL.revokeObjectURL(imageURL);

        const { width, height } = scaledImageDimensions(
          image.width,
          image.height,
          MAX_THUMBNAIL_DIMENSION,
        );
        canvas.width = width;
        canvas.height = height;
        canvasCtx.drawImage(image, 0, 0, width, height);

        resolve(undefined);
      } catch (e: unknown) {
        reject(e);
      }
    };
  });

  return await canvasToCompressedJPEG(canvas, MAX_THUMBNAIL_SIZE);
};

export const generatePDFThumbnail = async (pdfFile: File) => {
  const canvas = document.createElement("canvas");
  const canvasCtx = canvas.getContext("2d")!;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfData = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });

  const pdfDocument = await loadingTask.promise;
  // Request a first page
  const pdfPage = await pdfDocument.getPage(1);
  // Display page on the existing canvas with 100% scale.
  const viewport = pdfPage.getViewport({ scale: 1.0 });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderTask = pdfPage.render({
    canvasContext: canvasCtx,
    viewport,
    canvas,
  });
  await renderTask.promise;

  return await canvasToCompressedJPEG(canvas, MAX_THUMBNAIL_SIZE);
};

export const generateAudioThumbnail = async (audioFile: File) => {
  const audioMetadata = await extractAudioMetadata(audioFile);
  console.log(audioMetadata);

  const coverImages = audioMetadata.common.picture;
  if (!coverImages || coverImages.length === 0) return;

  // TODO: is unit8array -> to file
  const [coverImageData] = coverImages;
  if (!coverImageData) return;

  const coverImage = new Blob([coverImageData.data], { type: "image/png" });

  return generateImageThumbnailCanvas(coverImage);
};
