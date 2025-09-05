import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import FileTable from "../components/FileTable";
import { IMAGE_SLUG, MARKDOWN_SLUG, PDF_SLUG } from "../utils/urlHelper";

const Index: React.FC = () => {
  const [_, navigate] = useLocation();

  // TODO: find a better way to do this
  const [matchImage] = useRoute(`/${IMAGE_SLUG}/:id`);
  const [matchPDF] = useRoute(`/${PDF_SLUG}/:id`);
  const [matchMD] = useRoute(`/${MARKDOWN_SLUG}/:id`);
  const [matchUploader] = useRoute("/uploader");
  const [matchRoot] = useRoute("/");

  useEffect(() => {
    if (!matchRoot && !matchImage && !matchUploader && !matchPDF && !matchMD) navigate("/");
  }, [matchImage, matchRoot, matchUploader, matchPDF, matchMD]);

  return (
    <>
      <FileTable className="col-span-3 col-start-1" />
    </>
  );
};

export default Index;
