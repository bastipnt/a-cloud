import { FormEvent, useState } from "react";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

type Validation = {
  valid: boolean;
  errors: string[];
};

const validatePassword = (password: string | null, passwordRepeat: string | null): Validation => {
  if (!password) return { valid: false, errors: ["Password not provided"] };
  if (password !== passwordRepeat)
    return {
      valid: false,
      errors: ["Password and Password repeat do not match"],
    };
  return { valid: true, errors: [] };
};

const RegisterNewUser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { storeUserKeys } = useStorage();
  const { createNewUser } = useClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    console.log(formData);

    const email = formData.get("email") as string | null;
    if (!email) {
      setLoading(false);
      return;
    }

    const password = formData.get("password") as string | null;
    const passwordRepeat = formData.get("password-repeat") as string | null;

    const passwordValidation = validatePassword(password, passwordRepeat);

    if (!password || !passwordValidation.valid) {
      setLoading(false);
      return;
    }

    const [userId, userKeys] = await createNewUser(email, password);
    storeUserKeys(userId, userKeys);
    setLoading(false);

    console.log(userId);
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      <form action="submit" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />

        <label htmlFor="password-repeat">Password</label>
        <input type="password" name="password-repeat" id="password-repeat" />

        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default RegisterNewUser;
