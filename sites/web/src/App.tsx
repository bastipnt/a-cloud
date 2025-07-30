import "./App.css";
import { Route, Switch } from "wouter";
import Layout from "./Layout";
import FinishSignUp from "./pages/FinishSignUp";
import ImagePreview from "./pages/ImagePreview";
import Index from "./pages/Index";
import OTT from "./pages/OTT";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Provider from "./providers";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/sign-up" component={SignUp} />
          <Route path="/ott" component={OTT} />
          <Route path="/finish-sign-up" component={FinishSignUp} />
          <Route path="/sign-in" component={SignIn} />

          <Route path="/" nest>
            <Index />
            <Route path="/image/:id" component={ImagePreview} />
          </Route>
        </Switch>
      </Layout>
    </Provider>
  );
}

export default App;
