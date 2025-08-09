import { SignInError } from "@acloud/client";
import { NotLoggedInError } from "@acloud/client/src/user";
import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import SignInForm, { SignInFormValues } from "../forms/SignInForm";
import { useClient } from "../hooks/client";
import { useCrypto } from "../hooks/crypto";
import { useStorage } from "../hooks/storage";
import { KeysContext } from "../providers/KeysProvider";

const SignIn: React.FC = () => {
  const { setNewKeyEncryptionKey } = useContext(KeysContext);
  const { getEmail, storeKeyParams } = useStorage();
  const { signIn, proofSignIn, getUser } = useClient();
  const { deriveKeyBase64 } = useCrypto();
  const [_, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>("");
  const [formError, setFormError] = useState<string>();

  const handleSubmit = async (values: SignInFormValues) => {
    const { email, password } = values;
    let keyParams: Awaited<ReturnType<typeof proofSignIn>>;

    try {
      const { alreadySignedIn, proofSrpAttributes } = await signIn(email);

      if (alreadySignedIn) return navigate("/");
      if (!proofSrpAttributes) throw new Error("No srp attributes returned");

      keyParams = await proofSignIn(password, proofSrpAttributes);
    } catch (error) {
      if (error instanceof SignInError) {
        setFormError("Invalid email, password combination!");
        return;
      }

      throw error;
    }

    storeKeyParams(keyParams);

    const keyEncryptionKey = await deriveKeyBase64(
      password,
      keyParams.keyEncryptionKeySalt,
      keyParams.opsLimit,
      keyParams.memLimit,
    );

    setNewKeyEncryptionKey(keyEncryptionKey);
    // storeKeyEncryptionKey(keyEncryptionKey);

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
