import { migrateDB } from "@acloud/db";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { routes } from "./routes";

migrateDB();

export const app = new Elysia()
  .use(
    cors({
      allowedHeaders: ["Content-Type"],
      credentials: true,
      origin: "localhost:5173",
    }),
  )
  .use(routes);

app.listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
