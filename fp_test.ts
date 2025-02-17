import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.84.0/testing/asserts.ts";
import { c, p } from "https://deno.land/x/copb@v1.0.1/mod.ts";
import * as mod from "./mod.ts";
import * as fp from "./fp.ts";

Deno.test("All functions are available in functional programming version", () => {
  assertArrayIncludes(["curried", ...Object.keys(fp)], Object.keys(mod));
});

Deno.test("With copb", () => {
  const pipeline = c(
    p(fp.map<number>((x) => x * 100)) // Only needed type annotation, the rest is inferred.
    (fp.map(Math.floor))(fp.filter((x) => x % 3 === 0))(fp.reduce(
      (str, x) => str + x,
      "",
    ))(Number),
  );

  assertEquals(
    pipeline([
      0.4961166694959176,
      0.21540769751705935,
      0.7146328682274266,
      0.5392881687008804,
      0.746080578311838,
      0.6354297379184395,
    ]),
    2163,
  );
});
