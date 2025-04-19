import { api } from "@acloud/client/api";
import { findOttByUserId, findUserByEmail } from "@acloud/db";
import { testUsers } from "@acloud/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "bun:test";
import { useLocation } from "wouter";
import SignUp from "./SignUp";

describe("SignUp", () => {
  const ben = testUsers.ben;
  let emailField: HTMLInputElement;
  let submitButton: HTMLButtonElement;

  beforeEach(() => {
    render(<SignUp />);
    emailField = screen.getByLabelText<HTMLInputElement>("Email");
    submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
  });

  describe("new user", () => {
    describe("valid form params", () => {
      it("creates a new user", async () => {
        const { email } = ben;

        expect(window.localStorage.getItem("email")).toBeNull();

        fireEvent.change(emailField, { target: { value: email } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["sign-up"].put).toHaveBeenCalledWith({ email });
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/ott");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        const user = (await findUserByEmail(email))!;
        expect(user.userId).toBeString();

        const ott = (await findOttByUserId(user.userId))!;
        expect(ott.ott).toBeString();
      });
    });

    describe("invalid email", () => {
      it("does not send the form", async () => {
        const email = "invalid";

        fireEvent.change(emailField, { target: { value: email } });
        fireEvent.click(submitButton);

        expect(await screen.findByText("Invalid email")).toBeDefined();
      });
    });
  });
});
