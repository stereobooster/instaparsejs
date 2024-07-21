import "./index.css";
import "@beoe/pan-zoom/css/PanZoomUi.css";
import { PanZoomUi } from "@beoe/pan-zoom";
import { renderDot } from "./renderDot";
import { treeToDot, treeToSppfDot } from "./treeToDot";
import { parseClient } from "./parseClient";

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
const ranges = document.querySelector("#ranges")! as HTMLInputElement;
const highlight = document.querySelector("#highlight")! as HTMLInputElement;
const download = document.querySelector("#download")! as HTMLButtonElement;

let panZoomInstance: PanZoomUi;

const u = new URL(window.location.toString());
const p = u.searchParams;
const value =
  p.get("g") ||
  `EXP = E
<E> = <"("> E <")"> / mul / (add | sub) / num
mul = E <"*"> E
add = E <"+"> E
sub = E <"-"> E
num = #"\\d+"`;
if (grammar) grammar.textContent = value;
text.textContent = p.get("t") || "1+2*3+4";
allTrees.checked = Boolean(p.get("all"));
sppf.checked = Boolean(p.get("sppf"));
ranges.checked = Boolean(p.get("ranges"));
const highlightTree = p.get("highlight") || "";
if (highlightTree) {
  highlight.innerHTML = `<option value="">None</option><option value="${highlightTree}">${highlightTree}</option>`;
  highlight.value = highlightTree;
}

import * as monaco from "monaco-editor";
import { bnfLanguage } from "./bnfLanguage";
import { downloadString } from "./downloadBlob";
monaco.languages.register({ id: "bnf" });
monaco.languages.setMonarchTokensProvider("bnf", bnfLanguage);

async function validate(model: monaco.editor.ITextModel) {
  const markers = [];
  try {
    await parseClient(model.getValue(), '');
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
  bracketPairColorization: { enabled: true },
  matchBrackets: "always",
});

async function process(valid = true) {
  const grammarValue = grammar?.value || model.getValue();
  const textValue = text.value;
  const showSppf = sppf.checked;
  const showAlltrees = allTrees.checked;
  const showRanges = ranges.checked;
  const highlightedTree = parseFloat(highlight.value);

  if (valid) {
    try {
      error.classList.add("hidden");
      allTreesLabel.textContent = `Show all trees`;

      // const trees = parserPosAll(grammarValue)(textValue);
      const trees = await parseClient(grammarValue, textValue);
      highlight.innerHTML =
        `<option value="">None</option>` +
        Array.from(Array(trees.length))
          .map((_, i) => `<option value="${i}">${i}</option>`)
          .join("\n");
      highlight.value = isNaN(highlightedTree) ? "" : `${highlightedTree}`;

      // TODO: why it doesn't show error?
      if (trees.length === 0) {
        error.classList.remove("hidden");
        errorMessage.textContent = "Can't parse";
      } else {
        result.innerHTML = renderDot(
          showSppf
            ? treeToSppfDot(
                showAlltrees
                  ? trees
                  : [trees[isNaN(highlightedTree) ? 0 : highlightedTree]],
                showRanges,
                showAlltrees ? highlightedTree : -1
              )
            : treeToDot(
                showAlltrees
                  ? trees
                  : [trees[isNaN(highlightedTree) ? 0 : highlightedTree]],
                showRanges,
                showAlltrees ? highlightedTree : -1
              )
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
  p.set("ranges", showRanges ? "1" : "");
  p.set("highlight", isNaN(highlightedTree) ? "" : `${highlightedTree}`);
  window.history.replaceState({}, "", u);
}

process(await validate(model));
editor.onDidChangeModelContent(async () => {
  process(await validate(model));
});

// process();
grammar?.addEventListener("keyup", () => process());
text.addEventListener("keyup", () => process());
allTrees.addEventListener("change", () => process());
sppf.addEventListener("change", () => process());
ranges.addEventListener("change", () => process());
highlight.addEventListener("change", () => process());
download.addEventListener("click", () =>
  downloadString(
    result.firstElementChild?.outerHTML || "",
    "image/svg+xml",
    "ast.svg"
  )
);
