import { parser } from "../dist/main.js";

const tt1 = `aaaaabbbaaaabb`;
const gg1 = `S = AB*
AB = A B
A = 'a'+
B = 'b'+`;
console.log(parser(gg1)(tt1));

const gg2 = `S = ('a'+ 'b'+)*`;
console.log(parser(gg2)(tt1));

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
// console.log(parser(ggcs)(tcs1));
// console.log(parser(ggcs)(tcs2));
// console.log(parser(ggcs)(tcs3));
// console.log(parser(ggcs)(tcs4));
// console.log(parser(ggcs)(tcs5));
// console.log(parser(ggcs)(tcs6));
// console.log(parser(ggcs)(tcs7));
// console.log(parser(ggcs)(tcs8));

// const g1 = `S = 'a'*`;
// const t1 = `aaaaa`;
// console.log(parser(g1)(t1));

// const g2 = `S = 'a' S | ''`;
// console.log(parser(g2)(t1));

// const g3 = `S = S 'a' | ''`;
// console.log(parser(g3)(t1));

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

// console.log(parser(gj)(tj1));
// console.log(parser(gj)(tj2));
// console.log(parser(gj)(tj3));
// console.log(parser(gj)(tj4));
// console.log(parser(gj)(tj5));
// console.log(parser(gj)(tj6));
// console.log(parser(gj)(tj7));
// console.log(parser(gj)(tj8));
// console.log(parser(gj)(tj9));
