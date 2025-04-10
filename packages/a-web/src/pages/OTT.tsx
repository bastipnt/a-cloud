import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import OTTForm, { OTTFormValues } from "../forms/OTTForm";
import { useClient } from "../hooks/client";
import { useStorage } from "../hooks/storage";

const OTT: React.FC = () => {
  const { storeEmail, getEmail } = useStorage();
  const { verifyOTT } = useClient();
  const [location, navigate] = useLocation();
  const [existingEmail, setExistingEmail] = useState<string>();
  const [existingOTT, setExistingOTT] = useState<string>();

  const handleSubmit = async (values: OTTFormValues) => {
    const { email, ott } = values;

    const success = await verifyOTT(email, ott);
    storeEmail(email);

    if (!success) {
      return;
    }

    navigate("/finish-sign-up");
  };

  useEffect(() => {
    const email = getEmail();
    console.log(email);

    if (email) setExistingEmail(email);
    if (location) setExistingOTT(""); // TODO:
  }, []);

  return (
    <>
      <h1>OTT</h1>
      <OTTForm
        handleSubmit={handleSubmit}
        existingEmail={existingEmail}
        existingOTT={existingOTT}
      />
    </>
  );
};

export default OTT;
