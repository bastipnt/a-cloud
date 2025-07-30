import { resolve } from "path";
import Elysia, { t } from "elysia";
import { withUserId } from "./user";

// TODO: make configable
export const dataDir = resolve(__dirname, "../../../data");

const downloadFileParams = t.Object({
  fileId: t.String(),
});

class DownloadController {
  getFile(userId: string, fileId: string, isThumbnail: boolean) {
    const fileType = isThumbnail ? "thumbnail" : "file";

    return Bun.file([dataDir, userId, fileType, fileId].join("/"));
  }
}

const downloadService = new Elysia({ name: "download/service" }).model({ downloadFileParams });

export const downloadRoutes = new Elysia({ prefix: "/download" })
  .use(withUserId)
  .use(downloadService)
  .decorate("downloadController", new DownloadController())
  .get(
    "/:fileId",
    async ({ params: { fileId }, downloadController, userId }) => {
      return downloadController.getFile(userId, fileId, false);
    },
    {
      params: "downloadFileParams",
    },
  )
  .get(
    "/thumbnail/:fileId",
    async ({ params: { fileId }, downloadController, userId }) => {
      return downloadController.getFile(userId, fileId, true);
    },
    {
      params: "downloadFileParams",
    },
  );
