import { type Tree } from "instaparse";
import memoize from "micro-memoize";

type Node = {
  // either tag or value
  label: string;
  // In the visualizations symbol nodes are shown as rectangles with rounded corners,
  // packed nodes are shown as circles, or ovals when the label is visualized,
  // and intermediate nodes are shown as rectangles.
  type: "symbol" | "packed" | "intermediate";
  pos?: [number | null, number | null];
};

function addMissingPos(tree: Tree, n?: number, siblings?: Tree[]): number {
  if ("value" in tree) {
    if (n !== undefined && siblings !== undefined) {
      console.log(n, tree.value);
      let start: number | null = null;
      let end: number | null = null;
      const prev = siblings[n - 1];
      const next = siblings[n + 1];

      if (prev && "pos" in prev && prev.pos) start = prev.pos[1];
      if (next && "pos" in next && next.pos) end = next.pos[0];
      if (start === null && end !== null) start = end - [...tree.value].length;
      if (start !== null && end === null) end = start + [...tree.value].length;

      // @ts-ignore
      tree.pos = [start, end];
      if (start === null || end === null) return 0;
    }
  } else {
    if (tree.children.length === 1 && "value" in tree.children[0]) {
      // @ts-ignore
      tree.children[0].pos = tree.pos;
    } else {
      const checkLength = tree.children
        .map((x, i) => addMissingPos(x, i, tree.children))
        .reduce((x, y) => x + y, 0);
      if (checkLength !== tree.children.length) {
        [...tree.children]
          .reverse()
          .forEach((x, i) =>
            addMissingPos(x, tree.children.length - i - 1, tree.children)
          );
      }
    }
  }
  return 1;
}

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
        // @ts-ignore
        const id = `___${tree.pos[0]}_${tree.pos[1]}` || `${parentId}_${n}`;

        addTreeEdge(`${parentId}->${id}`, prefix);
        edges.set(`${parentId}->${id}`, `${parentId}->${id}`);

        nodes.set(id, {
          label: tree.value,
          type: "symbol",
          // @ts-ignore
          pos: tree.pos,
        });
        addTreeNode(id, prefix);
      }
    } else {
      const id = `${tree.tag}_${tree.pos[0]}_${tree.pos[1]}`;
      const packedId =
        "__" +
        tree.children
          .map(
            (x) =>
              // @ts-ignore
              `${x.tag || ""}_${x.pos[0]}_${x.pos[1]}`
          )
          .join("_");

      if (parentId !== undefined) {
        addTreeEdge(`${parentId}->${id}`, prefix);
        edges.set(`${parentId}->${id}`, `${parentId}->${id}`);
      }

      if (tree.children.length === 1 && "value" in tree.children[0]) {
        nodes.set(id, {
          label: tree.children[0].value,
          type: "symbol",
          pos: tree.pos,
        });
      } else {
        nodes.set(packedId, {
          label: ``,
          type: "packed",
        });
        addTreeNode(packedId, prefix);

        addTreeEdge(`${id}->${packedId}`, prefix);
        edges.set(`${id}->${packedId}`, `${id}->${packedId}`);

        nodes.set(id, {
          label: tree.tag,
          type: "intermediate",
          pos: tree.pos,
        });
        tree.children.forEach((t, i) => rec(t, prefix, packedId, i));
      }
      addTreeNode(id, prefix);
    }
  }

  trees.forEach((tree) => addMissingPos(tree));
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

  function rec(tree: Tree, prefix: number, parentId?: string, n?: number) {
    if ("value" in tree) {
      if (parentId !== undefined && n !== undefined) {
        const id = `${parentId}_${n}`;
        nodes.set(id, {
          label: tree.value,
          type: "symbol",
          // @ts-ignore
          pos: tree.pos,
        });
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

  trees.forEach((tree) => addMissingPos(tree));
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
