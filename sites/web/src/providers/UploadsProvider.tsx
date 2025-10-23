import { FileData, FileMetadata } from "@acloud/media";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { useClient } from "../hooks/client";
import { FilesContext } from "./FilesProvider";
import { WorkerContext } from "./WorkerProvider";

const MAX_CONCURRENCY = 4 as const;

type EncryptionData = {};

type UploadState = "queued" | "running" | "completed" | "failed" | "cancelled";

type QueueItem = {
  id: string;
  state: UploadState;
  fileName: string;
  attempts: number;
  file: File;
  uploadProgress: number; // 0..100
  error?: string;
  thumbnail?: Blob;
  metadata?: FileMetadata;
  encryptionData?: EncryptionData;
};

type UploadsContextType = {
  uploadQueue: QueueItem[];
  enqueue: (files: File[]) => void;
};

export const UploadsContext = createContext<UploadsContextType>({
  uploadQueue: [],
  enqueue: () => {},
});

type Action =
  | { type: "enqueue"; files: File[] }
  | { type: "start"; id: string }
  | { type: "thumbnailSuccess"; id: string; thumbnail: Blob | undefined }
  | { type: "addMetadata"; id: string; metadata: FileMetadata }
  | { type: "encryptSuccess"; id: string; encryptionData: EncryptionData }
  | { type: "progress"; id: string; progress: number }
  | { type: "success"; id: string }
  | { type: "fail"; id: string; error?: string }
  | { type: "cancel"; id: string }
  | { type: "reset" };

type UploadsProviderProps = {
  children: ReactNode;
};

const UploadsProvider: React.FC<UploadsProviderProps> = ({ children }) => {
  // const [uploadQueue, setQueue] = useState<QueueItem[]>([]);
  const { addFiles } = useContext(FilesContext);
  const { cryptoWorkerPool } = useContext(WorkerContext);
  const { uploadFile } = useClient();

  const uploadReducer = (state: QueueItem[], action: Action): QueueItem[] => {
    switch (action.type) {
      case "enqueue":
        const newItems = action.files.map<QueueItem>((file) => ({
          id: crypto.randomUUID(),
          fileName: file.name,
          state: "queued",
          file,
          uploadProgress: 0,
          attempts: 0,
        }));
        return [...state, ...newItems];
      case "start":
        return state.map((i) =>
          i.id === action.id
            ? { ...i, state: "running", uploadProgress: 0, attempts: i.attempts + 1 }
            : i,
        );
      case "thumbnailSuccess":
        return state.map((i) =>
          i.id === action.id
            ? { ...i, state: "running", uploadProgress: 10, thumbnail: action.thumbnail }
            : i,
        );
      case "addMetadata":
        return state.map((i) =>
          i.id === action.id
            ? { ...i, state: "running", uploadProgress: 20, metadata: action.metadata }
            : i,
        );
      case "encryptSuccess":
        return state.map((i) =>
          i.id === action.id
            ? { ...i, state: "running", uploadProgress: 70, encryptionData: action.encryptionData }
            : i,
        );
      case "progress":
        return state.map((i) =>
          i.id === action.id ? { ...i, uploadProgress: action.progress } : i,
        );
      case "success":
        return state.map((i) =>
          i.id === action.id ? { ...i, state: "completed", uploadProgress: 100 } : i,
        );
      case "fail":
        return state.map((i) => {
          if (i.id !== action.id) return i;
          // Retry once: attempts starts at 0 and increments on start; allow re-queue while attempts < 2
          if (i.attempts < 2) {
            return { ...i, state: "queued", error: undefined };
          }
          return { ...i, state: "failed", error: action.error };
        });
      case "cancel":
        return state.map((i) => (i.id === action.id ? { ...i, state: "cancelled" } : i));
      case "reset":
        return [];
      default:
        return state;
    }
  };

  const [uploadQueue, dispatch] = useReducer(uploadReducer, []);
  const stoppedRef = useRef(false);
  const runningCountRef = useRef(0);
  const concurrencyRef = useRef(MAX_CONCURRENCY);

  const enqueue = (files: File[]) => {
    dispatch({ type: "enqueue", files });
  };

  const success = useCallback(
    (itemId: string, fileData: FileData | null) => {
      if (fileData) {
        dispatch({ type: "success", id: itemId });
        addFiles([fileData]);
      } else {
        fail(itemId, "Failed to upload file");
      }
    },
    [addFiles],
  );

  const start = useCallback(
    async (item: QueueItem) => {
      if (!cryptoWorkerPool?.current) return;
      const fresh = uploadQueue.find((i) => i.id === item.id);
      if (!fresh || fresh.state !== "queued") return;

      runningCountRef.current++;
      dispatch({ type: "start", id: item.id });
      uploadFile(item.file, cryptoWorkerPool.current)
        .then((fileData) => success(item.id, fileData))
        .catch((err) => {
          fail(item.id, err.message);
        })
        .finally(() => {
          runningCountRef.current = Math.max(0, runningCountRef.current - 1);
        });
    },
    [cryptoWorkerPool, uploadQueue, uploadFile, success],
  );

  const fail = (itemId: string, error: string) => {
    dispatch({ type: "fail", id: itemId, error });
  };

  const processQueue = useCallback(async () => {
    if (stoppedRef.current) return;

    const availableSlots = Math.max(0, concurrencyRef.current - runningCountRef.current);
    if (availableSlots <= 0) return;

    const queuedItems = uploadQueue.filter((i) => i.state === "queued").slice(0, availableSlots);
    if (queuedItems.length === 0) return;

    queuedItems.forEach((item) =>
      start(item).catch((err) => {
        console.error("startItem error", err);
      }),
    );
  }, [uploadQueue, start]);

  useEffect(() => {
    console.log("Process");

    processQueue();
  }, [processQueue, uploadQueue]);

  useEffect(() => {
    // If nothing is queued or running, and all items are either completed, failed, or cancelled, reset the queue
    const hasActive = uploadQueue.some((i) => i.state === "queued" || i.state === "running");
    if (!hasActive && uploadQueue.length > 0) {
      const allFinished = uploadQueue.every(
        (i) => i.state === "completed" || i.state === "failed" || i.state === "cancelled",
      );
      if (allFinished) {
        dispatch({ type: "reset" });
      }
    }
  }, [uploadQueue]);

  return (
    <UploadsContext.Provider
      value={{
        uploadQueue,
        enqueue,
      }}
    >
      {children}
    </UploadsContext.Provider>
  );
};

export default UploadsProvider;
