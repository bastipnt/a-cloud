import { GlobalRegistrator } from "@happy-dom/global-registrator";

const OriginalRequest = Request;
const OriginalResponse = Response;

GlobalRegistrator.register({
  url: "http://localhost:5173",
  settings: {
    fetch: { disableSameOriginPolicy: true },
  },
});

Request = OriginalRequest;
Response = OriginalResponse;
