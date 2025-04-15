import { testUsers } from "@acloud/testing";
import { eq } from "drizzle-orm";
import { db } from ".";
import { keysTable } from "./schema/keys";
import { srpsTable } from "./schema/srps";
import { usersTable } from "./schema/users";

const assureTestEnv = () => {
  if (Bun.env.NODE_ENV !== "test") throw new Error("Not a test environment");
};

type Name = keyof typeof testUsers;

export const createNewTestUser = async (name: Name) => {
  assureTestEnv();
  const testUser = testUsers[name];

  await db.insert(usersTable).values({
    ...testUser.emailParams,
    userId: testUser.userId,
  });
};

export const createVerifiedTestUser = async (name: Name) => {
  assureTestEnv();
  const testUser = testUsers[name];
  await createNewTestUser(name);

  await db
    .update(usersTable)
    .set({ hasEmailVerified: true })
    .where(eq(usersTable.userId, testUser.userId));
};

export const createSignedUpTestUser = async (name: Name) => {
  assureTestEnv();
  const testUser = testUsers[name];
  await createVerifiedTestUser(name);

  await db.insert(keysTable).values({
    userId: testUser.userId,
    ...testUser.signUpParams.keyParams,
  });

  await db.insert(srpsTable).values({
    userId: testUser.userId,
    ...testUser.signUpParams.srpParams,
  });
};
