import { generateServerKeys } from "@acloud/crypto";
import { configPath, isTestENV } from "./config-helper";

const generateConfig = async () => {
  console.log("Generating config...");

  const serverKeys = await generateServerKeys();

  const config = `
serverKeys:
  encryptionKey: ${serverKeys.encryptionKey}
  hashingKey: ${serverKeys.hashingKey}

jwt:
  secret: ${serverKeys.jwtSecret}

db:
  host: localhost
  port: 5432
  name: ${isTestENV ? "acloud_test" : "acloud"}
  user: acloud
  password: acloud123

endpoint:
  api: "http://localhost:3000"

internal:
  disableRegistration: false
`.trim();

  await Bun.write(configPath, config);

  console.log(`Config written to ${configPath}`);
};

generateConfig();
