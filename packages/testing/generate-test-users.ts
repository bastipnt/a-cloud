import { getFullPath } from "@acloud/config";
import { genUser } from "./test-data";

const generateTestData = async () => {
  console.log("Generating test data...");

  const testUserNames = ["lara", "ben", "jo", "renee", "julia", "peter", "ty", "phillis"];

  const testUsers: Record<string, Awaited<ReturnType<typeof genUser>>> = {};

  for (const name of testUserNames) {
    const testUser = await genUser(name);
    testUsers[name] = testUser;
  }

  const testDataFilePath = getFullPath(import.meta.url, "./test-users.json");
  await Bun.write(testDataFilePath, JSON.stringify(testUsers));

  console.log("Test data generated in ./test-data/test-data.json");
};

generateTestData();
