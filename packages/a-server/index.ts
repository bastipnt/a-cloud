import { Elysia } from "elysia";
import { uploadRoutes } from "./src/upload";
import { cors } from "@elysiajs/cors";
import { downloadRoutes } from "./src/download";
import { db } from "./src/db";
import { usersTable } from "./src/db/schema/users";
import { userRoutes } from "./src/user";

// migrateDB();

export const app = new Elysia()
  .use(cors())
  .use(userRoutes)
  .use(uploadRoutes)
  .use(downloadRoutes);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
