export { parser, parserAll } from "./dist/main.js";
import {
  parserPos as parserPosOrig,
  parserPosAll as parserPosAllOrig,
} from "./dist/main.js";

function transformTree(tree, n, siblings, parentPos, total) {
  if (tree.value != undefined) {
    if (n != undefined && siblings != undefined) {
      let start = null;
      let end = null;
      const prev = siblings[n - 1];
      const next = siblings[n + 1];

      if (prev && prev.pos) start = prev.pos[1];
      if (next && next.pos) end = next.pos[0];

      if (start == null && end != null) start = end - [...tree.value].length;

      // unfortunately this may give skewed positions when there are "hidden" nodes in siblings
      // like,  `E <"&"> E`
      if (start == null && n == 0 && parentPos != undefined)
        start = parentPos[0];

      if (start != null && end == null) end = start + [...tree.value].length;

      // unfortunately this may give skewed positions when there are "hidden" nodes in siblings
      // like,  `E <"&"> E`
      if (end == null && n == total - 1 && parentPos != undefined)
        end = parentPos[1];

      tree.pos = [start, end];

      if (start == null || end == null) return 0;
    }
  } else {
    if (tree.children.length === 1 && tree.children[0].value !== undefined) {
      tree.value = tree.children[0].value;
      delete tree.children;
    } else {
      const checkLength = tree.children
        .map((x, i) =>
          transformTree(x, i, tree.children, tree.pos, tree.children.length)
        )
        .reduce((x, y) => x + y, 0);
      if (checkLength !== tree.children.length) {
        [...tree.children]
          .reverse()
          .forEach((x, i) =>
            transformTree(
              x,
              tree.children.length - i - 1,
              tree.children,
              tree.pos,
              tree.children.length
            )
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
