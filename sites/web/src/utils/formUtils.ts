import { array } from "yup";

const MAX_FILE_SIZE = 10 * 1024 * 1024; /* 10 MB */
// const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const checkIfFilesAreTooBig = (files?: File[]): boolean => {
  if (!files) return true;

  return files.every((file) => file.size <= MAX_FILE_SIZE);
};

// const checkIfFilesAreCorrectType = (files?: File[]): boolean => {
//   if (!files) return true;

//   return files.every((file) => ALLOWED_FILE_TYPES.includes(file.type));
// };

export const filesSchema = () =>
  array<File, File>()
    .nullable()
    .required("VALIDATION_FIELD_REQUIRED")
    .test("is-big-file", "VALIDATION_FIELD_FILE_BIG", checkIfFilesAreTooBig);
// .test("is-correct-file", "VALIDATION_FIELD_FILE_WRONG_TYPE", checkIfFilesAreCorrectType);
