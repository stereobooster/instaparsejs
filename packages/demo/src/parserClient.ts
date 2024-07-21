const instance = new ComlinkWorker<typeof import("./parserWorker")>(
  new URL("./parserWorker", import.meta.url),
  {
    name: "parserWorker",
    type: "module",
  }
);

// TODO: is there a way to cancel all previous requests if there is more fresher one
// https://github.com/GoogleChromeLabs/comlink/issues/372
// https://github.com/whatwg/dom/issues/948
export function parse(grammar: string, text: string) {
  return instance.parse(grammar, text);
}
