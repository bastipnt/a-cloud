import { createCryptoWorkerPool, CryptoWorkerPool } from "@acloud/client";
import { createContext, ReactNode, RefObject, useEffect, useRef, useState } from "react";

export class WorkerPoolMissingError extends Error {
  override name: string = "WorkerPoolMissingError";
}

type WorkerContextType = {
  cryptoWorkerPool?: RefObject<CryptoWorkerPool | null>;
  ready: boolean;
  readyPromise?: Promise<void>;
};

export const WorkerContext = createContext<WorkerContextType>({});

type WorkerProviderProps = {
  children: ReactNode;
};

const WorkerProvider: React.FC<WorkerProviderProps> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const cryptoWorkerPool = useRef<CryptoWorkerPool>(null);

  let readyResolve: () => void;
  const readyPromise = new Promise<void>((res) => (readyResolve = res));

  useEffect(() => {
    createCryptoWorkerPool().then((cwp) => {
      cryptoWorkerPool.current = cwp;
      setReady(true);
      readyResolve();
    });

    return () => {
      cryptoWorkerPool.current?.terminateAll();
    };
  }, []);

  return (
    <WorkerContext.Provider
      value={{
        cryptoWorkerPool,
        ready,
        readyPromise,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export default WorkerProvider;
