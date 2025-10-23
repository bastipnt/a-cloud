import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { scheduler } from "node:timers/promises";
import WorkerPool from "./worker-pool";

mock.module("comlink", () => {
  return {
    expose: mock(() => {}),
    wrap: mock(() => {
      return class Wrapper {
        constructor() {
          return Promise.resolve({
            test: () => "test",
            delayedTest: async (delay: number, id: string) => {
              await scheduler.wait(delay);
              return `test-${id}`;
            },
            getWorkerId: () => Promise.resolve("worker-id"),
          });
        }
      };
    }),
  };
});

export class TestWorker {
  test() {
    return "test";
  }

  async delayedTest(delay: number, id: string) {
    await scheduler.wait(delay);
    return `test-${id}`;
  }

  async getWorkerId() {
    return "worker-id";
  }
}

export class TestWorkerPool extends WorkerPool<typeof TestWorker> {
  test() {
    return this.enqueue(async (worker) => {
      return (await worker.remote).test();
    });
  }

  delayedTest(delay: number, id: string) {
    return this.enqueue(async (worker) => {
      return (await worker.remote).delayedTest(delay, id);
    });
  }

  getWorkerId() {
    return this.enqueue(async (worker) => {
      return (await worker.remote).getWorkerId();
    });
  }
}

describe("worker-pool", () => {
  const OriginalWorker = globalThis.Worker;
  let mockWorker: any;

  beforeEach(() => {
    mockWorker = mock(() => {
      return {
        postMessage: mock(() => {}),
        terminate: mock(() => {}),
        addEventListener: mock(() => {}),
        removeEventListener: mock(() => {}),
        onerror: null,
      };
    });

    (globalThis as any).Worker = mockWorker;
  });

  afterEach(() => {
    globalThis.Worker = OriginalWorker;
  });

  it("creates n workers of type T", () => {
    new TestWorkerPool("test", new URL("file:///test"), 3);
    expect(mockWorker).toHaveBeenCalledTimes(3);
  });

  it("initializes workers correctly", async () => {
    const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 2);
    await testWorkerPool.init();
    expect(testWorkerPool["workers"]).toHaveLength(2);
  });

  it("terminates all workers", () => {
    const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 2);
    const firstWorker = testWorkerPool["workers"][0];
    expect(firstWorker).toBeDefined();
    const terminateSpy = spyOn(firstWorker!.worker, "terminate");
    testWorkerPool.terminateAll();
    expect(terminateSpy).toHaveBeenCalled();
  });

  describe("queue execution", () => {
    it("executes tasks in parallel when workers are available", async () => {
      const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 3);

      // Start multiple tasks simultaneously
      const startTime = Date.now();
      const promises = [
        testWorkerPool.delayedTest(50, "task1"),
        testWorkerPool.delayedTest(50, "task2"),
        testWorkerPool.delayedTest(50, "task3"),
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Should complete in parallel (around 50ms, not 150ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(results).toEqual(["test-task1", "test-task2", "test-task3"]);
    });

    it("queues tasks when all workers are busy", async () => {
      const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 2);

      // Start 4 tasks with only 2 workers
      const startTime = Date.now();
      const promises = [
        testWorkerPool.delayedTest(100, "task1"),
        testWorkerPool.delayedTest(100, "task2"),
        testWorkerPool.delayedTest(50, "task3"),
        testWorkerPool.delayedTest(50, "task4"),
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Should take longer due to queuing (around 200ms for 4 tasks with 2 workers)
      expect(endTime - startTime).toBeGreaterThan(150);
      expect(endTime - startTime).toBeLessThan(250);
      expect(results).toEqual(["test-task1", "test-task2", "test-task3", "test-task4"]);
    });

    it("processes queue in FIFO order", async () => {
      const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 1);
      const executionOrder: string[] = [];

      // Create tasks that will be queued
      const task1 = testWorkerPool.delayedTest(50, "first").then(() => {
        executionOrder.push("first");
        return "test-first";
      });

      const task2 = testWorkerPool.delayedTest(30, "second").then(() => {
        executionOrder.push("second");
        return "test-second";
      });

      const task3 = testWorkerPool.delayedTest(20, "third").then(() => {
        executionOrder.push("third");
        return "test-third";
      });

      await Promise.all([task1, task2, task3]);

      // Should execute in the order they were enqueued
      expect(executionOrder).toEqual(["first", "second", "third"]);
    });

    it("manages worker busy state correctly", async () => {
      const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 2);

      // Check initial state - all workers should be idle
      const workers = testWorkerPool["workers"];
      expect(workers.every((w) => !w.busy)).toBe(true);

      // Start a task and check that a worker becomes busy
      const taskPromise = testWorkerPool.delayedTest(100, "busy-test");

      // Give it a moment to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      // At least one worker should be busy
      const busyWorkers = workers.filter((w) => w.busy);
      expect(busyWorkers.length).toBe(1);

      // Wait for task to complete
      await taskPromise;

      // All workers should be idle again
      expect(workers.every((w) => !w.busy)).toBe(true);
    });

    it("handles mixed fast and slow tasks correctly", async () => {
      const testWorkerPool = new TestWorkerPool("test", new URL("file:///test"), 2);

      const startTime = Date.now();

      // Mix of fast and slow tasks
      const promises = [
        testWorkerPool.delayedTest(200, "slow1"), // 200ms
        testWorkerPool.delayedTest(200, "slow2"), // 200ms
        testWorkerPool.delayedTest(50, "fast1"), // 50ms
        testWorkerPool.delayedTest(50, "fast2"), // 50ms
        testWorkerPool.delayedTest(50, "fast3"), // 50ms
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Should complete all tasks
      expect(results).toHaveLength(5);
      expect(results).toContain("test-slow1");
      expect(results).toContain("test-slow2");
      expect(results).toContain("test-fast1");
      expect(results).toContain("test-fast2");
      expect(results).toContain("test-fast3");

      // Should take at least 200ms (slowest task) but not much more
      expect(endTime - startTime).toBeGreaterThanOrEqual(200);
      expect(endTime - startTime).toBeLessThan(350); // Allow some buffer for test execution overhead
    });
  });
});
