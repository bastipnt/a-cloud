import "./App.css";
import { Route, Switch } from "wouter";
import Layout from "./Layout";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import OTT from "./pages/OTT";
import FinishSignUp from "./pages/FinishSignUp";

function App() {
  // const { downloadFile } = useClient();
  // const { decryptFile } = useCrypto();
  // const imgRef = useRef<HTMLImageElement>(null);

  // const download = async () => {
  //   const encryptedFile = await downloadFile(
  //     "0195fbcb-6df3-7000-a48c-9359afc1b921"
  //   );
  //   if (!encryptedFile) return;

  //   const decryptedData = await decryptFile(encryptedFile);

  //   if (imgRef.current && decryptedData) {
  //     const imgFile = new Blob([decryptedData], { type: "img/png" });
  //     const imgUrl = URL.createObjectURL(imgFile);
  //     imgRef.current.src = imgUrl;
  //   }
  // };

  return (
    <>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />

          <Route path="/sign-up" component={SignUp} />
          <Route path="/ott" component={OTT} />
          <Route path="/finish-sign-up" component={FinishSignUp} />
          <Route path="/sign-in" component={SignIn} />

          <Route>404: Page not found!</Route>
        </Switch>
      </Layout>
    </>
  );
}

export default App;
