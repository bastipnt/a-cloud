import { AFile } from "a-media";
import { ChangeEvent, useState } from "react";
import { useClient } from "../hooks/client";
import { useCrypto } from "../hooks/crypto";

const FileUploadSingle: React.FC = () => {
  const [aFiles, setAFiles] = useState<AFile[]>();
  const { uploadStream } = useClient();
  const { encryptFile } = useCrypto();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAFiles = [];

      for (const file of e.target.files) {
        const aFile = new AFile(file);
        newAFiles.push(aFile);
        console.log(aFile);
      }

      setAFiles(newAFiles);
    }
  };

  const handleUploadClick = async () => {
    if (!aFiles || aFiles.length === 0) {
      return;
    }

    const encryptedFile = await encryptFile(aFiles[0].file);

    await uploadStream(encryptedFile);
  };

  return (
    <div>
      <input multiple type="file" onChange={handleFileChange} />

      {aFiles && (
        <ul>
          {Object.values(aFiles).map((aFile) => (
            <li key={aFile.file.name}>
              {aFile.file.name} - {aFile.file.type}
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleUploadClick}>Upload</button>
    </div>
  );
};

export default FileUploadSingle;
