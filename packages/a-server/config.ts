import { resolve } from "path";
import { load } from "js-yaml";

const configPath = resolve("../../config.yaml");
const rawConfig = await Bun.file(configPath).text();
const config = load(rawConfig) as Record<string, any>;

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
