import { expose } from "comlink";
import { encryptBlobToFile, encryptBoxBase64, encryptFile, genNewUserKeys } from "..";

export class CryptoWorker {
  genNewUserKeys = genNewUserKeys;
  encryptFile = encryptFile;
  encryptBoxBase64 = encryptBoxBase64;
  encryptBlobToFile = encryptBlobToFile;
}

expose(CryptoWorker);
