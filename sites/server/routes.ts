import Elysia from "elysia";
import { userAuthRoutes } from "./src/auth";
import { downloadRoutes } from "./src/download";
import { uploadRoutes } from "./src/upload";
import { userRoutes } from "./src/user";
import { fileDataRoutes } from "./src/file-data";

export const routes = new Elysia()
  .use(userAuthRoutes)
  .use(userRoutes)
  .use(uploadRoutes)
  .use(downloadRoutes)
  .use(fileDataRoutes);
