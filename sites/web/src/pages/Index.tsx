import { NotLoggedInError } from "@acloud/client/src/user";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import Button from "../components/Button";
import FileTable from "../components/FileTable";
import FileUpload from "../components/FileUpload";
import { useClient } from "../hooks/client";

const Index: React.FC = () => {
  const [userId, setUserId] = useState<string>("No user");
  const { getUser, signOut } = useClient();
  const [location, navigate] = useLocation();

  const [matchImage] = useRoute("/image/:id");
  const [matchRoot] = useRoute("/");

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
  }, []);

  useEffect(() => {
    if (!matchRoot && !matchImage) navigate("/");
  }, [matchImage, matchRoot]);

  return (
    <section className="flex flex-col gap-8 p-8">
      <div>
        <h1>User id: {userId}</h1>
        <p>{location}</p>
      </div>

      <Button onClick={handleSignOut}>Sign Out</Button>

      <FileTable />

      <FileUpload />
    </section>
  );
};

export default Index;
