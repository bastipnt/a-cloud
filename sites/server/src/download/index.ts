import Elysia from "elysia";
import { withUserIdPlugin } from "../user/plugins";
import { downloadPlugin } from "./plugins";
import { DownloadService } from "./service";

export const downloadRoutes = new Elysia({ prefix: "/download" })
  .use(withUserIdPlugin)
  .use(downloadPlugin)
  .decorate("downloadService", DownloadService)
  .get(
    "/:fileId",
    async ({ params: { fileId }, downloadService, userId }) => {
      return downloadService.getFile(userId, fileId, false);
    },
    {
      params: "downloadFileParams",
    },
  )
  .get(
    "/thumbnail/:fileId",
    async ({ params: { fileId }, downloadService, userId }) => {
      return downloadService.getFile(userId, fileId, true);
    },
    {
      params: "downloadFileParams",
    },
  );
