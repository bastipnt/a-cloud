import sodium from "libsodium-wrappers-sumo";
import { fromBase64, toBase64 } from "./util/conversion-helper";

export const getHashBase64 = async (
  input: string,
  hashingKey: Base64URLString
) => {
  await sodium.ready;

  return await toBase64(
    sodium.crypto_generichash(
      sodium.crypto_generichash_BYTES,
      input,
      await fromBase64(hashingKey)
    )
  );
};
