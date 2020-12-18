export const createCapture = <A, B, C>(
  resolveNext: (...args: any) => A,
  resolveLast: (next: A | B | C) => B,
  initial?: C
) => {
  let next: A | C = initial as C;

  return (...args: any) => {
    const last = resolveLast(next);

    next = resolveNext(...args);

    return [last, next];
  };
};
