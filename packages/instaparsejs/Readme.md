# instaparsejs

What if context-free grammars were as easy to use as regular expressions?

[instaparse](https://github.com/Engelberg/instaparse) compiled to JavaScript (ESM).

## Usage

```sh
npm add instaparse
```

```js
import { parser } from "instaparse";

const grammar = `S = AB*
AB = A B
A = 'a'+
B = 'b'+`;
const text = `aaaaabbbaaaabb`;

console.log(parser(grammar)(text));
```

## TODO

- [ ] publish `instaparsejs` package as well
- [ ] single node with value case
- [ ] how to show error if parsing failed?
- [ ] expose `insta/add-line-and-column-info-to-metadata`
- [ ] expose options for `insta/parser`
  ```
  Optional keyword arguments:
  :input-format :ebnf
  or
  :input-format :abnf

  :output-format :enlive
  or
  :output-format :hiccup

  :start :keyword (where :keyword is name of starting production rule)

  :string-ci true (treat all string literals as case insensitive)

  :allow-namespaced-nts true (allow namespaced non-terminals in parser specification;
                              parser's output will use corresponding namespaced keywords)

  :auto-whitespace (:standard or :comma)
  or
  :auto-whitespace custom-whitespace-parser
  ```
- [ ] expose [combinators](https://github.com/Engelberg/instaparse#combinators) (maybe)
- [ ] expose `insta/transform` (maybe)
