import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { comlink } from "vite-plugin-comlink";

export default defineConfig({
  // @ts-expect-error xxx
  plugins: [monacoEditorPlugin.default({}), comlink()],
  build: {
    target: "ES2022",
  },
});
