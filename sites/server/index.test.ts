import { describe, expect, it } from "bun:test";
import { app } from "./index";
import { migrateDB } from "./src/db";

describe("Elysia", () => {
  it("runs db migrate", async () => {
    expect(migrateDB).toHaveBeenCalledTimes(1);
  });

  it("is running and returns NOT_FOUND on index", async () => {
    const response = await app.handle(new Request("http://localhost/")).then((res) => res.text());

    expect(response).toBe("NOT_FOUND");
  });
});
