import "./index.css";
import { parserPosAll, type Tree } from "instaparse";
import { Graphviz } from "@hpcc-js/wasm";
import { optimize, type Config as SvgoConfig } from "svgo";

import "@beoe/pan-zoom/css/PanZoomUi.css";
import { PanZoomUi } from "@beoe/pan-zoom";

const graphviz = await Graphviz.load();
const svgoConfig: SvgoConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // we need viewbox for inline SVGs
          removeViewBox: false,
        },
      },
    },
  ],
};
function renderDot(dot: string) {
  return optimize(graphviz.dot(dot), svgoConfig).data;
}

type Node = {
  // id: string,
  label: string;
  pos?: [number, number];
  // In the visualizations symbol nodes are shown as rectangles with rounded corners,
  // packed nodes are shown as circles, or ovals when the label is visualized,
  // and intermediate nodes are shown as rectangles.
  type: "symbol" | "packed" | "intermediate";
};

function treeToSppfDot(trees: Tree[]) {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, string>();

  function rec(tree: Tree, prefix: number, parentId?: string, n?: number) {
    if ("value" in tree) {
      if (parentId !== undefined) {
        const id = `${parentId}_${n}`;

        if (!edges.has(`${parentId}->${id}`)) {
          const packedId = `${parentId}_${prefix}`;
          edges.set(`${parentId}->${id}`, ``);
          if (!edges.has(`${parentId}->${packedId}`))
            edges.set(`${parentId}->${packedId}`, `${parentId}->${packedId}`);
          edges.set(`${packedId}->${id}`, `${packedId}->${id}`);
          nodes.set(packedId, {
            label: ``,
            type: "packed",
          });
        }

        nodes.set(id, { label: tree.value, type: "symbol" });
      }
    } else {
      const id = `${tree.tag}_${tree.pos[0]}_${tree.pos[1]}`;

      if (parentId !== undefined) {
        if (!edges.has(`${parentId}->${id}`)) {
          const packedId = `${parentId}_${prefix}`;
          edges.set(`${parentId}->${id}`, ``);
          if (!edges.has(`${parentId}->${packedId}`))
            edges.set(`${parentId}->${packedId}`, `${parentId}->${packedId}`);
          edges.set(`${packedId}->${id}`, `${packedId}->${id}`);
          nodes.set(packedId, {
            label: ``,
            type: "packed",
          });
        }
      }

      if (tree.children.length === 1 && "value" in tree.children[0]) {
        nodes.set(id, {
          label: `${tree.children[0].value} (${tree.pos[0]}, ${tree.pos[1]})`,
          type: "symbol",
          pos: tree.pos,
        });
      } else {
        nodes.set(id, {
          label: `${tree.tag} (${tree.pos[0]}, ${tree.pos[1]})`,
          type: "intermediate",
          pos: tree.pos,
        });
        tree.children.forEach((t, i) => rec(t, prefix, id, i));
      }
    }
  }

  trees.forEach((tree, i) => rec(tree, i));
  return `
digraph AST {
  ${Array.from(nodes.entries())
    .map(
      ([id, { label, type }]) =>
        `${id}[label="${label}" ${
          type === "symbol"
            ? "shape=rect style=rounded"
            : type === "intermediate"
            ? "shape=rect"
            : "shape=point"
        } ${type !== "packed" ? "height=0.3" : ""}]`
    )
    .join("\n")}
  ${Array.from(edges.values()).join("\n")}
}`;
}

function treeToDot(trees: Tree[]) {
  const nodes = new Map<string, string>();
  const edges: Array<[string, string]> = [];

  function rec(tree: Tree, prefix: number, parentId?: string, n?: number) {
    if ("value" in tree) {
      if (parentId !== undefined && n !== undefined) {
        const id = `${parentId}_${n}`;
        nodes.set(id, tree.value);
        edges.push([parentId, id]);
      }
    } else {
      const id = `${tree.tag}_${prefix}_${tree.pos[0]}_${tree.pos[1]}`;
      if (parentId !== undefined) edges.push([parentId, id]);
      if (tree.children.length === 1 && "value" in tree.children[0]) {
        nodes.set(
          id,
          `${tree.children[0].value} (${tree.pos[0]}, ${tree.pos[1]})`
        );
      } else {
        nodes.set(id, `${tree.tag} (${tree.pos[0]}, ${tree.pos[1]})`);
        tree.children.forEach((t, i) => rec(t, prefix, id, i));
      }
    }
  }

  trees.forEach((tree, i) => rec(tree, i));

  return `
digraph AST {
  ${Array.from(nodes.entries())
    .map(
      ([id, label]) =>
        `${id}[label="${label}" shape=rect style=rounded height=0.3]`
    )
    .join("\n")}
  ${edges.map((p) => p.join(` -> `)).join("\n")}
}`;
}

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

const value = `EXP = E
<E> = <"("> E <")"> / or / and / id
and = E <"&"> E
or = E <"|"> E
id = "a"|"b"|"c"`;
if (grammar) grammar.textContent = value;
text.textContent = "a&b&c";

import * as monaco from "monaco-editor";
monaco.languages.register({ id: "bnf" });

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

// https://microsoft.github.io/monaco-editor/monarch.html
// https://microsoft.github.io/monaco-editor/playground.html?source=v0.50.0#example-extending-language-services-model-markers-example
// https://github.com/microsoft/monaco-editor/tree/main/src/basic-languages
// https://github.com/Engelberg/instaparse?tab=readme-ov-file#notation
monaco.languages.setMonarchTokensProvider("bnf", {
  operators: ["*", "?", "=", ":", ":=", "::=", "|"],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // C# style strings
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-zA-Z_$][\w$]*/, "variable"],

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/;/, "delimiter"],
      [/[{}()\[\]<>]/, "@brackets"],
      [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

      // characters
      [/'[^\\']'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
    ],

    comment: [
      [/[^()*]+/, "comment"],
      [/\(\*/, "comment", "@push"], // nested comment
      [/\*\)/, "comment", "@pop"],
      [/[()*]/, "comment"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\(\*/, "comment", "@comment"],
    ],
  },
});

const editor = monaco.editor.create(document.getElementById("editor")!, {
  language: "bnf",
  minimap: { enabled: false },
  model,
});

function process() {
  const grammarValue = grammar?.value || model.getValue();
  const textValue = text.value;
  const showSppf = sppf.checked;
  const showAlltrees = allTrees.checked;

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

if (validate(model)) process();
editor.onDidChangeModelContent(() => {
  if (validate(model)) process();
});

// process();
grammar?.addEventListener("keyup", () => process());
text.addEventListener("keyup", () => process());
allTrees.addEventListener("change", () => process());
sppf.addEventListener("change", () => process());
