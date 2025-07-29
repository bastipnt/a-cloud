import { NotLoggedInError } from "@acloud/client/src/user";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import FileTable from "../components/FileTable";
import FileUpload from "../components/FileUpload";
import { useClient } from "../hooks/client";

const Index: React.FC = () => {
  const [userId, setUserId] = useState<string>("No user");
  const { getUser, signOut } = useClient();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  useEffect(() => {
    checkSignedIn();
    window.localStorage.setItem("test", "hello");
  }, []);

  return (
    <>
      <h1>Index</h1>
      <p>User id: {userId}</p>
      <button onClick={handleSignOut}>Sign Out</button>
      <FileTable />
      <FileUpload />
    </>
  );
};

export default Index;
