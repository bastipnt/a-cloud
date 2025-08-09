import { twMerge } from "tailwind-merge";
import Spinner from "./svg/Spinner";

type ButtonProps = React.HTMLProps<HTMLButtonElement> & {
  type?: "submit" | "reset" | "button";
  loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({ loading, className, children, disabled, ...props }) => (
  <button
    {...props}
    disabled={disabled}
    className={twMerge(
      "flex cursor-pointer flex-row items-center justify-center gap-4 border p-1",
      disabled && "cursor-not-allowed text-gray-400",
      className,
    )}
  >
    {loading ? <Spinner className="h-6 w-6 fill-gray-900" /> : children}
  </button>
);

export default Button;
