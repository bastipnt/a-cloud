import Elysia, { t } from "elysia";
import { randomUUIDv7 } from "bun";

const dataDir = Bun.env.DATA_DIR;

export const uploadRoutes = new Elysia({ prefix: "/upload" }).post(
  "/file",
  async ({ body: { file } }) => {
    const uuid = randomUUIDv7();

    console.log(file.size, file.name, dataDir);
    Bun.write([dataDir, uuid].join("/"), file);
  },
  {
    body: t.Object({
      file: t.File(),
    }),
  }
);
