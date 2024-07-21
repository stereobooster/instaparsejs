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
    }
  }

  trees.forEach((tree, i) => rec(tree, i));

  return { nodes, edges };
}

const treeToSppfDotRec = memoizeOne(_treeToSppfDotRec);

export function treeToSppfDot(trees: Tree[], showRanges = false) {
  const { nodes, edges } = treeToSppfDotRec(trees);
  return `
  digraph AST {
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
          } ${type !== "packed" ? "height=0.3" : ""}]`
      )
      .join("\n")}
    ${Array.from(edges.values()).join("\n")}
  }`;
}

export function treeToDot(trees: Tree[], showRanges = false) {
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
          `${tree.children[0].value}${
            showRanges ? ` (${tree.pos[0]}, ${tree.pos[1]})` : ""
          }`
        );
      } else {
        nodes.set(
          id,
          `${tree.tag}${showRanges ? ` (${tree.pos[0]}, ${tree.pos[1]})` : ""}`
        );
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
