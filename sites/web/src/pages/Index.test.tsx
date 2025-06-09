import { config } from "@acloud/config";
import { deriveKeyBase64 } from "@acloud/crypto";
import { createSignedUpTestUser, getKeyParamsByUserId, resetDB } from "@acloud/db";
import { KeyParams } from "@acloud/server";
import { testUsers } from "@acloud/testing";
import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { useLocation } from "wouter";
import { useStorage } from "../hooks/storage";
import Index from "./Index";

describe("Index", () => {
  describe("not signed in", () => {
    beforeEach(() => {
      render(<Index />);
    });

    it("redirects to /sign-in", async () => {
      expect(useLocation()[1]).toHaveBeenCalledWith("/sign-in");
    });
  });

  describe("signed in", () => {
    const ben = testUsers.ben;
    let keyParams: KeyParams;
    let keyEncryptionKey: Base64URLString;

    beforeAll(async () => {
      await createSignedUpTestUser("ben");
      keyParams = (await getKeyParamsByUserId(ben.userId))!;
      keyEncryptionKey = await deriveKeyBase64(
        ben.password,
        keyParams.keyEncryptionKeySalt,
        keyParams.opsLimit,
        keyParams.memLimit,
      );
    });

    afterAll(async () => {
      await resetDB();
    });

    beforeEach(async () => {
      await cookieJar.setCookie(`auth=${ben.jwt}`, config.endpoint.api);

      render(<Index />);

      useStorage().storeKeyParams(keyParams);
      useStorage().storeKeyEncryptionKey(keyEncryptionKey);
    });

    it("shows the userId and available files and folders", async () => {
      expect(await screen.findByText(new RegExp(ben.userId))).toBeDefined();
    });
  });
});
