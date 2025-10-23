import {
  encryptBlobToFile,
  encryptBoxBase64,
  encryptFile,
  encryptObject,
  genNewUserKeys,
} from "@acloud/crypto";
import { expose } from "comlink";

export class CryptoWorker {
  genNewUserKeys = genNewUserKeys;
  encryptFile = encryptFile;
  encryptObject = encryptObject;
  encryptBoxBase64 = encryptBoxBase64;
  encryptBlobToFile = encryptBlobToFile;
}

expose(CryptoWorker);
