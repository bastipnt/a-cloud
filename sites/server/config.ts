import { resolve } from "path";
import { load } from "js-yaml";

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

interface Endpoint {
  api: string;
}

interface Internal {
  disableRegistration: string;
}

interface ServerConfig {
  serverKeys: ServerKeys;
  jwt: JWT;
  db: DB;
  s3?: S3;
  endpoint: Endpoint;
  internal: Internal;
}

const configPath = resolve(__dirname, "../../config.yaml");
const rawConfig = await Bun.file(configPath).text();
const config = load(rawConfig) as ServerConfig;

export const serverKeys = {
  encryptionKey: config.serverKeys.encryptionKey as Base64URLString,
  hashingKey: config.serverKeys.hashingKey as Base64URLString,
};

export const jwtSecret = config.jwt.secret as Base64URLString;

export const dbConf = {
  host: config.db.host,
  port: config.db.port,
  name: config.db.name,
  user: config.db.user,
  password: config.db.password,
};
