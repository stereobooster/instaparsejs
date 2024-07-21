import { type Tree } from "instaparse";
import { memoizeOne } from "./memoizeOne";

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

  function rec(tree: Tree, prefix: number, parentId?: string, n?: number) {
    if ("value" in tree) {
      if (parentId !== undefined) {
        const id = `${parentId}_${n}`;

        if (!edges.has(`${parentId}->${id}`)) {
          const packedId = `${parentId}_${prefix}`;
          edges.set(`${parentId}->${id}`, packedId);
          if (!edges.has(`${parentId}->${packedId}`))
            edges.set(`${parentId}->${packedId}`, `${parentId}->${packedId}`);
          edges.set(`${packedId}->${id}`, `${packedId}->${id}`);
          nodes.set(packedId, {
            label: ``,
            type: "packed",
          });
        } else {
          const packedId = edges.get(`${parentId}->${id}`)!;
          addTreeEdge(`${parentId}->${packedId}`, prefix);
          addTreeEdge(`${packedId}->${id}`, prefix);
          addTreeNode(packedId, prefix);
        }

        nodes.set(id, { label: tree.value, type: "symbol" });
        addTreeNode(id, prefix);
      }
    } else {
      const id = `${tree.tag}_${tree.pos[0]}_${tree.pos[1]}`;

      if (parentId !== undefined) {
        if (!edges.has(`${parentId}->${id}`)) {
          const packedId = `${parentId}_${prefix}`;
          edges.set(`${parentId}->${id}`, packedId);
          if (!edges.has(`${parentId}->${packedId}`)) {
            edges.set(`${parentId}->${packedId}`, `${parentId}->${packedId}`);
          }
          edges.set(`${packedId}->${id}`, `${packedId}->${id}`);
          addTreeEdge(`${parentId}->${packedId}`, prefix);
          addTreeEdge(`${packedId}->${id}`, prefix);
          nodes.set(packedId, {
            label: ``,
            type: "packed",
          });
          addTreeNode(packedId, prefix);
        } else {
          const packedId = edges.get(`${parentId}->${id}`)!;
          addTreeEdge(`${parentId}->${packedId}`, prefix);
          addTreeEdge(`${packedId}->${id}`, prefix);
          addTreeNode(packedId, prefix);
        }
      }

      if (tree.children.length === 1 && "value" in tree.children[0]) {
        nodes.set(id, {
          label: tree.children[0].value,
          type: "symbol",
          pos: tree.pos,
        });
      } else {
        nodes.set(id, {
          label: tree.tag,
          type: "intermediate",
          pos: tree.pos,
        });
        tree.children.forEach((t, i) => rec(t, prefix, id, i));
      }
      addTreeNode(id, prefix);
    }
  }

  trees.forEach((tree, i) => rec(tree, i));

  return { nodes, edges, treeNodes, treeEdges };
}

const treeToSppfDotRec = memoizeOne(_treeToSppfDotRec);

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
    .map(
      (e) => `${e}${treeEdges.get(e)?.has(highlight) ? "[color=red]" : ""}`
    )
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

  function rec(tree: Tree, prefix: number, parentId?: string, n?: number) {
    if ("value" in tree) {
      if (parentId !== undefined && n !== undefined) {
        const id = `${parentId}_${n}`;
        nodes.set(id, { label: tree.value, type: "symbol" });
        edges.push(`${parentId}->${id}`);
        addTreeNode(id, prefix);
        addTreeEdge(`${parentId}->${id}`, prefix);
      }
    } else {
      const id = `${tree.tag}_${prefix}_${tree.pos[0]}_${tree.pos[1]}`;
      if (parentId !== undefined) {
        edges.push(`${parentId}->${id}`);
        addTreeEdge(`${parentId}->${id}`, prefix);
      }

      if (tree.children.length === 1 && "value" in tree.children[0]) {
        nodes.set(id, {
          label: tree.children[0].value,
          type: "symbol",
          pos: tree.pos,
        });
      } else {
        nodes.set(id, {
          label: tree.tag,
          type: "intermediate",
          pos: tree.pos,
        });
        tree.children.forEach((t, i) => rec(t, prefix, id, i));
      }
      addTreeNode(id, prefix);
    }
  }

  trees.forEach((tree, i) => rec(tree, i));

  return { nodes, edges, treeNodes, treeEdges };
}

const treeToDotRec = memoizeOne(_treeToDotRec);

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
    .map(
      (e) => `${e}${treeEdges.get(e)?.has(highlight) ? "[color=red]" : ""}`
    )
    .join("\n")}
}`;
}
