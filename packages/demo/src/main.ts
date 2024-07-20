import "./index.css";
import { parserPosAll, type Tree } from "instaparsejs";
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
const grammar = document.querySelector("#grammar")! as HTMLTextAreaElement;
const text = document.querySelector("#text")! as HTMLTextAreaElement;
const error = document.querySelector("#error")!;
const errorMessage = document.querySelector("#errorMessage")!;
const allTrees = document.querySelector("#allTrees")! as HTMLInputElement;
const allTreesLabel = document.querySelector("#allTreesLabel")!;

grammar.textContent = `EXP = E
<E> = <"("> E <")"> / or / and / id
and = E <"&"> E
or = E <"|"> E
id = "a"|"b"|"c"`;
text.textContent = "a&b&c";

let panZoomInstance: PanZoomUi;

function process() {
  const grammarValue = grammar.value;
  const textValue = text.value;
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
        treeToDot(showAlltrees ? trees : [trees[0]])
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

process();
grammar.addEventListener("keyup", () => process());
text.addEventListener("keyup", () => process());
allTrees.addEventListener("change", () => process());
