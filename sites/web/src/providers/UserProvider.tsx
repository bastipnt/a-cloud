import { NotLoggedInError } from "@acloud/client/src/user";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useClient } from "../hooks/client";

type UserContextType = {
  user: string | null;
};

export const UserContext = createContext<UserContextType>({
  user: null,
});

type UserProviderProps = {
  children: ReactNode;
};

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const { getUser } = useClient();
  const [_, navigate] = useLocation();

  const checkSignedIn = async () => {
    try {
      const currentUserId = await getUser();

      if (currentUserId) setUser(currentUserId);
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
  }, []);

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export default UserProvider;
