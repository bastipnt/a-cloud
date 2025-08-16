import { twMerge } from "tailwind-merge";

type CloseProps = {
  className?: string;
};

const Close: React.FC<CloseProps> = ({ className }) => (
  <div role="status" className={twMerge("h-6 w-6 text-black dark:text-white", className)}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full fill-inherit text-inherit"
    >
      <g id="Close">
        <path
          id="Vector"
          d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
    <span className="sr-only">Close</span>
  </div>
);

export default Close;
