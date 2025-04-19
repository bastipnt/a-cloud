import { getUser } from "@acloud/client";
import { NotLoggedInError } from "@acloud/client/src/user";
import { useEffect } from "react";
import { useLocation } from "wouter";
import SignUpForm, { SignUpFormValues } from "../forms/SignUpForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

const SignUp: React.FC = () => {
  const { storeEmail } = useStorage();
  const { signUp } = useClient();
  const [_, navigate] = useLocation();

  const handleSubmit = async (values: SignUpFormValues) => {
    const { email } = values;

    await signUp(email);
    storeEmail(email);

    navigate("/ott");
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
  });

  return (
    <>
      <h1>SignUp</h1>
      <SignUpForm handleSubmit={handleSubmit} />
    </>
  );
};

export default SignUp;
