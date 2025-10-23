import Elysia from "elysia";
import { downloadFileParams } from "./model";

export const downloadPlugin = new Elysia({ name: "download/plugin" }).model({ downloadFileParams });
