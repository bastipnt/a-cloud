import { db } from "../db";

export const getKeyParamsByUserId = (userId: string) => {
  return db.query.keysTable.findFirst({
    where: (k, { eq }) => eq(k.userId, userId),
    columns: {
      encryptedMainKey: true,
      keyEncryptionKeySalt: true,
      mainKeyNonce: true,
      memLimit: true,
      opsLimit: true,
    },
  });
};
