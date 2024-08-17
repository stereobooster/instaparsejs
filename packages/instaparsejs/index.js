export { parser, parserAll } from "./dist/main.js";
import {
  parserPos as parserPosOrig,
  parserPosAll as parserPosAllOrig,
} from "./dist/main.js";

function transformTree(tree, n, siblings) {
  if (tree.value != undefined) {
    if (n !== undefined && siblings !== undefined) {
      let start = null;
      let end = null;
      const prev = siblings[n - 1];
      const next = siblings[n + 1];

      if (prev && prev.pos) start = prev.pos[1];
      if (next && next.pos) end = next.pos[0];
      if (start == null && end != null) start = end - [...tree.value].length;
      if (start != null && end == null) end = start + [...tree.value].length;

      tree.pos = [start, end];
      if (start == null || end == null) return 0;
    }
  } else {
    if (tree.children.length === 1 && tree.children[0].value !== undefined) {
      tree.value = tree.children[0].value;
      delete tree.children;
    } else {
      const checkLength = tree.children
        .map((x, i) => transformTree(x, i, tree.children))
        .reduce((x, y) => x + y, 0);
      if (checkLength !== tree.children.length) {
        [...tree.children]
          .reverse()
          .forEach((x, i) =>
            transformTree(x, tree.children.length - i - 1, tree.children)
          );
      }
    }
  }
  return 1;
}

export function parserPos(grammar) {
  const parser = parserPosOrig(grammar);
  return (text) => {
    const tree = parser(text);
    transformTree(tree);
    return tree;
  };
}

export function parserPosAll(grammar) {
  const parser = parserPosAllOrig(grammar);
  return (text) => {
    const trees = parser(text);
    trees.map(transformTree);
    return trees;
  };
}
