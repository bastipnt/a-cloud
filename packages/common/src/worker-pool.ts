import { ComlinkWorker } from "./comlink-worker";

abstract class WorkerPool<T extends new () => InstanceType<T>> {
  protected workers: ComlinkWorker<T>[] = [];
  protected queue: {
    action: (worker: ComlinkWorker<T>) => Promise<any>;
    resolve: (res: any) => void;
  }[] = [];

  constructor(name: string, url: URL, size = Math.max(1, navigator.hardwareConcurrency - 1)) {
    console.log("workers:", size);

    for (let i = 0; i < size; i++) {
      const w = new Worker(url, { type: "module" });
      this.workers.push(new ComlinkWorker<T>(name, w, i.toString()));
    }
  }

  async init() {
    await Promise.all(this.workers.map(({ remote }) => remote));
  }

  private async executeWithWorker<K>(
    action: (worker: ComlinkWorker<T>) => Promise<K>,
    worker: ComlinkWorker<T>,
  ): Promise<K> {
    worker.busy = true;
    console.log("Execute with", worker.id);
    const res = await action(worker);
    worker.busy = false;
    this.processQueue(worker);

    return res;
  }

  private processQueue(worker: ComlinkWorker<T>) {
    const queueItem = this.queue.shift();
    if (!queueItem) return;
    this.executeWithWorker(queueItem.action, worker).then(queueItem.resolve);
  }

  private getIdleWorker() {
    return this.workers.find((w) => !w.busy);
  }

  protected enqueue<K>(action: (worker: ComlinkWorker<T>) => Promise<K>): Promise<K> {
    return new Promise((resolve) => {
      const idleWorker = this.getIdleWorker();
      if (idleWorker) this.executeWithWorker(action, idleWorker).then(resolve);
      else this.queue.push({ action, resolve });
    });
  }

  terminateAll() {
    this.workers.forEach((w) => w.worker.terminate());
  }
}

export default WorkerPool;
