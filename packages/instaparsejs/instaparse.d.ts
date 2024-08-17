declare module "instaparse" {
  export type Tree =
    | {
        tag: string;
        pos: [number, number];
        value?: undefined;
        children: Tree[];
      }
    | {
        tag: string;
        pos: [number, number];
        value: string;
        children?: undefined;
      };

  export type Sexp = [string, Sexp[]] | string[];

  export function parserPos(src: string): (src: string) => Tree;
  export function parserPosAll(src: string): (src: string) => Tree[];
  export function parser(src: string): (src: string) => Sexp;
  export function parserAll(src: string): (src: string) => Sexp;
}
