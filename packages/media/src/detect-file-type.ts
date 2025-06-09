class DetectFileTypeError extends Error {
  override name: string = "DetectFileTypeError";
}

const getFileHeader = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onloadend = (e) => {
      if (!e || !e.target || !e.target.result) return reject(new DetectFileTypeError());
      if (typeof e.target.result === "string") return reject(new DetectFileTypeError());

      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        const part = arr[i];
        if (part) header += part.toString(16);
      }

      resolve(header);
    };

    fileReader.readAsArrayBuffer(file);
  });

export const detectFileType = async (file: File) => {
  const header = await getFileHeader(file);
  let type = "";

  switch (header) {
    case "89504e47":
      type = "image/png";
      break;
    case "47494638":
      type = "image/gif";
      break;
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
    case "ffd8ffe3":
    case "ffd8ffe8":
      type = "image/jpeg";
      break;
    default:
      type = "unknown"; // Or you can use the blob.type as fallback
      break;
  }

  return type;
};
