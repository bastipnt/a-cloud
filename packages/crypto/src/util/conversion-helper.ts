import sodium from "libsodium-wrappers-sumo";

export const toBase64 = async (input: Uint8Array) => {
  await sodium.ready;
  return sodium.to_base64(input, sodium.base64_variants.ORIGINAL);
};

export const fromBase64 = async (input: string) => {
  await sodium.ready;
  return sodium.from_base64(input, sodium.base64_variants.ORIGINAL);
};
