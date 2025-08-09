import { useContext, useEffect } from "react";
import { ScrollBehaviorContext } from "../providers/ScrollBehaviorProvider";

export const useModalScroll = () => {
  const { setPageScroll } = useContext(ScrollBehaviorContext);

  useEffect(() => {
    setPageScroll(false);

    return () => setPageScroll(true);
  }, []);
};
