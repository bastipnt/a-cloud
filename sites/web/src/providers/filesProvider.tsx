import { FileData } from "@acloud/media";
import { createContext, ReactNode, useCallback, useState } from "react";
import { arrayUniqueByKey } from "../utils/arrayUtils";

type Thumbnail = {
  fileId: string;
  file: File;
};

type FilesContextType = {
  files: FileData[];
  setFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
  addFiles: (files: FileData[]) => void;

  thumbnails: Thumbnail[];
  setThumbnails: React.Dispatch<React.SetStateAction<Thumbnail[]>>;
  addThumbnail: (thumbnail: Thumbnail) => void;
  getThumbnail: (fileId: string) => Thumbnail | undefined;

  nextFileId: (currentFileId: string) => string;
  prevFileId: (currentFileId: string) => string;
};

export const FilesContext = createContext<FilesContextType>({
  files: [],
  setFiles: () => {},
  addFiles: () => {},

  thumbnails: [],
  setThumbnails: () => {},
  addThumbnail: () => {},
  getThumbnail: () => undefined,

  nextFileId: (currentFileId: string) => currentFileId,
  prevFileId: (currentFileId: string) => currentFileId,
});

type FilesProviderProps = {
  children: ReactNode;
};

const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const addFiles = (newFiles: FileData[]) =>
    setFiles((oldFiles) => arrayUniqueByKey([...newFiles, ...oldFiles], "fileId"));

  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const addThumbnail = (newThumbnail: Thumbnail) =>
    setThumbnails((oldThumbnails) => arrayUniqueByKey([newThumbnail, ...oldThumbnails], "fileId"));

  const getThumbnail = useCallback(
    (fileId: string) => thumbnails.find((thumbnail) => thumbnail.fileId === fileId),
    [thumbnails],
  );

  const prevNextFileId = useCallback(
    (currentFileId: string, indexModifier: number) => {
      const index = files.findIndex((file) => file.fileId === currentFileId);

      if (index === -1) return currentFileId;
      if (index === files.length - 1 && indexModifier === 1) return files[index].fileId;
      if (index === 0 && indexModifier === -1) return files[index].fileId;

      return files[index + indexModifier].fileId;
    },
    [files],
  );

  const nextFileId = (currentFileId: string) => prevNextFileId(currentFileId, 1);
  const prevFileId = (currentFileId: string) => prevNextFileId(currentFileId, -1);

  return (
    <FilesContext.Provider
      value={{
        files,
        setFiles,
        addFiles,
        thumbnails,
        setThumbnails,
        addThumbnail,
        getThumbnail,
        nextFileId,
        prevFileId,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
};

export default FilesProvider;
