import { Lexer, StateRules } from "./lexer-generator";

type CTX = {}
export type MarkdownToken =
  | { type: "heading", size: number, value: string }
  | { type: "code", language?: string, value: string, block: boolean }
  | { type: "table", rows: [], cols: [] }
  | { type: "text", value: string }
  | { type: "quote", value: string }
  | { type: "bullet-list", items: string[] }
  | { type: "numeric-list", items: string[] }
  | { type: "checkbox-list", items: string[] }
  | { type: "link", text: string, href: string }
  | { type: "image", alt: string, href: string }
  | { type: "quote", value: string }
  | { type: "bold", value: string }
  | { type: "italic", value: string }
  | { type: "line" }
  | { type: "breakline" };

const markdownRules: StateRules<CTX, MarkdownToken> = {
  data: [
    { condition: () => true, action: (ctx, char) => ctx.append(char) }
  ]
};

// Run the lexer
export function markdown(value: string) {
  const lexer = new Lexer<CTX, MarkdownToken>(
    markdownRules,
    "data",
    {}
  );

  return lexer.run(value);
}
