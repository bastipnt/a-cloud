import { FileData } from "@acloud/media";
import { createContext, ReactNode, useState } from "react";

type FilesContextType = {
  files: FileData[];
  setFiles: (files: FileData[]) => void;
};

export const FilesContext = createContext<FilesContextType>({
  files: [],
  setFiles: () => {},
});

type FilesProviderProps = {
  children: ReactNode;
};

const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileData[]>([]);

  return <FilesContext.Provider value={{ files, setFiles }}>{children}</FilesContext.Provider>;
};

export default FilesProvider;
