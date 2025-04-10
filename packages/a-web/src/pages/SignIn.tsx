import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import SignInForm, { SignInFormValues } from "../forms/SignInForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

const SignIn: React.FC = () => {
  const { getEmail } = useStorage();
  const { signIn, proofSignIn } = useClient();
  const [_, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>("");

  const handleSubmit = async (values: SignInFormValues) => {
    const { email, password } = values;

    const srpAttributes = await signIn(email);

    await proofSignIn(password, srpAttributes);

    navigate("/");
  };

  useEffect(() => {
    const email = getEmail();
    if (!email) return console.log("Error: Email could not be retrieved");

    setExistingEmail(email);
  }, []);

  return (
    <>
      <h1>FinishSignUp</h1>
      <SignInForm handleSubmit={handleSubmit} existingEmail={existingEmail} />
    </>
  );
};

export default SignIn;
