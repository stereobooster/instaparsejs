# Playground

- [x] maybe use WebWorker for parser
  - need to add timeout, to terminat long running processes
  - https://github.com/caiogondim/fast-memoize.js
- [ ] fix SPPF bug
  - bug can be observed [here](https://instaparsejs.stereobooster.com/?g=EXP+%3D+E%0A%3CE%3E+%3D+%3C%22%28%22%3E+E+%3C%22%29%22%3E+%2F+mul+%2F+%28add+%7C+sub%29+%2F+num%0Amul+%3D+E+%3C%22*%22%3E+E%0Aadd+%3D+E+%3C%22%2B%22%3E+E%0Asub+%3D+E+%3C%22-%22%3E+E%0Anum+%3D+%23%22%5Cd%2B%22&t=1%2B2*3%2B4&sppf=1&all=1&ranges=&highlight=3)
- [ ] dark mode
- [ ] embeddable version
  - show / hide configuration panel
  - do not use monaco?
- [x] editor with EBNF highlighting
  - https://langium.org/docs/learn/minilogo/langium_and_monaco/
  - https://shiki.matsu.io/packages/monaco
  - https://github.com/zikaari/monaco-editor-textmate
  - https://github.com/vallentin/vscode-bnf/blob/master/syntaxes/bnf.tmLanguage.json
  - maybe codemirror is lighter?
- [ ] dropdown with predefined examples (less priority if we can put config in URL)
- [ ] maybe use framework
  - https://docs.solidjs.com/solid-router/reference/primitives/use-search-params
  - https://park-ui.com/solid/docs/overview/introduction
  - https://ui.shadcn.com/

For local development use:

```
"instaparse": "workspace:*",
```
