import { useContext } from "react";
import { Link, useLocation } from "wouter";
import Button from "./components/Button";
import { useClient } from "./hooks/client";
import { UserContext } from "./providers/UserProvider";

const Header: React.FC = () => {
  const { user } = useContext(UserContext);
  const [_, navigate] = useLocation();

  const handleSignOut = async () => {
    const { signOut } = useClient();
    await signOut();
    navigate("/sign-in");
  };

  return (
    <header className="flex flex-row items-center justify-between gap-4">
      <p>Current User Id: {user}</p>
      <Button onClick={handleSignOut}>Sign Out</Button>
      <Link to="/uploader">Upload Files</Link>
    </header>
  );
};

export default Header;
