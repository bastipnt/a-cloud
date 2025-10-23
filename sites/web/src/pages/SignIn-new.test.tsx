// import { api } from "@acloud/client/api";
import { beforeEach, describe, expect, it } from "vitest";
import { RenderResult } from "vitest-browser-react";
import { Locator, page } from "vitest/browser";
import SignIn from "./SignIn";

describe("SignIn", () => {
  let screen: RenderResult;
  let emailField: Locator;
  let passwordField: Locator;
  let submitButton: Locator;

  describe("No preexisting cookies", () => {
    beforeEach(async () => {
      screen = await page.render(<SignIn />);

      emailField = screen.getByLabelText("Email");
      passwordField = screen.getByLabelText("Password");
      submitButton = screen.getByRole("button", { name: /submit/i });
    });

    it("loads and has empty email and password field", async () => {
      expect(emailField).toHaveValue("");
      expect(passwordField).toHaveValue("");
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("shows a link, that redirects to /sing-up", async () => {
      const signUpLink = screen.getByRole("link", { name: /sign up/i });
      expect((signUpLink.element() as HTMLLinkElement).href).toMatch(
        /http:\/\/localhost:\d{4,5}\/sign-up/,
      );
    });

    // describe("form handling", () => {
    //   it("shows errors on submit for missing form values", async () => {
    //     expect(emailField).toHaveAttribute("aria-invalid", "false");

    //     submitButton.click();

    //     await waitFor(() => {
    //       expect(emailField).toHaveAttribute("aria-invalid", "true");
    //       expect(emailField).toHaveAccessibleErrorMessage("email is a required field");
    //       expect(screen.getByText("email is a required field")).toBeInTheDocument();

    //       expect(passwordField).toHaveAttribute("aria-invalid", "true");
    //       expect(passwordField).toHaveAccessibleErrorMessage("password is a required field");
    //       expect(screen.getByText("password is a required field")).toBeInTheDocument();
    //     });
    //   });

    //   it("shows and error for an invalid email", async () => {
    //     emailField.value = "invalid";

    //     await waitFor(() => {
    //       expect(emailField).toHaveAttribute("aria-invalid", "true");
    //       expect(emailField).toHaveAccessibleErrorMessage("email is a required field");
    //       expect(screen.getByText("email is a required field")).toBeInTheDocument();
    //     });
    //   });
    // });
  });
});
