import { Route, Switch } from "wouter";
import Header from "./Header";
import Layout from "./Layout";
import FinishSignUp from "./pages/FinishSignUp";
import ImagePreview from "./pages/ImagePreview";
import Index from "./pages/Index";
import OTT from "./pages/OTT";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import FilesProvider from "./providers/FilesProvider";
import ScrollBehaviorProvider from "./providers/ScrollBehaviorProvider";
import UserProvider from "./providers/UserProvider";

function App() {
  return (
    <ScrollBehaviorProvider>
      <Layout>
        <Switch>
          <Route path="/sign-up" component={SignUp} />
          <Route path="/ott" component={OTT} />
          <Route path="/finish-sign-up" component={FinishSignUp} />
          <Route path="/sign-in" component={SignIn} />

          <Route path="/" nest>
            <UserProvider>
              <FilesProvider>
                <Header />
                <Index />
                <Route path="/image/:id" component={ImagePreview} />
              </FilesProvider>
            </UserProvider>
          </Route>
        </Switch>
      </Layout>
    </ScrollBehaviorProvider>
  );
}

export default App;
