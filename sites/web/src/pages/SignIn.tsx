import { SignInError } from "@acloud/client";
import { NotLoggedInError } from "@acloud/client/src/user";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import SignInForm, { SignInFormValues } from "../forms/SignInForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

const SignIn: React.FC = () => {
  const { getEmail } = useStorage();
  const { signIn, proofSignIn, getUser } = useClient();
  const [_, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>("");
  const [formError, setFormError] = useState<string>();

  const handleSubmit = async (values: SignInFormValues) => {
    const { email, password } = values;

    try {
      const { alreadySignedIn, proofSrpAttributes } = await signIn(email);

      if (alreadySignedIn) return navigate("/");
      if (!proofSrpAttributes) throw new Error("No srp attributes returned");

      await proofSignIn(password, proofSrpAttributes);
    } catch (error) {
      if (error instanceof SignInError) {
        setFormError("Invalid email, password combination!");
        return;
      }

      throw error;
    }

    navigate("/");
  };

  const checkAlreadySignedIn = async () => {
    try {
      const userId = await getUser();
      if (userId) navigate("/");
    } catch (error) {
      if (error instanceof NotLoggedInError) return;
      throw error;
    }
  };

  useEffect(() => {
    checkAlreadySignedIn();

    const email = getEmail();
    if (!email) return;

    setExistingEmail(email);
  });

  return (
    <>
      <h1>Sign In</h1>
      {formError && <p>{formError}</p>}
      <SignInForm handleSubmit={handleSubmit} existingEmail={existingEmail} />
      <p>
        or{" "}
        <Link className="underline" to="/sign-up">
          sign up
        </Link>
      </p>
    </>
  );
};

export default SignIn;
