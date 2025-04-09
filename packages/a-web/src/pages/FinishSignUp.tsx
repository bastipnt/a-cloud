import { useLocation } from "wouter";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";
import FinishSignUpForm, {
  FinishSignUpFormValues,
} from "../forms/FinishSignUpForm";
import { useEffect, useState } from "react";

const FinishSignUp: React.FC = () => {
  const { getEmail } = useStorage();
  const { finishSignUp } = useClient();
  const [_, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>("");

  const handleSubmit = async (values: FinishSignUpFormValues) => {
    const { password } = values;

    const success = await finishSignUp(password);
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
      <FinishSignUpForm
        handleSubmit={handleSubmit}
        existingEmail={existingEmail}
      />
    </>
  );
};

export default FinishSignUp;
