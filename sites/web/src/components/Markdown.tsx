import Md from "marked-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { twJoin, twMerge } from "tailwind-merge";

type MarkdownProps = {
  children: string;
  thumbnail?: boolean;
};

const Markdown: React.FC<MarkdownProps> = ({ children, thumbnail }) => {
  const thumbnailClassNames = "space-y-1";
  const classNames = "[&_h1]:text-xl space-y-4";

  return (
    <section
      className={twMerge(
        "[&_h1]:text-red-400 [&_h2]:text-green-400",
        thumbnail ? thumbnailClassNames : classNames,
      )}
    >
      <Md
        renderer={{
          code(snippet, lang) {
            return (
              <SyntaxHighlighter
                key={this.elementId}
                language={lang}
                style={atomOneDark}
                // customStyle={{ backgroundColor: "inherit" }}
                customStyle={{ margin: thumbnail ? "0" : "1rem 0", borderRadius: "0.5rem" }}
                showLineNumbers
                wrapLongLines
              >
                {snippet as string}
              </SyntaxHighlighter>
            );
          },
          checkbox(checked) {
            return (
              <input
                key={this.elementId}
                className={twJoin(thumbnail ? "mr-0.5 h-2" : "mr-2")}
                type="checkbox"
                checked={checked as boolean}
                disabled
              />
            );
          },
          link(href, text) {
            if (thumbnail)
              return (
                <span key={this.elementId} className="text-blue-400 underline">
                  {text}
                </span>
              );

            return (
              <a key={this.elementId} className="text-blue-400 underline" href={href}>
                {text}
              </a>
            );
          },
        }}
      >
        {children}
      </Md>
    </section>
  );
};

export default Markdown;
