import { getHashBase64 } from "@acloud/crypto";
import { db } from "..";
import { serverKeys } from "../../../config";

export const findUserByEmail = async (email: string) => {
  const emailHash = await getHashBase64(email, serverKeys.hashingKey);

  return await db.query.usersTable.findFirst({ where: (u, { eq }) => eq(u.emailHash, emailHash) });
};

export const findUserByUserId = async (userId: string) => {
  return await db.query.usersTable.findFirst({ where: (u, { eq }) => eq(u.userId, userId) });
};

export const findOttByUserId = async (userId: string) => {
  return await db.query.ottsTable.findFirst({ where: (o, { eq }) => eq(o.userId, userId) });
};
