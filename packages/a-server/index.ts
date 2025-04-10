import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { migrateDB } from "./src/db";
import { downloadRoutes } from "./src/download";
import { uploadRoutes } from "./src/upload";
import { userRoutes } from "./src/user";
import { userAuthRoutes } from "./src/userAuth";

migrateDB();

export const app = new Elysia()
  .use(
    cors({
      allowedHeaders: ["Content-Type"],
      credentials: true,
      origin: "localhost:5173",
    }),
  )
  .use(userAuthRoutes)
  .use(userRoutes)
  .use(uploadRoutes)
  .use(downloadRoutes);

app.listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
