import { treaty } from "@elysiajs/eden";
import type { App } from "a-server";

export const client = treaty<App>("localhost:3000", {
  fetch: { credentials: "include" },
});

export { multipartStreamUpload } from "./src/multipart-upload";
export { uploadStream } from "./src/upload";
export { downloadFile } from "./src/download";
export {
  signIn,
  proofSignIn,
  signUp,
  finishSignUp,
  verifyOTT,
  getUser,
} from "./src/user";
