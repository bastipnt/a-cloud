import { NotVerifiedError, UserAlreadyVerifiedError } from "@acloud/client/src/user";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import FinishSignUpForm, { FinishSignUpFormValues } from "../forms/FinishSignUpForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

const FinishSignUp: React.FC = () => {
  const { getEmail } = useStorage();
  const { finishSignUp } = useClient();
  const [_, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>("");

  const handleSubmit = async (values: FinishSignUpFormValues) => {
    const { password } = values;
    let success: boolean = false;

    try {
      success = await finishSignUp(password);
    } catch (error) {
      if (error instanceof NotVerifiedError) {
        navigate("/ott");
        return;
      } else if (error instanceof UserAlreadyVerifiedError) {
        navigate("/sign-in");
        return;
      }

      throw error;
    }

    if (!success) return;

    navigate("/sign-in");
  };

  useEffect(() => {
    const email = getEmail();
    if (!email) return console.log("Error: Email could not be retrieved");

    setExistingEmail(email);
  }, []);

  return (
    <>
      <h1>FinishSignUp</h1>
      <FinishSignUpForm handleSubmit={handleSubmit} existingEmail={existingEmail} />
    </>
  );
};

export default FinishSignUp;
