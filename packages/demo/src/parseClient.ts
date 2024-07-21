const instance = new ComlinkWorker<typeof import("./parseWorker")>(
  new URL("./parseWorker", import.meta.url),
  {
    name: "parseWorker",
    type: "module",
  }
);

// TODO: is there a way to cancel all previous requests if there is more fresher one
// https://github.com/GoogleChromeLabs/comlink/issues/372
// https://github.com/whatwg/dom/issues/948
export function parseClient(grammar: string, text: string) {
  return instance.parseWorker(grammar, text);
}
