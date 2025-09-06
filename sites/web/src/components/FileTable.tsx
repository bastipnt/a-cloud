import { FilesLoadingError } from "@acloud/client";
import { useContext, useEffect } from "react";
import { Link } from "wouter";
import { useClient } from "../hooks/client";
import { FilesContext } from "../providers/FilesProvider";
import Thumbnail from "./thumbnail/Thumbnail";

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

  if (files.length === 0)
    return (
      <p>
        No files. Please{" "}
        <Link className="underline" to="/uploader">
          Upload
        </Link>{" "}
        some.
      </p>
    );

  return (
    <section className={className}>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(150px,100%),1fr))] gap-4">
        {files.map((fileData) => (
          <Thumbnail key={fileData.fileId} {...fileData} />
        ))}
      </ul>
    </section>
  );
};

export default FileTable;
