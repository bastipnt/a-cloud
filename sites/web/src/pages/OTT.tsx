import { getUser, NotLoggedInError } from "@acloud/client/src/user";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import OTTForm, { OTTFormValues } from "../forms/OTTForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

const OTT: React.FC = () => {
  const { storeEmail, getEmail } = useStorage();
  const { verifyOTT } = useClient();
  const [_, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>();
  const [existingOTT, setExistingOTT] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (values: OTTFormValues) => {
    const { email, ott } = values;

    const success = await verifyOTT(email, ott);
    storeEmail(email);

    if (!success) {
      setFormError("Invalid Token!");
      return;
    }

    navigate("/finish-sign-up");
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

    const email = searchParams.get("email") || getEmail();
    const ott = searchParams.get("ott");

    if (email) setExistingEmail(email);
    if (ott) setExistingOTT(ott);

    if (ott && email) handleSubmit({ email, ott });
  }, [searchParams]);

  return (
    <>
      <h1>OTT</h1>
      {formError && <p>{formError}</p>}
      <OTTForm
        handleSubmit={handleSubmit}
        existingEmail={existingEmail}
        existingOTT={existingOTT}
      />
    </>
  );
};

export default OTT;
