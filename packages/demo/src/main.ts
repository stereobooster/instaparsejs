import "./index.css";
import { parserPosAll } from "instaparse";
import "@beoe/pan-zoom/css/PanZoomUi.css";
import { PanZoomUi } from "@beoe/pan-zoom";
import { renderDot } from "./renderDot";
import { treeToDot, treeToSppfDot } from "./treeToDot";

const result = document.querySelector("#result")!;
const grammar = document.querySelector(
  "#grammar"
) as HTMLTextAreaElement | null;
const text = document.querySelector("#text")! as HTMLTextAreaElement;
const error = document.querySelector("#error")!;
const errorMessage = document.querySelector("#errorMessage")!;
const allTrees = document.querySelector("#allTrees")! as HTMLInputElement;
const allTreesLabel = document.querySelector("#allTreesLabel")!;
const sppf = document.querySelector("#sppf")! as HTMLInputElement;

let panZoomInstance: PanZoomUi;

const u = new URL(window.location.toString());
const p = u.searchParams;
const value =
  p.get("g") ||
  `EXP = E
<E> = <"("> E <")"> / or / and / id
and = E <"&"> E
or = E <"|"> E
id = "a"|"b"|"c"`;
if (grammar) grammar.textContent = value;
text.textContent = p.get("t") || "a&b&c";
allTrees.checked = Boolean(p.get("all"));
sppf.checked = Boolean(p.get("sppf"));

import * as monaco from "monaco-editor";
import { bnfLanguage } from "./bnfLanguage";
monaco.languages.register({ id: "bnf" });
monaco.languages.setMonarchTokensProvider("bnf", bnfLanguage);

function validate(model: monaco.editor.ITextModel) {
  const markers = [];
  try {
    parserPosAll(model.getValue());
  } catch (e) {
    if (typeof e == "string") {
      const arr = e.split("\n");
      if (arr.length > 4) {
        arr.shift();
        const pos = arr.shift();
        arr.shift();
        arr.shift();

        const p = pos?.match(/line (\d+), column (\d+)/);
        const line = p ? parseFloat(p[1]) : 1;
        const column = p ? parseFloat(p[2]) : 1;

        markers.push({
          message: arr.join("\n"),
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column,
        });
      } else {
        markers.push({
          message: arr.join("\n"),
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        });
      }
    }
  }

  monaco.editor.setModelMarkers(model, "owner", markers);
  return markers.length === 0;
}
const uri = monaco.Uri.parse("inmemory://test");
const model = monaco.editor.createModel(value, "bnf", uri);

const editor = monaco.editor.create(document.getElementById("editor")!, {
  language: "bnf",
  minimap: { enabled: false },
  model,
});

function process(valid = true) {
  const grammarValue = grammar?.value || model.getValue();
  const textValue = text.value;
  const showSppf = sppf.checked;
  const showAlltrees = allTrees.checked;

  if (valid) {
    try {
      error.classList.add("hidden");
      allTreesLabel.textContent = `Show all trees`;

      const trees = parserPosAll(grammarValue)(textValue);
      // TODO: why it doesn't show error?
      if (trees.length === 0) {
        error.classList.remove("hidden");
        errorMessage.textContent = "Can't parse";
      } else {
        result.innerHTML = renderDot(
          showSppf
            ? treeToSppfDot(showAlltrees ? trees : [trees[0]])
            : treeToDot(showAlltrees ? trees : [trees[0]])
        );
        allTreesLabel.textContent = `Show all trees (${trees.length})`;
        const element = result.firstElementChild;
        if (panZoomInstance) panZoomInstance.off();
        // @ts-expect-error
        panZoomInstance = new PanZoomUi({ element, container: result });
        panZoomInstance.on();
      }
    } catch (e) {
      error.classList.remove("hidden");
      if (typeof e === "string") {
        errorMessage.textContent = e;
      } else {
        errorMessage.textContent = (e as Error).message;
      }
    }
  }

  p.set("g", grammarValue);
  p.set("t", textValue);
  p.set("sppf", showSppf ? "1" : "");
  p.set("all", showAlltrees ? "1" : "");
  window.history.replaceState({}, "", u);
}

process(validate(model));
editor.onDidChangeModelContent(() => {
  process(validate(model));
});

// process();
grammar?.addEventListener("keyup", () => process());
text.addEventListener("keyup", () => process());
allTrees.addEventListener("change", () => process());
sppf.addEventListener("change", () => process());
