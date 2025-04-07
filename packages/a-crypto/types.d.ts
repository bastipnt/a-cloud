export type UserKeys = {
  keyEncryptionKeySalt: Base64URLString;
  opsLimit: number;
  memLimit: number;

  encryptedMainKey: Base64URLString;
  mainKeyNonce: Base64URLString;

  publicKey: Base64URLString;
  encryptedPrivateKey: Base64URLString;
  privateKeyNonce: Base64URLString;

  encryptedMainKeyWithRecoveryKey: Base64URLString;
  mainKeyWithRecoveryKeyNonce: Base64URLString;

  encryptedRecoveryKey: Base64URLString;
  recoveryKeyNonce: Base64URLString;
};
