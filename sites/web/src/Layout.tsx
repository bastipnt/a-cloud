import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <main className="grid auto-rows-auto grid-cols-[1fr_minmax(min-content,700px)_1fr] gap-y-8 px-4 py-16 *:col-start-2 [&>.col-start-1]:col-start-1">
      {children}
    </main>
  );
};

export default Layout;
