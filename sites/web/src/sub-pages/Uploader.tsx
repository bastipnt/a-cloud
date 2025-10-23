import { useContext } from "react";
import { Link, useLocation } from "wouter";
import Close from "../components/svg/Close";
import FileUploadForm from "../forms/FileUploadForm";
import { useModalScroll } from "../hooks/modalScroll";
import { UploadsContext } from "../providers/UploadsProvider";

const Uploader: React.FC = () => {
  useModalScroll();
  const [_, navigate] = useLocation();
  const { enqueue } = useContext(UploadsContext);

  const handleSubmit = async ({ files }: { files: File[] }) => {
    if (!files || files.length === 0) return;

    enqueue(files);
    navigate("/");
  };

  return (
    <section className="fixed top-0 left-0 flex h-full w-full flex-col items-center justify-center bg-white/80 p-4 dark:bg-gray-900/80">
      <div className="w-2xl max-w-full rounded-lg bg-white p-4 dark:bg-gray-600">
        <div className="flex flex-row justify-between">
          <h2>Upload</h2>
          <Link className="cursor-pointer" to="/">
            <Close />
          </Link>
        </div>

        <FileUploadForm handleSubmit={handleSubmit} />
      </div>
    </section>
  );
};

export default Uploader;
