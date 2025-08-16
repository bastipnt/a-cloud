import { useEffect } from "react";

export const useScroll = (onScroll: (event: WheelEvent) => void) => {
  useEffect(() => {
    document.addEventListener("wheel", onScroll);

    return () => document.removeEventListener("wheel", onScroll);
  }, []);
};
