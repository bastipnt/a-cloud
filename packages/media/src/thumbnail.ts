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

export const generateImageThumbnailCanvas = async (image: File) => {
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
