import { expose, wrap, type Remote } from "comlink";

export class ComlinkWorker<T extends new () => InstanceType<T>> {
  private name: string;
  public id: string;
  public remote: Promise<Remote<InstanceType<T>>>;
  public worker: Worker;
  public busy = false;

  constructor(name: string, worker: Worker, id: string) {
    this.name = name;
    this.worker = worker;
    this.id = id;

    const comlink = wrap<T>(worker);
    this.remote = new comlink() as Promise<Remote<InstanceType<T>>>;

    worker.onerror = (event) => {
      console.error("Error in worker:", { name, event });
    };

    console.log("Created new worker:", name);

    expose(worker);
  }

  public terminate() {
    this.worker.terminate();
    console.log("Terminated worker:", this.name);
  }
}
