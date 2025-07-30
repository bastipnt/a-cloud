import { FilesLoadingError } from "@acloud/client";
import { useContext, useEffect } from "react";
import { useClient } from "../hooks/client";
import { FilesContext } from "../providers/filesProvider";
import Thumbnail from "./Thumbnail";

const FileTable: React.FC = () => {
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
  }, []);

  return (
    <section>
      <ul className="grid grid-cols-3 gap-4">
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
