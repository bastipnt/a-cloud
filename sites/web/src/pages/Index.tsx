import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import FileTable from "../components/FileTable";
import FileUpload from "../components/FileUpload";

const Index: React.FC = () => {
  const [_, navigate] = useLocation();

  const [matchImage] = useRoute("/image/:id");
  const [matchRoot] = useRoute("/");

  useEffect(() => {
    if (!matchRoot && !matchImage) navigate("/");
  }, [matchImage, matchRoot]);

  return (
    <>
      <FileTable className="col-span-3 col-start-1" />

      <FileUpload />
    </>
  );
};

export default Index;
