import { useContext, useState } from "react";
import FileUploadForm from "../forms/FileUploadForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";
import { FilesContext } from "../providers/filesProvider";

const FileUpload: React.FC = () => {
  const { addFiles } = useContext(FilesContext);

  const { uploadFiles } = useClient();
  const { getMainKeyBase64 } = useStorage();
  const [showUploadedMessage, setShowUploadedMessage] = useState(false);

  const handleSubmit = async ({ files }: { files: File[] }) => {
    if (!files || files.length === 0) return;
    const mainKey = await getMainKeyBase64();

    const uploadedFiles = await uploadFiles(files, mainKey);

    setShowUploadedMessage(true);
    addFiles(uploadedFiles);
  };

  return (
    <div className="flex flex-col gap-8">
      {showUploadedMessage && <p>Files uploaded!</p>}

      <FileUploadForm handleSubmit={handleSubmit} />
    </div>
  );
};

export default FileUpload;
