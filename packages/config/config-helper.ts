import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const getFullPath = (importUrl: string, ...paths: string[]) => {
  const __filename = fileURLToPath(importUrl);
  const __dirname = dirname(__filename);

  return resolve(__dirname, ...paths);
};

export const isTestENV = process.env.NODE_ENV === "test";
const configFile = isTestENV ? "config.test.yaml" : "config.yaml";

export const configPath = getFullPath(import.meta.url, "../../", configFile);
