import { parser_all, parser_all_pos } from "../dist/main.js";

// const tt1 = `aaaaabbbaaaabb`;
// const gg1 = `S = AB*
// AB = A B
// A = 'a'+
// B = 'b'+`;
// console.log(parser_all(gg1)(tt1)[0]);

// const gg2 = `S = ('a'+ 'b'+)*`;
// console.log(parser_all(gg2)(tt1));

// const gg3 = `S = AB*
// <AB> = A B
// <A> = 'a'+
// <B> = 'b'+`;
// console.log(parser_all(gg3)(tt1));

// const gg4 = `S = AB*
// AB = A B
// A = #'a+'
// B = #'b+'`;
// console.log(parser_all(gg4)(tt1));

// const gg5 = `sentence = token (<whitespace> token)*
// <token> = word | number
// whitespace = #'\\s+'
// word = #'[a-zA-Z]+'
// number = #'[0-9]+'`;

// console.log(parser_all(gg5)("abc 123 def"));

// const gg5 = `sentence = token (<whitespace> token)*
// <token> = word | number
// whitespace = #'\\s+'
// word = #'[a-zA-Z]+'
// number = #'[0-9]+'`;

// console.log(parser_all(gg5)("abc 123 def"));

const texp = "a|b&c"
// const gexp = `E = E "&" E | E "|" E | id
// <id> = "a"|"b"|"c"`
// console.log(JSON.stringify(parser_all(gexp)(texp), null, 2));

// const gexp1 = `E = E "&" E / E "|" E / id
// <id> = "a"|"b"|"c"`
// console.log(JSON.stringify(parser_all(gexp1)(texp), null, 2));

const gexp2 = `EXP = E
<E> = <"("> E <")"> / or / and / id
and = E <"&"> E
or = E <"|"> E
<id> = "a"|"b"|"c"`
// console.log(JSON.stringify(parser_all(gexp2)(texp), null, 2));
// console.log(JSON.stringify(parser_all(gexp2)("a&b&c"), null, 2));
console.log(JSON.stringify(parser_all_pos(gexp2)("a&b&c"), null, 2));
// console.log(JSON.stringify(parser_all(gexp2)("a&(b&c)"), null, 2));

// const ggcs = `
// S = &(A !'b') 'a'* B !''
// A = 'a' A 'b' / ''
// B = 'b' B 'c' / ''`

// const ggcs = `S = &(A 'c') 'a'* B / ''
// A = 'a' A 'b' / ''
// <B> = 'b' B 'c' / ''`

// const tcs1 = 'aabbcc'
// const tcs2 = 'abbcc'
// const tcs3 = 'aaabbcc'
// const tcs4 = 'aabbc'
// const tcs5 = 'aabbccc'
// const tcs6 = 'aabcc'
// const tcs7 = 'aabbbcc'
// const tcs8 = ''
// console.log(parser_all(ggcs)(tcs1));
// console.log(parser_all(ggcs)(tcs2));
// console.log(parser_all(ggcs)(tcs3));
// console.log(parser_all(ggcs)(tcs4));
// console.log(parser_all(ggcs)(tcs5));
// console.log(parser_all(ggcs)(tcs6));
// console.log(parser_all(ggcs)(tcs7));
// console.log(parser_all(ggcs)(tcs8));

// const g1 = `S = 'a'*`;
// const t1 = `aaaaa`;
// console.log(parser_all(g1)(t1));

// const g2 = `S = 'a' S | ''`;
// console.log(parser_all(g2)(t1));

// const g3 = `S = S 'a' | ''`;
// console.log(parser_all(g3)(t1));

// const gj = `
// A1 = (&(A1 A3) (A2 A2)) | 'a'
// <A3> = (&(A1 A2) (A6 A6)) | ('a' 'a' 'a')
// <A2> = (&(A1 A1) (A2 A6)) | ('a' 'a')
// <A6> = &(A1 A2) (A3 A3)`;

// const tj1 = `a`;
// const tj2 = `aa`;
// const tj3 = `aaa`;
// const tj4 = `aaaa`;
// const tj5 = `aaaaa`;
// const tj6 = `aaaaaa`;
// const tj7 = `aaaaaaa`;
// const tj8 = `aaaaaaaa`;
// const tj9 = `aaaaaaaa`;

// console.log(parser_all(gj)(tj1));
// console.log(parser_all(gj)(tj2));
// console.log(parser_all(gj)(tj3));
// console.log(parser_all(gj)(tj4));
// console.log(parser_all(gj)(tj5));
// console.log(parser_all(gj)(tj6));
// console.log(parser_all(gj)(tj7));
// console.log(parser_all(gj)(tj8));
// console.log(parser_all(gj)(tj9));
