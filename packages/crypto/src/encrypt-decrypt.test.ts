import { decryptUnit8Array, encryptBlobToFile, genFileKeyBase64 } from "@acloud/crypto";
import { describe, expect, it } from "bun:test";
import { encryptUnit8ArrayBase64 } from "./encrypt";
import { fromBase64 } from "./util/conversion-helper";
import { blobToUnit8Array } from "./util/file-helper";

describe("encryption decryption flow", () => {
  it("encrypts a Unit8Array and then decrypts it again", async () => {
    const testArray = [27, 33];
    const testUnit8Array = new Uint8Array(testArray);
    const encryptionKey = await genFileKeyBase64();

    const [encryptedArray, decryptionHeader] = await encryptUnit8ArrayBase64(
      testUnit8Array,
      encryptionKey,
    );

    const decryptedUnit8Array = await decryptUnit8Array(
      await fromBase64(encryptedArray),
      encryptionKey,
      decryptionHeader,
    );

    expect(Array.from(decryptedUnit8Array)).toEqual(testArray);
  });

  it("encrypts a Blob and then decrypts it again", async () => {
    const testUnit8Array = new Uint8Array([23, 34]);
    const testBlob = new Blob([testUnit8Array], { type: "image" });
    const encryptionKey = await genFileKeyBase64();

    const [encryptedFile, decryptionHeader] = await encryptBlobToFile(testBlob, encryptionKey);
    const encryptedUnit8Array = await blobToUnit8Array(encryptedFile);

    const decryptedUnit8Array = await decryptUnit8Array(
      encryptedUnit8Array,
      encryptionKey,
      decryptionHeader,
    );

    expect(decryptedUnit8Array).toEqual(await blobToUnit8Array(testBlob));
  });
});
