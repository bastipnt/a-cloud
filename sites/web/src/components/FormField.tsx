import { Field, FieldAttributes } from "formik";
import { twMerge } from "tailwind-merge";

type FormFieldProps = React.HTMLProps<HTMLInputElement> & FieldAttributes<any>;

const FormField: React.FC<FormFieldProps> = ({ className, disabled, ...props }) => (
  <Field {...props} className={twMerge("border p-1", disabled && "text-gray-500", className)} />
);

export default FormField;
