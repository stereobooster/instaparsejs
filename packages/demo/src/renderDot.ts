import { Graphviz } from "@hpcc-js/wasm";
import { optimize, type Config as SvgoConfig } from "svgo";
import { memoizeOne } from "./memoizeOne";

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

function _renderDot(dot: string) {
  return optimize(graphviz.dot(dot), svgoConfig).data;
}

export const renderDot = memoizeOne(_renderDot);
