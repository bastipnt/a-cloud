import { load } from "js-yaml";
import { configPath } from "./config-helper";

interface ServerKeys {
  encryptionKey: string;
  hashingKey: string;
}

interface JWT {
  secret: string;
}

interface DB {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

interface S3 {
  are_local_buckets: boolean;
  use_path_style_urls: boolean;
  "b2-eu-cen": {
    key?: string;
    secret?: string;
    endpoint: string;
    region: string;
    bucket: string;
  };
}

interface Storage {
  dataDir: string;
}

interface Endpoint {
  api: string;
}

interface Internal {
  disableRegistration: string;
}

interface ServerConfig {
  serverKeys: ServerKeys;
  jwt: JWT;
  s3?: S3;
  storage?: Storage;
  endpoint: Endpoint;
  internal: Internal;
  db: DB;
}

let rawConfig;

try {
  if (typeof Bun !== "undefined") {
    rawConfig = await Bun.file(configPath).text();
  } else {
    const fs = await import("node:fs/promises");

    rawConfig = await fs.readFile(configPath, "utf8");
  }
} catch (error) {
  console.error(`failed to load config from ${configPath}`);
  console.error("please generate it with: bun run gen:config or bun run gen:test-config");
  throw error;
}

export const config = load(rawConfig) as ServerConfig;
