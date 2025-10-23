import { Route, Switch } from "wouter";
import UploadInfo from "./components/UploadInfo";
import Header from "./Header";
import Layout from "./Layout";
import FinishSignUp from "./pages/FinishSignUp";
import Index from "./pages/Index";
import OTT from "./pages/OTT";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import FilesProvider from "./providers/FilesProvider";
import KeyboardProvider from "./providers/KeyboardProvider";
import KeysProvider from "./providers/KeysProvider";
import ScrollBehaviorProvider from "./providers/ScrollBehaviorProvider";
import UploadsProvider from "./providers/UploadsProvider";
import UserProvider from "./providers/UserProvider";
import WorkerProvider from "./providers/WorkerProvider";
import ImagePreview from "./sub-pages/ImagePreview";
import MarkdownPreview from "./sub-pages/MarkdownPreview";
import PDFPreview from "./sub-pages/PDFPreview";
import TextPreview from "./sub-pages/TextPreview";
import Uploader from "./sub-pages/Uploader";
import { IMAGE_SLUG, MARKDOWN_SLUG, PDF_SLUG, TEXT_SLUG } from "./utils/urlHelper";

function App() {
  return (
    <ScrollBehaviorProvider>
      <KeyboardProvider>
        <KeysProvider>
          <WorkerProvider>
            <Layout>
              <Switch>
                <Route path="/sign-up" component={SignUp} />
                <Route path="/ott" component={OTT} />
                <Route path="/finish-sign-up" component={FinishSignUp} />
                <Route path="/sign-in" component={SignIn} />

                <Route path="/" nest>
                  <UserProvider>
                    <Header />
                    <FilesProvider>
                      <UploadsProvider>
                        <UploadInfo />
                        <Index />
                        <Route path={`/${IMAGE_SLUG}/:id`} component={ImagePreview} />
                        <Route path={`/${PDF_SLUG}/:id`} component={PDFPreview} />
                        <Route path={`/${MARKDOWN_SLUG}/:id`} component={MarkdownPreview} />
                        <Route path={`/${TEXT_SLUG}/:id`} component={TextPreview} />
                        <Route path="/uploader" component={Uploader} />
                      </UploadsProvider>
                    </FilesProvider>
                  </UserProvider>
                </Route>
              </Switch>
            </Layout>
          </WorkerProvider>
        </KeysProvider>
      </KeyboardProvider>
    </ScrollBehaviorProvider>
  );
}

export default App;
