import { IterableCircular, IterablePredicateCallback } from "./types.ts";

/**
 * @link map | `map`} callback.
 * @typeParam T - See {@link map}
 * @typeParam U - See {@link map}
 */
export interface MapCallback<T, U> {
  /**
   * {@link map | `map`} callback.
   * @callback MapCallback
   * @param item - The current item to be mapped.
   * @param index - The index of the item.
   * @param it - The iterable.
   * @returns The mapped value
   */
  (item: T, index: number, it: Iterable<T>): U;
}

/**
 * Lazily calls a defined callback function for each element of an iterable, and
 * returns a new iterable of the results.
 * @param it - The iterable being mapped.
 * @param {MapCallback} f - A function that accepts up to three arguments. The
 * map function calls `f` function one time for each item in the iterable.
 * @typeParam T - Type of items in `it`.
 * @typeParam U - Return type of `f`.
 * @returns An iterable of `f` applied to items of `it`.
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const naturals = iter.create.increments(1);
 * const reciprocals = iter.map(naturals, n => n**-1);
 * const iterator = reciprocals[Symbol.iterator]();
 *
 * console.log(iterator.next().value); // -> 1
 * console.log(iterator.next().value); // -> 0.5
 * console.log(iterator.next().value); // -> 0.3333333333333333
 * console.log(iterator.next().value); // -> 0.25
 * console.log(iterator.next().value); // -> 0.2
 * ```
 */
export function map<T, U = T>(
  it: Iterable<T>,
  f: MapCallback<T, U>,
): IterableCircular<U> {
  return {
    *[Symbol.iterator]() {
      let index = 0;
      for (const item of it) yield f(item, index++, it);
    },
  };
}

/**
 * Returns a new iterable containing the first `n` items of `it`.
 * @param it - The iterable being taken from.
 * @param n - The number of items to take.
 * @typeParam T - The type of items in both `it` and the returned iterable.
 * @returns A new iterable of `it` which terminates after `n` items.
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const naturals = iter.create.increments(1);
 * const first6 = iter.take(naturals, 6);
 *
 * for (const num of first6) {
 *   console.log(num);
 * }
 *
 * // -> 1
 * // -> 2
 * // -> 3
 * // -> 4
 * // -> 5
 * // -> 6
 * ```
 */
export function take<T>(it: Iterable<T>, n: number): IterableCircular<T> {
  return {
    *[Symbol.iterator]() {
      const iterator = it[Symbol.iterator]();
      for (let i = 0; i < n; i++) yield iterator.next().value;
    },
  };
}

/**
 * Returns a new iterable which yields until `f` returns true.
 * true.
 * @param it - The iterable being cut.
 * @param {IterablePredicateCallback} f - A function that accepts up to three
 * arguments. The cut function calls `f` one time for each item in the iterable.
 * @param includeLast - Whether the item for which `f` returns true should be
 * included.
 * @typeParam T - The type of items in both `it` and the returned iterable.
 * @returns A new iterables of `it` which terminates
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const naturals = iter.create.increments(1);
 * const numbers = iter.until(naturals, (n) => n ** 2 > 54);
 *
 * for (const num of numbers) {
 *   console.log(num);
 * }
 *
 * // -> 1
 * // -> 2
 * // -> 3
 * // -> 4
 * // -> 5
 * // -> 6
 * // -> 7
 * // -> 8
 * ```
 */
export function until<T>(
  it: Iterable<T>,
  f: IterablePredicateCallback<T>,
  includeLast = true,
): IterableCircular<T> {
  return {
    *[Symbol.iterator]() {
      let index = 0;
      for (const item of it) {
        const done = f(item, index++, it);
        if (done) {
          if (includeLast) {
            yield item;
          }
          break;
        }
        yield item;
      }
    },
  };
}

/**
 * Returns the items of an iterable that meet the condition specified in a
 * callback function.
 * @param it - The iterable being filtered
 * @param {IterablePredicateCallback} predicate - A function that accepts up to
 * three arguments. The filter function calls the predicate function one time for
 * each item in the iterable.
 * @typeParam T - The type of items in `it`.
 * @returns A new iterable
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const naturals = iter.create.increments(1);
 * const odds = iter.filter(naturals, (n) => n % 2 === 1);
 * const iterator = odds[Symbol.iterator]();
 *
 * console.log(iterator.next().value); // -> 1
 * console.log(iterator.next().value); // -> 3
 * console.log(iterator.next().value); // -> 5
 * console.log(iterator.next().value); // -> 7
 * console.log(iterator.next().value); // -> 9
 * console.log(iterator.next().value); // -> 11
 * ```
 */
