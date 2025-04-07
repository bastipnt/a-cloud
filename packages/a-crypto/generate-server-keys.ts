import sodium from "libsodium-wrappers-sumo";

import { genRandomBytesBase64 } from "./src/generate";

const generateServerKeys = async () => {
  console.log("Generating keys...\n");

  const encryptionKey = await genRandomBytesBase64(
    sodium.crypto_secretbox_KEYBYTES
  );
  const hashingKey = await genRandomBytesBase64(
    sodium.crypto_generichash_KEYBYTES_MAX
  );
  const jwtSecret = await genRandomBytesBase64(
    sodium.crypto_secretbox_KEYBYTES
  );

  console.log("serverKeys:");
  console.log("  encryptionKey:", encryptionKey);
  console.log("  hashingKey:", hashingKey);
  console.log("jwt:");
  console.log("  secret:", jwtSecret);
  console.log("\nPut these key into the config.yaml file.");
};

generateServerKeys();
