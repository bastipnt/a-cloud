import { useField } from "formik";
import { useId } from "react";
import { twMerge } from "tailwind-merge";

type FormFieldProps = Omit<React.HTMLProps<HTMLInputElement>, "id"> & {
  name: string;
  label: string;
};

const FormField: React.FC<FormFieldProps> = ({
  name,
  className,
  disabled,
  label,
  type,
  ...props
}) => {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? String(meta.error) : undefined;
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="space-x-4">
      <label htmlFor={inputId}>{label}</label>
      <input
        {...props}
        {...field}
        id={inputId}
        type={type}
        aria-required={props.required ?? false}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-errormessage={errorId}
        className={twMerge(
          "border p-1",
          disabled && "text-gray-500",
          type === "file" &&
            "border-0 p-0 [&::file-selector-button]:cursor-pointer [&::file-selector-button]:border [&::file-selector-button]:p-1",
          className,
        )}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
