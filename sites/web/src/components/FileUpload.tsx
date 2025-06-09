import { ChangeEvent, useContext, useState } from "react";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";
import { FilesContext } from "../providers/filesProvider";

const FileUpload: React.FC = () => {
  const { setFiles } = useContext(FilesContext);
  const [selectedFiles, setSelectedFiles] = useState<File[]>();
  const { uploadFiles } = useClient();
  const { getMainKeyBase64 } = useStorage();
  const [showUploadedMessage, setShowUploadedMessage] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = [];

      for (const file of e.target.files) {
        newFiles.push(file);
      }

      setSelectedFiles(newFiles);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const mainKey = await getMainKeyBase64();

    const uploadedFiles = await uploadFiles(selectedFiles, mainKey);

    setShowUploadedMessage(true);
    setFiles(uploadedFiles);
  };

  return (
    <div>
      {showUploadedMessage && <p>Files uploaded!</p>}

      <label htmlFor="upload">Upload File</label>
      <input
        name="upload"
        id="upload"
        className="border p-1"
        multiple
        type="file"
        onChange={handleFileChange}
      />

      {selectedFiles && (
        <ul>
          {Object.values(selectedFiles).map((selectedFile) => (
            <li key={selectedFile.name}>
              {selectedFile.name} - {selectedFile.type}
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleUploadClick} name="upload">
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
