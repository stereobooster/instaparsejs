import { type Tree } from "instaparse";
import memoize from "micro-memoize";

type Node = {
  // either tag or value
  label: string;
  // In the visualizations symbol nodes are shown as rectangles with rounded corners,
  // packed nodes are shown as circles, or ovals when the label is visualized,
  // and intermediate nodes are shown as rectangles.
  type: "symbol" | "packed" | "intermediate";
  pos?: [number, number];
};

function _treeToSppfDotRec(trees: Tree[]) {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, string>();
  const treeNodes = new Map<string, Set<number>>();
  const addTreeNode = (id: string, prefix: number) => {
    treeNodes.set(id, treeNodes.get(id) || new Set());
    treeNodes.get(id)?.add(prefix);
  };
  const treeEdges = new Map<string, Set<number>>();
  const addTreeEdge = (id: string, prefix: number) => {
    treeEdges.set(id, treeEdges.get(id) || new Set());
    treeEdges.get(id)?.add(prefix);
  };

  function rec(tree: Tree, prefix: number, parentId?: string) {
    const id = `${tree.tag}_${tree.pos[0]}_${tree.pos[1]}`;

    nodes.set(id, {
      // label:
      //   tree.value !== undefined ? `${tree.tag} [${tree.value}]` : tree.tag,
      label: tree.value !== undefined ? tree.value : tree.tag,
      type: tree.value !== undefined ? "symbol" : "intermediate",
      pos: tree.pos,
    });
    addTreeNode(id, prefix);

    if (parentId !== undefined) {
      addTreeEdge(`${parentId}->${id}`, prefix);
      edges.set(`${parentId}->${id}`, `${parentId}->${id}`);
    }

    if (tree.children !== undefined) {
      const packedId =
        "_" +
        tree.children.map((x) => `${x.tag}_${x.pos[0]}_${x.pos[1]}`).join("_");

      nodes.set(packedId, {
        label: ``,
        type: "packed",
      });
      addTreeNode(packedId, prefix);

      addTreeEdge(`${id}->${packedId}`, prefix);
      edges.set(`${id}->${packedId}`, `${id}->${packedId}`);

      tree.children.forEach((t) => rec(t, prefix, packedId));
    }
  }

  trees.forEach((tree, i) => rec(tree, i));

  return { nodes, edges, treeNodes, treeEdges };
}

const treeToSppfDotRec = memoize(_treeToSppfDotRec, { maxSize: 5 });

export function treeToSppfDot(
  trees: Tree[],
  showRanges: boolean,
  highlight = -1
) {
  const { nodes, edges, treeEdges, treeNodes } = treeToSppfDotRec(trees);

  return `digraph AST {
  ${Array.from(nodes.entries())
    .map(
      ([id, { label, type, pos }]) =>
        `${id}[label="${label}${
          showRanges && pos ? ` (${pos[0]}, ${pos[1]})` : ""
        }" ${
          type === "symbol"
            ? "shape=rect style=rounded"
            : type === "intermediate"
            ? "shape=rect"
            : "shape=point"
        } ${type !== "packed" ? "height=0.3" : ""}${
          treeNodes.get(id)?.has(highlight) ? " color=red" : ""
        }]`
    )
    .join("\n")}
  ${Array.from(edges.values())
    .map((e) => `${e}${treeEdges.get(e)?.has(highlight) ? "[color=red]" : ""}`)
    .join("\n")}
}`;
}

function _treeToDotRec(trees: Tree[]) {
  const nodes = new Map<string, Node>();
  const edges: Array<string> = [];
  const treeNodes = new Map<string, Set<number>>();
  const addTreeNode = (id: string, prefix: number) => {
    treeNodes.set(id, treeNodes.get(id) || new Set());
    treeNodes.get(id)?.add(prefix);
  };
  const treeEdges = new Map<string, Set<number>>();
  const addTreeEdge = (id: string, prefix: number) => {
    treeEdges.set(id, treeEdges.get(id) || new Set());
    treeEdges.get(id)?.add(prefix);
  };

  function rec(tree: Tree, prefix: number, parentId?: string) {
    const id = `${tree.tag}_${prefix}_${tree.pos[0]}_${tree.pos[1]}`;

    nodes.set(id, {
      // label:
      //   tree.value !== undefined ? `${tree.tag} [${tree.value}]` : tree.tag,
      label: tree.value !== undefined ? tree.value : tree.tag,
      type: tree.value !== undefined ? "symbol" : "intermediate",
      pos: tree.pos,
    });
    addTreeNode(id, prefix);

    if (parentId !== undefined) {
      edges.push(`${parentId}->${id}`);
      addTreeEdge(`${parentId}->${id}`, prefix);
    }

    if (tree.children !== undefined)
      tree.children.forEach((t) => rec(t, prefix, id));
  }

  trees.forEach((tree, i) => rec(tree, i));

  return { nodes, edges, treeNodes, treeEdges };
}

const treeToDotRec = memoize(_treeToDotRec, { maxSize: 5 });

export function treeToDot(trees: Tree[], showRanges: boolean, highlight = -1) {
  const { nodes, edges, treeNodes, treeEdges } = treeToDotRec(trees);

  return `digraph AST {
  ${Array.from(nodes.entries())
    .map(
      ([id, { label, type, pos }]) =>
        `${id}[label="${label}${
          showRanges && pos ? ` (${pos[0]}, ${pos[1]})` : ""
        }" ${
          type === "symbol"
            ? "shape=rect style=rounded"
            : type === "intermediate"
            ? "shape=rect"
            : "shape=point"
        } ${type !== "packed" ? "height=0.3" : ""}${
          treeNodes.get(id)?.has(highlight) ? " color=red" : ""
        }]`
    )
    .join("\n")}
  ${edges
    .map((e) => `${e}${treeEdges.get(e)?.has(highlight) ? "[color=red]" : ""}`)
    .join("\n")}
}`;
}
