import { useRef } from "react";
import "./App.css";
import FileUploadSingle from "./components/FileUpload";
import { useClient } from "./hooks/client";
import { useCrypto } from "./hooks/crypto";
import RegisterNewUser from "./pages/RegisterNewUser";

function App() {
  const { downloadFile } = useClient();
  const { decryptFile } = useCrypto();
  const imgRef = useRef<HTMLImageElement>(null);

  const download = async () => {
    const encryptedFile = await downloadFile(
      "0195fbcb-6df3-7000-a48c-9359afc1b921"
    );
    if (!encryptedFile) return;

    const decryptedData = await decryptFile(encryptedFile);

    if (imgRef.current && decryptedData) {
      const imgFile = new Blob([decryptedData], { type: "img/png" });
      const imgUrl = URL.createObjectURL(imgFile);
      imgRef.current.src = imgUrl;
    }
  };

  return (
    <>
      <h1>Hello</h1>
      <RegisterNewUser />
      <FileUploadSingle />
      <button onClick={download}>Download</button>
      <img src="" alt="Lol" ref={imgRef} />
    </>
  );
}

export default App;
