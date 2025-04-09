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
  return (
    <>
      <h1>SignUp</h1>
      <SignUpForm handleSubmit={handleSubmit} />
    </>
  );
};

export default SignUp;
