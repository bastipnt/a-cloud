import { ComlinkWorker } from "@acloud/common";
import type { CryptoWorker } from "../crypto-worker";

export const createCryptoWorker = () =>
  new ComlinkWorker<typeof CryptoWorker>(
    "cryptoWorker",
    new Worker(new URL("../crypto-worker.ts", import.meta.url), {
      type: "module",
    }),
  );
