import { Form, FormikProps, withFormik } from "formik";
import { ChangeEvent } from "react";
import { InferType, object } from "yup";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { filesSchema } from "../utils/formUtils";

const fileUploadSchema = object({
  files: filesSchema(),
});

export type FileUploadFormValues = InferType<typeof fileUploadSchema>;

interface FormProps {
  handleSubmit: (values: FileUploadFormValues) => Promise<void>;
}

const FileUploadInnerForm: React.FC<FormikProps<FileUploadFormValues>> = ({
  touched,
  errors,
  isSubmitting,
  setFieldValue,
  setFieldTouched,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = [];

      for (const file of e.target.files) {
        newFiles.push(file);
      }

      setFieldValue("files", newFiles, true);
      setFieldTouched("files", true);
    }
  };

  return (
    <Form className="flex w-3xs flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="upload">Upload File</label>
        <FormField id="upload" type="file" name="upload" onChange={handleFileChange} multiple />
        {touched.files && errors.files && typeof errors.files === "string" && (
          <div>{errors.files}</div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !touched.files || !!errors.files}
        loading={isSubmitting}
      >
        Upload
      </Button>
    </Form>
  );
};

const FileUploadForm = withFormik<FormProps, FileUploadFormValues>({
  mapPropsToValues: () => {
    return {
      files: [],
    };
  },

  enableReinitialize: true,

  validationSchema: fileUploadSchema,

  handleSubmit: (values, { props: { handleSubmit } }) => handleSubmit(values),
})(FileUploadInnerForm);

export default FileUploadForm;
