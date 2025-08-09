import { FilesLoadingError } from "@acloud/client";
import { useContext, useEffect } from "react";
import { useClient } from "../hooks/client";
import { FilesContext } from "../providers/FilesProvider";
import Thumbnail from "./Thumbnail";

type FileTableProps = {
  className?: string;
};

const FileTable: React.FC<FileTableProps> = ({ className }) => {
  const { files, setFiles } = useContext(FilesContext);
  const { getFiles } = useClient();

  useEffect(() => {
    getFiles()
      .then((files) => {
        if (!files) return;

        setFiles(files);
      })
      .catch((error) => {
        if (error instanceof FilesLoadingError) return;

        throw error;
      });
  }, [getFiles]);

  return (
    <section className={className}>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {files.map((fileData) => (
          <li key={fileData.fileId}>
            <Thumbnail {...fileData} />
            {/* <p>{fileData.metadata.fileName}</p> */}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FileTable;
