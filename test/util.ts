export function createPartialDone(count: number, done: (err?: Error) => void) {
  let i = 0;
  return () => {
    if (++i === count) {
      done();
    } else if (i > count) {
      done(new Error(`partialDone() called too many times: ${i} > ${count}`));
    }
  };
}
