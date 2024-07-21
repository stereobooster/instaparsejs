import { parserPosAll as _parserPosAll } from "instaparse";
import { memoizeOne } from "./memoizeOne";

const parserPosAll = memoizeOne((grammar: string) => {
  const parser = _parserPosAll(grammar);
  return memoizeOne((text: string) => parser(text));
});

export function parseWorker(grammar: string, text: string) {
  return parserPosAll(grammar)(text);
}
