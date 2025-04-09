import { Elysia } from "elysia";
import { uploadRoutes } from "./src/upload";
import { cors } from "@elysiajs/cors";
import { downloadRoutes } from "./src/download";
import { migrateDB } from "./src/db";
import { userRoutes } from "./src/user";
import { userAuthRoutes } from "./src/userAuth";

migrateDB();

export const app = new Elysia()
  .use(
    cors({
      allowedHeaders: ["Content-Type"],
      credentials: true,
      origin: "localhost:5173",
    })
  )
  .use(userAuthRoutes)
  .use(userRoutes)
  .use(uploadRoutes)
  .use(downloadRoutes);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
