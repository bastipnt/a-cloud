import { NotLoggedInError } from "@acloud/client/src/user";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useClient } from "../hooks/client";

const Index: React.FC = () => {
  const [userId, setUserId] = useState<string>("No user");
  const { getUser } = useClient();
  const [_, navigate] = useLocation();

  const checkSignedIn = async () => {
    try {
      const userId = await getUser();
      if (userId) setUserId(userId);
    } catch (error) {
      if (error instanceof NotLoggedInError) {
        navigate("/sign-in");
        return;
      }

      throw error;
    }
  };

  useEffect(() => {
    checkSignedIn();
  });

  return (
    <>
      <h1>Index</h1>
      <p>User id: {userId}</p>
    </>
  );
};

export default Index;
