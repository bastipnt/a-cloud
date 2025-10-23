import { WorkerPool } from "@acloud/common";
import { transfer } from "comlink";
import type { CryptoWorker } from "../workers/crypto-worker";

class CryptoWorkerPool extends WorkerPool<typeof CryptoWorker> {
  constructor() {
    const name = "CryptoWorker";
    const url = new URL("../workers/crypto-worker.ts", import.meta.url);
    const size = 4; // TODO: change
    super(name, url, size);
  }

  genNewUserKeys(userPassword: string) {
    return this.enqueue(async (worker) => (await worker.remote).genNewUserKeys(userPassword));
  }

  encryptFile(file: File, buffer: ArrayBuffer, fileKey: Base64URLString) {
    return this.enqueue(async (worker) =>
      (await worker.remote).encryptFile(transfer(file, [buffer]), fileKey),
    );
  }

  encryptObject(value: object, key: Base64URLString) {
    return this.enqueue(async (worker) => (await worker.remote).encryptObject(value, key));
  }

  encryptBoxBase64(data: string, key: Base64URLString) {
    return this.enqueue(async (worker) => (await worker.remote).encryptBoxBase64(data, key));
  }

  encryptBlobToFile(blob: Blob, buffer: ArrayBuffer, key: Base64URLString) {
    return this.enqueue(async (worker) =>
      (await worker.remote).encryptBlobToFile(transfer(blob, [buffer]), key),
    );
  }
}

export const createCryptoWorkerPool = async () => {
  const cryptoWorkerPool = new CryptoWorkerPool();
  await cryptoWorkerPool.init();

  return cryptoWorkerPool;
};

export { type CryptoWorkerPool };