export function filter<T>(
  it: Iterable<T>,
  predicate: IterablePredicateCallback<T>,
): IterableCircular<T> {
  return {
    *[Symbol.iterator](): IterableIterator<T> {
      let index = 0;
      for (const item of it) {
        if (predicate(item, index++, it)) {
          yield item;
        }
      }
    },
  };
}

/**
 * Converts an iterable into a series of pairs of indices and values. Similar to
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries | `Array.prototype.entries`}
 * or rust's `iter.enumerate()`.
 * @param it - The iterable being indexed.
 * @typeParam T - The type of items in `it`.
 * @returns An iterable over pairs of indices and the items in `it`.
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const negatives = iter.create.increments(-1, -1);
 * const indexedNegatives = iter.indexedPairs(negatives);
 * const iterator = indexedNegatives[Symbol.iterator]();
 *
 * console.log(iterator.next().value); // -> [ 0, -1 ]
 * console.log(iterator.next().value); // -> [ 1, -2 ]
 * console.log(iterator.next().value); // -> [ 2, -3 ]
 * console.log(iterator.next().value); // -> [ 3, -4 ]
 * console.log(iterator.next().value); // -> [ 4, -5 ]
 * console.log(iterator.next().value); // -> [ 5, -6 ]
 * ```
 */
export function indexedPairs<T>(
  it: Iterable<T>,
): IterableCircular<[number, T]> {
  return {
    *[Symbol.iterator]() {
      let index = 0;
      for (const item of it) {
        yield [index++, item];
      }
    },
  };
}

/**
 * Splits an iterable into evenly sized chunks. See
 * {@link https://ghub.io/@sindresorhus/chunkify | @sindresorhus/chunkify }
 * @param it - The iterable being chunkified.
 * @param chunkSize - The size of each chunk.
 * @typeParam T - The type of items in `it`.
 * @returns A new iterable over chunk arrays.
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const naturals = iter.create.increments(-1, -1);
 * const chunks = iter.chunkify(naturals, 3);
 * const iterator = chunks[Symbol.iterator]();
 *
 * console.log(iterator.next().value); // -> [ -1, -2, -3 ]
 * console.log(iterator.next().value); // -> [ -4, -5, -6 ]
 * console.log(iterator.next().value); // -> [ -7, -8, -9 ]
 * console.log(iterator.next().value); // -> [ -10, -11, -12 ]
 * console.log(iterator.next().value); // -> [ -13, -14, -15 ]
 * console.log(iterator.next().value); // -> [ -16, -17, -18 ]
 * ```
 */
export function chunkify<T>(
  it: Iterable<T>,
  chunkSize: number,
): IterableCircular<T[]> {
  if (!(Number.isSafeInteger(chunkSize) && chunkSize > 0)) {
    throw new RangeError(
      `Expected \`chunkSize\` to be an integer from 1 and up, got \`${chunkSize}\``,
    );
  }

  return {
    *[Symbol.iterator]() {
      if (Array.isArray(it)) {
        for (let index = 0; index < it.length; index += chunkSize) {
          yield it.slice(index, index + chunkSize);
          return;
        }
      }

      let chunk = [];

      for (const value of it) {
        chunk.push(value);

        if (chunk.length === chunkSize) {
          yield chunk;
          chunk = [];
        }
      }

      if (chunk.length > 0) {
        yield chunk;
      }
    },
  };
}

/**
 * Makes an iterable remember. Each time it is iterated over it will yield the
 * same results.
 * @param it - The iterable to remember
 * @typeParam T - The type of items in `it`.
 * @returns A new iterable which remembers.
 * @example
 * ```ts
 * import * as iter from "https://deno.land/x/iter/mod.ts";
 *
 * const permRandomNumbers = iter.rememeber(iter.create.randomNumbers());
 * const iterator1 = permRandomNumbers[Symbol.iterator]();
 * const iterator2 = permRandomNumbers[Symbol.iterator]();
 *
 * console.log(iterator1.next().value); // ~> 0.1363627616298313
 * console.log(iterator1.next().value); // ~> 0.20839783736895812
 * console.log(iterator1.next().value); // ~> 0.30540840030529215
 *
 * console.log(iterator2.next().value); // ~> 0.1363627616298313
 * console.log(iterator2.next().value); // ~> 0.20839783736895812
 * console.log(iterator2.next().value); // ~> 0.30540840030529215
 * ```
 */
export function rememeber<T>(it: Iterable<T>): IterableCircular<T> {
  const history = new Array<T>();
  const iterator = it[Symbol.iterator]();
  let done = false;

  return {
    *[Symbol.iterator]() {
      yield* history;
      while (!done) {
        const next = iterator.next();
        done = next.done || false;
        history.push(next.value);
        if (done) {
          return next.value;
        }
        yield next.value;
      }
    },
  };
}
