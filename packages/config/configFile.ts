import { resolve } from "path";

const configFile = Bun.env.NODE_ENV === "test" ? "config.test.yaml" : "config.yaml";

export const configPath = resolve(__dirname, "../../", configFile);
