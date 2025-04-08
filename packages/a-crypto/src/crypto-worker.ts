import { expose } from "comlink";

import { genNewUserKeys } from "..";

export class CryptoWorker {
  genNewUserKeys = genNewUserKeys;
}

expose(CryptoWorker);
