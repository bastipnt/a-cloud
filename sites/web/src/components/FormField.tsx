import { Field } from "formik";
import { twMerge } from "tailwind-merge";

type FormFieldProps = React.HTMLProps<HTMLInputElement>;

const FormField: React.FC<FormFieldProps> = ({ className, disabled, type, ...props }) => (
  <Field
    {...props}
    type={type}
    className={twMerge(
      "border p-1",
      disabled && "text-gray-500",
      type === "file" &&
        "border-0 p-0 [&::file-selector-button]:cursor-pointer [&::file-selector-button]:border [&::file-selector-button]:p-1",
      className,
    )}
  />
);

export default FormField;
