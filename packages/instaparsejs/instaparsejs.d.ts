declare module 'instaparsejs' {

  export type Tree =
    | { tag: string; pos: [number, number]; children: Tree[] }
    | { value: string };

  export type Sexp = [string, Sexp[]] | string[] 

  export function parserPos(src: string): (src: string) => Tree;
  export function parserPosAll(src: string): (src: string) => Tree[];
  export function parser(src: string): (src: string) => Sexp;
  export function parserAll(src: string): (src: string) => Sexp;
}