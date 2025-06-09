import { type testUsers } from "@acloud/testing";
import { Page } from "@playwright/test";

export const signIn = async (page: Page, testUser: (typeof testUsers)["ben"]) => {
  await page.goto("/");
  await page.waitForURL("/sign-in");

  await page.getByRole("textbox", { name: "Email" }).fill(testUser.email);
  await page.getByRole("textbox", { name: "Password" }).fill(testUser.password);
  await page.getByRole("button", { name: "Submit" }).click();

  await page.waitForURL("/");
};
