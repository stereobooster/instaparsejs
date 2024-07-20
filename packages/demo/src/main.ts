import "./index.css";

// @ts-expect-error TODO add TS signature
import { parser_all_pos } from "instaparsejs";

const gexp2 = `EXP = E
<E> = <"("> E <")"> / or / and / id
and = E <"&"> E
or = E <"|"> E
<id> = "a"|"b"|"c"`
console.log(JSON.stringify(parser_all_pos(gexp2)("a&b&c"), null, 2));
