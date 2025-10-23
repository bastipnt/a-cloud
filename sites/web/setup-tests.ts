import { beforeAll, beforeEach } from "vitest";
import "vitest-browser-react";

console.log("lol");

// Mock pdfjs worker URL and library at module load so it's effective before imports
// vi.mock("pdfjs-dist/build/pdf.worker.mjs?url", () => ({ default: "__mock_worker__" }));
// vi.mock("pdfjs-dist", () => {
//   const GlobalWorkerOptions = { workerSrc: "__mock_worker__" } as any;
//   return {
//     GlobalWorkerOptions,
//     getDocument: () => ({ promise: Promise.reject(new Error("pdfjs mocked")) }),
//   };
// });

// vi.mock("wouter", () => {
//   const navigate = vi.fn((_location: string) => {
//     console.log("call with", _location);
//   });

//   return {
//     useLocation: vi.fn(() => {
//       console.log("calllll");

//       return [undefined, navigate];
//     }),
//   };
// });

// vi.mock("comlink", () => {
//   return {
//     expose: vi.fn(() => {}),
//     wrap: vi.fn(() => {
//       return class Wrapper {
//         constructor() {
//           return Promise.resolve({
//             test: () => "test",
//             delayedTest: (delay: number, id: string) => {
//               return new Promise<string>((resolve) => {
//                 setTimeout(() => resolve(`test-${id}`), delay);
//               });
//             },
//             getWorkerId: () => Promise.resolve("worker-id"),
//           });
//         }
//       };
//     }),
//   };
// });

beforeAll(async () => {
  console.log("before all!!!!!!!!!!!!!!!!");

  // Provide a minimal DOMMatrix for libraries that expect it
  // if (!(globalThis as any).DOMMatrix) {
  //   (globalThis as any).DOMMatrix = class DOMMatrixMock {} as any;
  // }

  // registerCookieJar();
  // await migrateDB();
  // await resetDB();
});

beforeEach(async () => {
  // await cookieJar.removeAllCookies();
  // cleanup();
  // (useLocation()[1] as Mock<ReturnType<typeof useLocation>[1]>).mockClear();
});
