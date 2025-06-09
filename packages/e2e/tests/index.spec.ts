import { getFullPath } from "@acloud/config";
import { testUsers } from "@acloud/testing";
import { expect, test } from "@playwright/test";
import { signIn } from "../helpers/auth-helper";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("loads the page", async ({ page }) => {
  await expect(page).toHaveTitle(/a-cloud/);
});

test("it shows the sign in form", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeInViewport();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeInViewport();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Submit" })).toBeInViewport();

  await expect(page.getByRole("link", { name: "sign up" })).toBeInViewport();
});

test("it logs in an existing user", async ({ page, context }) => {
  const cookiesBefore = await context.cookies();
  expect(cookiesBefore).toStrictEqual([]);

  await signIn(page, testUsers.ben);

  expect(page.getByText(`User id: ${testUsers.ben.userId}`)).toBeVisible({ timeout: 10000 });

  const cookiesAfter = await context.cookies();
  const localStorageAfter = await page.evaluate(() => localStorage);

  expect(localStorageAfter).toMatchObject({ test: "hello" });
  expect(cookiesAfter).toMatchObject([
    {
      domain: "localhost",
      httpOnly: true,
      name: "auth",
      path: "/",
      sameSite: "Lax",
      secure: false,
    },
  ]);
});

test("it uploads an image", async ({ page }) => {
  await signIn(page, testUsers.ben);

  await page
    .getByRole("button", { name: "Upload File" })
    .setInputFiles(getFullPath(import.meta.url, "..", "test-data/test-img-1.png"));

  await page.getByRole("button", { name: "Upload", exact: true }).click();

  await expect(page.getByText("Files uploaded!")).toBeVisible();
  await expect(page.getByRole("img", { name: "thumbnail" })).toBeVisible();
  await expect(page.getByText("test-img-1.png", { exact: true })).toBeVisible();
});
