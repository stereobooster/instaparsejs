import { parserPosAll } from "instaparse";

export function parseWorker(grammar: string, text: string) {
  return parserPosAll(grammar)(text);
}
