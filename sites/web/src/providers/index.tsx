import { ReactNode } from "react";
import FilesProvider from "./filesProvider";

type ProviderProps = {
  children: ReactNode;
};

const Provider: React.FC<ProviderProps> = ({ children }) => {
  return <FilesProvider>{children}</FilesProvider>;
};

export default Provider;
