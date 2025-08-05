import { createContext, ReactNode, useEffect, useState } from "react";

type ScrollBehaviorContextType = {
  pageScroll: boolean;
  setPageScroll: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ScrollBehaviorContext = createContext<ScrollBehaviorContextType>({
  pageScroll: true,
  setPageScroll: () => {},
});

type ScrollBehaviorProviderProps = {
  children: ReactNode;
};

const ScrollBehaviorProvider: React.FC<ScrollBehaviorProviderProps> = ({ children }) => {
  const [pageScroll, setPageScroll] = useState(true);

  useEffect(() => {
    document.body.style.overflow = pageScroll ? "auto" : "hidden";
  }, [pageScroll]);

  return (
    <ScrollBehaviorContext.Provider value={{ pageScroll, setPageScroll }}>
      {children}
    </ScrollBehaviorContext.Provider>
  );
};

export default ScrollBehaviorProvider;
