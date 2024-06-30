import { parser } from "../dist/main.js";

const grammar = `S = AB*
AB = A B
A = 'a'+
B = 'b'+`;
const text = `aaaaabbbaaaabb`;

console.log(parser(grammar)(text));
