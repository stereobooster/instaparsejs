import { Graphviz } from "@hpcc-js/wasm";
import { optimize, type Config as SvgoConfig } from "svgo";

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

export function renderDot(dot: string) {
  return optimize(graphviz.dot(dot), svgoConfig).data;
}
