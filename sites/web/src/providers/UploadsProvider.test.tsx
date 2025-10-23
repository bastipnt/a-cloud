import { render, waitFor } from "@testing-library/react";
import React, { PropsWithChildren, RefObject, useContext } from "react";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "vitest";
import { FilesContext } from "./FilesProvider";
import { WorkerContext } from "./WorkerProvider";

type FakeCryptoPool = {};

async function withProviders(
  ui: React.ReactElement,
  options: {
    addFiles?: ReturnType<typeof mock>;
    uploadFile?: ReturnType<typeof mock>;
  } = {},
) {
  const addFiles = options.addFiles ?? mock(() => {});
  const uploadFile = options.uploadFile ?? mock(async () => ({}));

  mock.module("../hooks/client", () => {
    return {
      useClient: () => ({ uploadFile }),
    };
  });

  const { default: UploadsProvider, UploadsContext } = await import("./UploadsProvider");
  (globalThis as any).__UploadsContext__ = UploadsContext;

  // inlined directly in Wrapper

  const cryptoRef: RefObject<FakeCryptoPool | null> = {
    current: {} as FakeCryptoPool,
  };

  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <WorkerContext.Provider value={{ cryptoWorkerPool: cryptoRef as any }}>
      <FilesContext.Provider
        value={{
          files: [],
          setFiles: () => {},
          addFiles,
          removeFiles: () => {},
          thumbnails: [],
          setThumbnails: () => {},
          addThumbnail: () => {},
          getThumbnail: () => undefined,
          nextFileId: (id: string) => id,
          prevFileId: (id: string) => id,
        }}
      >
        {children}
      </FilesContext.Provider>
    </WorkerContext.Provider>
  );

  const result = render(<UploadsProvider>{ui}</UploadsProvider>, { wrapper: Wrapper });
  return { ...result, addFiles, uploadFile, UploadsContext };
}

const TestConsumer: React.FC<{ onQueue?: (len: number) => void } & PropsWithChildren> = ({
  onQueue,
  children,
}) => {
  const ctx = (globalThis as any).__UploadsContext__ as React.Context<any>;
  const { enqueue, uploadQueue } = useContext(ctx);
  // Expose helpers on window for ad-hoc debugging if needed
  (globalThis as any).__enqueue__ = enqueue;
  onQueue?.(uploadQueue.length);
  return <>{children}</>;
};

function createFakeFile(name = "file.txt"): File {
  return new File(["content"], name, { type: "text/plain" });
}

describe("UploadsProvider", () => {
  beforeEach(() => {});
  afterEach(() => {
    mock.restore();
  });
  afterAll(() => {});

  it("starts upload on enqueue and calls addFiles on success", async () => {
    const { addFiles, uploadFile } = await withProviders(<TestConsumer />);
    // Use the same provider instance: enqueue has been exposed globally by the first render

    // Enqueue a file
    const file = createFakeFile();
    (globalThis as any).__enqueue__([file]);

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledTimes(1);
      expect(addFiles).toHaveBeenCalledTimes(1);
    });
  });

  it("does not start duplicate uploads for a single enqueued file", async () => {
    const uploadFile = mock(async () => ({}));
    await withProviders(<TestConsumer />, { uploadFile });

    const file = createFakeFile("single.txt");
    (globalThis as any).__enqueue__([file]);

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledTimes(1);
    });
  });

  it("retries once on failure then succeeds", async () => {
    const uploadFile = mock(async () => {
      if ((uploadFile as any).__calls__ === undefined) (uploadFile as any).__calls__ = 0;
      (uploadFile as any).__calls__++;
      if ((uploadFile as any).__calls__ === 1) {
        throw new Error("network");
      }
      return { fileId: "abc" };
    });

    const { addFiles } = await withProviders(<TestConsumer />, {
      uploadFile,
    });

    const file = createFakeFile("retry.txt");
    (globalThis as any).__enqueue__([file]);

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledTimes(2);
      expect(addFiles).toHaveBeenCalledTimes(1);
    });
  });

  it("resets queue after all items finished", async () => {
    await withProviders(<TestConsumer onQueue={(len) => ((globalThis as any).__qlen__ = len)} />);

    const file = createFakeFile("reset.txt");
    (globalThis as any).__enqueue__([file]);

    await waitFor(() => {
      expect((globalThis as any).__qlen__).toBe(0);
    });
  });
});
