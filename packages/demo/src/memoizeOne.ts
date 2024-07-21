export function memoizeOne<I, O>(fn: (x: I) => O) {
  let arg: I;
  let result: O;
  return (x: I): O => {
    if (x !== arg) {
      result = fn(x);
      arg = x;
    }
    return result;
  };
}
