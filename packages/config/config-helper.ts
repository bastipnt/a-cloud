import { resolve } from "path";

export const isTestENV = Bun.env.NODE_ENV === "test";

const configFile = isTestENV ? "config.test.yaml" : "config.yaml";
export const configPath = resolve(__dirname, "../../", configFile);
