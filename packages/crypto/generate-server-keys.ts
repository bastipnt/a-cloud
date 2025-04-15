import sodium from "libsodium-wrappers-sumo";
import { genRandomBytesBase64 } from "./src/generate";

export const generateServerKeys = async () => {
  await sodium.ready;

  const encryptionKey = await genRandomBytesBase64(sodium.crypto_secretbox_KEYBYTES);
  const hashingKey = await genRandomBytesBase64(sodium.crypto_generichash_KEYBYTES_MAX);
  const jwtSecret = await genRandomBytesBase64(sodium.crypto_secretbox_KEYBYTES);

  return {
    encryptionKey,
    hashingKey,
    jwtSecret,
  };
};
