import Elysia from "elysia";
import { FileDataService } from "./service";
import { fileDataPlugin } from "./plugins";
import { withUserIdPlugin } from "../user/plugins";

export const fileDataRoutes = new Elysia({ prefix: "/files" })
  .decorate("fileDataService", FileDataService)
  .use(withUserIdPlugin)
  .use(fileDataPlugin)
  .get("/", async ({ fileDataService, userId }) => {
    const files = await fileDataService.getFiles(userId);

    return { files };
  })
  .get(
    "/:fileId",
    async ({ params: { fileId }, fileDataService, userId }) => {
      const file = await fileDataService.getFile(userId, fileId);

      return { file };
    },
    { params: "fileDataParams" },
  )
  .post(
    "/",
    async ({ body, fileDataService, userId }) => {
      const fileId = await fileDataService.saveFile(userId, body);

      return { message: "saved", fileId };
    },
    { body: "uploadParams" },
  )
  .post(
    "/soft-delete/:fileId",
    async ({ params: { fileId }, fileDataService, userId }) => {
      await fileDataService.softDeleteFile(userId, fileId);

      return { message: "deleted", fileId };
    },
    { params: "fileDataParams" },
  );
