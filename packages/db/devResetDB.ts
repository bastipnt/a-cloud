import { resetDB } from ".";

const reset = async () => {
  console.log("Resetting DB...");
  await resetDB();
  process.exit();
};

await reset();
