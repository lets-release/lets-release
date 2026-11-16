import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

export async function parseMarkdown(content: string): Promise<string> {
  const marked = new Marked(markedTerminal());

  return await marked.parse(content);
}
