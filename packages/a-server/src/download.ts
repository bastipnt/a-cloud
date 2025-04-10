import Elysia, { t } from "elysia";

const dataDir = Bun.env.DATA_DIR;

export const downloadRoutes = new Elysia({ prefix: "/download" }).get(
  "/file/:id",
  ({ params: { id } }) => Bun.file([dataDir, id].join("/")),
);
