import { FileData } from "@acloud/media";
import { createContext, ReactNode, useState } from "react";

type FilesContextType = {
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  addFiles: (files: FileData[]) => void;
};

export const FilesContext = createContext<FilesContextType>({
  files: [],
  setFiles: () => {},
  addFiles: () => {},
});

type FilesProviderProps = {
  children: ReactNode;
};

const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const addFiles = (newFiles: FileData[]) => setFiles((oldFiles) => [...newFiles, ...oldFiles]);

  return (
    <FilesContext.Provider value={{ files, setFiles, addFiles }}>{children}</FilesContext.Provider>
  );
};

export default FilesProvider;
