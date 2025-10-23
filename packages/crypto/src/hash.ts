import sodium from "libsodium-wrappers-sumo";
import { fromBase64, toBase64 } from "./util/conversion-helper";
import { fileToUnit8Array } from "./util/file-helper";

export const getHashBase64FromFile = async (file: File, hashingKey?: Base64URLString) => {
  const input = await fileToUnit8Array(file);
  return getHashBase64(input, hashingKey);
};

export const getHashBase64 = async (input: string | Uint8Array, hashingKey?: Base64URLString) => {
  await sodium.ready;

  return await toBase64(
    sodium.crypto_generichash(
      sodium.crypto_generichash_BYTES,
      input,
      hashingKey ? await fromBase64(hashingKey) : null,
    ),
  );
};
