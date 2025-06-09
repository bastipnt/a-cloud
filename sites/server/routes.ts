import Elysia from "elysia";
import { downloadRoutes } from "./src/download";
import { fileRoutes } from "./src/file";
import { uploadRoutes } from "./src/upload";
import { userRoutes } from "./src/user";
import { userAuthRoutes } from "./src/userAuth";

export const routes = new Elysia()
  .use(userAuthRoutes)
  .use(userRoutes)
  .use(uploadRoutes)
  .use(downloadRoutes)
  .use(fileRoutes);
