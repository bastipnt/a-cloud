import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import FileTable from "../components/FileTable";

const Index: React.FC = () => {
  const [_, navigate] = useLocation();

  // TODO: find a better way to do this
  const [matchImage] = useRoute("/image/:id");
  const [matchUploader] = useRoute("/uploader");
  const [matchRoot] = useRoute("/");

  useEffect(() => {
    if (!matchRoot && !matchImage && !matchUploader) navigate("/");
  }, [matchImage, matchRoot, matchUploader]);

  return (
    <>
      <FileTable className="col-span-3 col-start-1" />
    </>
  );
};

export default Index;
