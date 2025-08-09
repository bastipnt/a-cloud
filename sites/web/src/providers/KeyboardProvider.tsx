import { createContext, ReactNode, useCallback, useEffect, useState } from "react";

type KeyboardContextType = {
  keyPressed: (key: string | string[]) => boolean;
  keys: Map<string, boolean>;
  setCapture: (capture: boolean) => void;
};

export const KeyboardContext = createContext<KeyboardContextType>({
  keyPressed: () => false,
  keys: new Map<string, boolean>(),
  setCapture: () => {},
});

type KeyboardProviderProps = {
  children: ReactNode;
};

const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const [keys, setKeys] = useState<Map<string, boolean>>(new Map<string, boolean>());
  const [capture, setCapture] = useState(true);

  useEffect(() => {
    const innerKeys = new Map<string, boolean>();

    function handleKeyDown(e: KeyboardEvent) {
      if (!e.key) return;

      if (e.type === "keydown") {
        if (e.key === "Meta") innerKeys.clear();

        innerKeys.set(e.key, true);
      } else innerKeys.delete(e.key);

      setKeys(new Map(innerKeys));
    }

    const handleKeyUp = handleKeyDown;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      setKeys(new Map<string, boolean>());
    };
  }, []);

  const keyPressed = useCallback(
    (key: string | string[]): boolean => {
      if (typeof key === "string") {
        if (!capture) return false;
        return !!keys.get(key);
      }

      return key.map((k) => keys.get(k)).every((value) => value);
    },
    [keys, capture],
  );

  // useEffect(() => {
  //   console.log(keys);
  // }, [keys]);

  return (
    <KeyboardContext.Provider value={{ keyPressed, setCapture, keys }}>
      {children}
    </KeyboardContext.Provider>
  );
};

export default KeyboardProvider;
