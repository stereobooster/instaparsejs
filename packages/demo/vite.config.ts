import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  // @ts-expect-error xxx
  plugins: [monacoEditorPlugin.default({})],
  build: {
    target: "ES2022",
  },
});
