import { Highlight, themes } from "prism-react-renderer";

interface CodeHighlightProps {
  code: string;
  language: string;
  isDark?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "c",
  cs: "csharp",
  php: "php",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  xml: "markup",
  html: "markup",
  css: "css",
  scss: "scss",
  sql: "sql",
  md: "markdown",
  dockerfile: "docker",
  makefile: "makefile",
  txt: "plain",
  log: "plain",
  env: "bash",
  gitignore: "git",
};

export function CodeHighlight({
  code,
  language,
  isDark = false,
}: CodeHighlightProps) {
  const lang = LANGUAGE_MAP[language.toLowerCase()] || "plain";
  const theme = isDark ? themes.nightOwl : themes.github;

  return (
    <Highlight theme={theme} code={code} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} text-sm overflow-auto p-4 rounded-lg`}
          style={{ ...style, margin: 0 }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="table-row">
              <span className="table-cell pr-4 text-right select-none opacity-40 text-xs">
                {i + 1}
              </span>
              <span className="table-cell">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
