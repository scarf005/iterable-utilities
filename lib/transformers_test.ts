import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.84.0/testing/asserts.ts";
import * as transformers from "./transformers.ts";
import * as create from "./generators.ts";
import { stripIterable } from "./internal/util.ts";

Deno.test("take", () => {
  const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const testIter = testArray[Symbol.iterator]();

  assertEquals(testArray.slice(0, 5), [...transformers.take(testIter, 5)]);
});

Deno.test("map", () => {
  const id: (x: number) => number = (x) => x;

  const testIter = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const testIterClone = transformers.map(testIter, id);

  assertEquals([...testIter], [...testIterClone]);
});

Deno.test("filter", () => {
  const even = (x: number) => x % 2 === 0;

  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const num of transformers.filter(numbers, even)) {
    assertEquals(even(num), true);
  }
});

Deno.test("cut", () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const cutNumbers = [...transformers.until(numbers, (n) => n === 5)];
  const cutNumbersExclusive = [
    ...transformers.until(numbers, (n) => n === 5, false),
  ];

  assertEquals(cutNumbers[cutNumbers.length - 1], 5);
  assertEquals(cutNumbersExclusive[cutNumbersExclusive.length - 1], 4);
});

Deno.test("indexedPairs", () => {
  const numbers = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  [...transformers.indexedPairs(numbers)].forEach(([i, v]) => {
    assertEquals(i + v, 9);
  });
});

Deno.test("chunkify", () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  assertThrows(() => {
    transformers.chunkify(numbers, 0);
  });
  assertThrows(() => {
    transformers.chunkify(numbers, -5);
  });

  for (const [x, y] of transformers.chunkify(numbers, 2)) {
    assertEquals(x + y, 2 * x + 1);
  }

  for (const [x, y] of transformers.chunkify(stripIterable(numbers), 2)) {
    assertEquals(x + y, 2 * x + 1);
  }
});

Deno.test("rememember", () => {
  const memIterable = transformers.remember(create.randomNumbers());
  const numbers5 = transformers.take(memIterable, 5);
  const numbers10 = transformers.take(memIterable, 10);

  assertEquals([...transformers.take(numbers10, 5)], [...numbers5]);
});

Deno.test("flat", () => {
  const unflatArray1 = [[1, 2], 3, [4, 5, 6]];
  assertEquals([...transformers.flat(unflatArray1)], unflatArray1.flat());

  const unflatArray2 = [[1, 2], 3, [[4, 5], 6]];
  assertEquals([...transformers.flat(unflatArray2, 2)], unflatArray2.flat(2));
});

Deno.test("completeFlat", () => {
  const unflatArray = [
    [[[[[[[[[[[[[[[[[[1]]]]]]]], 2]]]]]]]]], 3, 4],
    5,
    6,
    7,
    8,
    9,
  ];
  assertEquals([...transformers.completeFlat(unflatArray)], [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
  ]);
});

Deno.test("fuse", () => {
  const unfusedIter = function* () {
    yield 0;
    yield 1;
    yield 2;
    return 3;
  }();
  const fusedIter = transformers.fuse(unfusedIter)[Symbol.iterator]();

  fusedIter.next();
  fusedIter.next();
  fusedIter.next();
  assertEquals(fusedIter.next().value, undefined);
});

Deno.test("fuse & create.fromResults", () => {
  const unfusedIter = create.fromResults([
    { value: 0, done: false },
    { value: 1, done: false },
    { value: 2, done: true },
    { value: 3, done: false },
  ]);
  const fusedIter = transformers.fuse(unfusedIter)[Symbol.iterator]();
  fusedIter.next();
  fusedIter.next();
  assertEquals(fusedIter.next().value, undefined);
  assertEquals(fusedIter.next().value, undefined);
});

Deno.test("peekable", () => {
  const peekableIter1 = transformers.peekable([0, 1, 2, 3]);
  assertEquals(peekableIter1.next().value, 0);
  assertEquals(peekableIter1.peek().value, 1);
  assertEquals(peekableIter1.next().value, 1);
  assertEquals(peekableIter1.peek().value, 2);
  assertEquals(peekableIter1.peek().value, 2);
  assertEquals(peekableIter1.peek().value, 2);
  assertEquals(peekableIter1.next().value, 2);
  assertEquals(peekableIter1.next().value, 3);
  assertEquals(peekableIter1.peek().value, undefined);
  assertEquals(peekableIter1.peek().done, true);
  assertEquals(peekableIter1.next().done, true);

  const peekableIter2 = transformers.peekable([0, 1, 2, 3]);
  for (const n of peekableIter2) {
    assert(n + 1 === peekableIter2.peek().value || peekableIter2.peek().done);
  }
});
