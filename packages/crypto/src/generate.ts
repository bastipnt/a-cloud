import sodium from "libsodium-wrappers-sumo";
import type { UserKeys } from "../types";
import { encryptBoxBase64 } from "./encrypt";
import { fromBase64, toBase64 } from "./util/conversion-helper";

export const genFileKeyBase64 = async () => {
  await sodium.ready;

  return await toBase64(sodium.crypto_secretstream_xchacha20poly1305_keygen());
};

export const genRandomBytesBase64 = async (lenBytes: number) => {
  await sodium.ready;
  return await toBase64(sodium.randombytes_buf(lenBytes));
};

export const genNonce = async () => {
  await sodium.ready;
  return sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
};

export const genNonceBase64 = async () => {
  return await toBase64(await genNonce());
};

export const genSaltBase64 = async () => {
  return await genRandomBytesBase64(sodium.crypto_pwhash_SALTBYTES);
};

export const genEncryptionKeyBase64 = async () => {
  await sodium.ready;
  return await toBase64(sodium.crypto_kdf_keygen());
};

export const deriveKeyBase64 = async (
  userPassword: string,
  salt: string,
  opsLimit: number,
  memLimit: number,
) => {
  await sodium.ready;
  return await toBase64(
    sodium.crypto_pwhash(
      sodium.crypto_secretbox_KEYBYTES,
      sodium.from_string(userPassword),
      await fromBase64(salt),
      opsLimit,
      memLimit,
      sodium.crypto_pwhash_ALG_ARGON2ID13,
    ),
  );
};

export const deriveSensitiveKeyBase64 = async (userPassword: string, salt: string) => {
  await sodium.ready;

  const desiredStrength =
    sodium.crypto_pwhash_MEMLIMIT_SENSITIVE * sodium.crypto_pwhash_OPSLIMIT_SENSITIVE;

  let memLimit = sodium.crypto_pwhash_MEMLIMIT_MODERATE; // = 256 MB

  const factor = Math.floor(
    sodium.crypto_pwhash_MEMLIMIT_SENSITIVE / sodium.crypto_pwhash_MEMLIMIT_MODERATE,
  ); // = 4

  let opsLimit = sodium.crypto_pwhash_OPSLIMIT_SENSITIVE * factor; // = 16

  if (memLimit * opsLimit != desiredStrength) {
    throw new Error(`Invalid mem and ops limits: ${memLimit}, ${opsLimit}`);
  }

  const minMemLimit = sodium.crypto_pwhash_MEMLIMIT_MIN;
  while (memLimit > minMemLimit) {
    try {
      const key = await deriveKeyBase64(userPassword, salt, opsLimit, memLimit);
      return { key, opsLimit, memLimit };
    } catch {
      opsLimit *= 2;
      memLimit /= 2;
    }
  }
  throw new Error("Failed to derive key: Memory limit exceeded");
};

/**
 *
 * @returns [privateKey, publicKey]
 */
export const genKeyPairBase64 = async (): Promise<[string, string]> => {
  await sodium.ready;

  const keyPair = sodium.crypto_box_keypair();
  return [await toBase64(keyPair.publicKey), await toBase64(keyPair.privateKey)];
};

/**
 *
 * @param userPassword
 * @returns UserKeys for new user
 */
export const genNewUserKeys = async (userPassword: string): Promise<UserKeys> => {
  const mainKey = await genEncryptionKeyBase64();
  const recoveryKey = await genEncryptionKeyBase64();

  const keyEncryptionKeySalt = await genSaltBase64();
  const keyEncryptionKey = await deriveSensitiveKeyBase64(userPassword, keyEncryptionKeySalt);

  const [encryptedMainKey, mainKeyNonce] = await encryptBoxBase64(mainKey, keyEncryptionKey.key);

  const [encryptedMainKeyWithRecoveryKey, mainKeyWithRecoveryKeyNonce] = await encryptBoxBase64(
    mainKey,
    recoveryKey,
  );

  const [encryptedRecoveryKey, recoveryKeyNonce] = await encryptBoxBase64(recoveryKey, mainKey);

  const [privateKey, publicKey] = await genKeyPairBase64();
  const [encryptedPrivateKey, privateKeyNonce] = await encryptBoxBase64(privateKey, mainKey);

  return {
    keyEncryptionKeySalt,

    encryptedMainKey,
    mainKeyNonce,

    encryptedMainKeyWithRecoveryKey,
    mainKeyWithRecoveryKeyNonce,

    encryptedRecoveryKey,
    recoveryKeyNonce,

    publicKey,
    encryptedPrivateKey,
    privateKeyNonce,

    opsLimit: keyEncryptionKey.opsLimit,
    memLimit: keyEncryptionKey.memLimit,
  };
};

/**
 * generate one time token
 *
 * @returns one time token with 6 digits
 */
export const genOTT = () => {
  const numDigits = 6;
  const digits = "0123456789";
  let ott = "";
  const len = digits.length;
  for (let i = 0; i < numDigits; i++) {
    ott += digits[Math.floor(Math.random() * len)];
  }

  return ott;
};

/**
 * generate alphanumeric one time token
 *
 * @returns one time token with 6 digits
 */
export const genOTTAlphaNum = () => {
  const numDigits = 6;
  const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
  let ott = "";
  const len = digits.length;
  for (let i = 0; i < numDigits; i++) {
    ott += digits[Math.floor(Math.random() * len)];
  }
  return ott;
};
