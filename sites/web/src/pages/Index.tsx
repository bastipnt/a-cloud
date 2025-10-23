import { useContext, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import FileTable from "../components/FileTable";
import { useDrop } from "../hooks/useDrop";
import { UploadsContext } from "../providers/UploadsProvider";
import { IMAGE_SLUG, MARKDOWN_SLUG, PDF_SLUG, TEXT_SLUG } from "../utils/urlHelper";

const Index: React.FC = () => {
  const [_, navigate] = useLocation();

  // TODO: find a better way to do this
  const [matchImage] = useRoute(`/${IMAGE_SLUG}/:id`);
  const [matchPDF] = useRoute(`/${PDF_SLUG}/:id`);
  const [matchMD] = useRoute(`/${MARKDOWN_SLUG}/:id`);
  const [matchText] = useRoute(`/${TEXT_SLUG}/:id`);
  const [matchUploader] = useRoute("/uploader");
  const [matchRoot] = useRoute("/");

  useEffect(() => {
    if (!matchRoot && !matchImage && !matchUploader && !matchPDF && !matchMD && !matchText)
      navigate("/");
  }, [matchImage, matchRoot, matchUploader, matchPDF, matchMD, matchText, navigate]);

  const { enqueue } = useContext(UploadsContext);
  const { isDragover } = useDrop(enqueue);

  return (
    <>
      <FileTable className="col-span-3 col-start-1" />
      {isDragover && (
        <div className="fixed top-0 left-0 flex h-full w-full flex-row items-center justify-center border-2 border-dashed border-gray-200 bg-gray-700/70">
          <span>Drop your Files here</span>
        </div>
      )}
    </>
  );
};

export default Index;
