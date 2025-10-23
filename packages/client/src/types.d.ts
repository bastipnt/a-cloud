export type Progress =
  | "enqueued"
  | "hashing"
  | "hashResult"
  | "creatingThumbnail"
  | "thumbnailCreated"
  | "encrypting"
  | "encrypted"
  | "started"
  | "progress"
  | "completed"
  | "error"
  | "cancelled"
  | "duplicate";

export type ProgressEventPayload = {
  id: string;
  type: Progress;
  payload?: any;
};
