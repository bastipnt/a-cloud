import { useContext } from "react";
import { UploadsContext } from "../providers/UploadsProvider";

const UploadInfo: React.FC = () => {
  const { uploadQueue } = useContext(UploadsContext);

  if (uploadQueue.length <= 0) return;

  return (
    <div className="fixed right-4 bottom-4 z-10 rounded-lg bg-gray-600 p-8">
      <ul>
        {uploadQueue.map(({ fileName, state }) => (
          <li key={fileName}>
            {fileName} | {state}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadInfo;
