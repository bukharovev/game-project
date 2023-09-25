type Constructor<T = unknown> = new (...arguments_: unknown[]) => T;

export function assert(expression: unknown, error: Constructor) {
  if (!expression) {
    throw new error();
  }
}

assert.not = (expression: unknown, error: Constructor) =>
  assert(!expression, error);
