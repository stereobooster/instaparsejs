# instaparsejs

What if context-free grammars were as easy to use as regular expressions?

[instaparse](https://github.com/Engelberg/instaparse) compiled to JavaScript (ESM).

## Usage

```sh
npm add instaparsejs
```

```js
import { parser } from "instaparsejs";

const grammar = `S = AB*
AB = A B
A = 'a'+
B = 'b'+`;
const text = `aaaaabbbaaaabb`;

console.log(parser(grammar)(text));
```
