import { generateServerKeys } from "@acloud/crypto";
import { configPath, isTestENV } from "./config-helper";

const generateConfig = async () => {
  console.log("Generating config...");

  const serverKeys = await generateServerKeys();

  const getDbConfig = (dbConfigName: string, dbName: string) =>
    `
${dbConfigName}:
  host: localhost
  port: 5432
  name: ${dbName}
  user: acloud
  password: acloud123
  `.trim();

  const dbConfigs: string[] = [];

  if (isTestENV) {
    dbConfigs.push(getDbConfig("dbTest", "acloud_test"));
    dbConfigs.push(getDbConfig("dbTestWeb", "acloud_test_web"));
  } else {
    dbConfigs.push(getDbConfig("db", "acloud"));
  }

  const config = `
serverKeys:
  encryptionKey: ${serverKeys.encryptionKey}
  hashingKey: ${serverKeys.hashingKey}

jwt:
  secret: ${serverKeys.jwtSecret}

${dbConfigs.join("\n\n")}

endpoint:
  api: "http://localhost:3000"

internal:
  disableRegistration: false
`.trim();

  await Bun.write(configPath, config);

  console.log(`Config written to ${configPath}`);
};

generateConfig();
