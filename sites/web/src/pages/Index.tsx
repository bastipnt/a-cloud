import { useEffect, useState } from "react";
import { useClient } from "../hooks/client";

const Index: React.FC = () => {
  const [userId, setUserId] = useState<string>("No user");
  const { getUser } = useClient();

  useEffect(() => {
    getUser().then((uId) => setUserId(uId));
  });

  return (
    <>
      <h1>Index</h1>
      <p>User id: {userId}</p>
    </>
  );
};

export default Index;
