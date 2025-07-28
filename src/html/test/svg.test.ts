import { parse, renderSync } from "../src/index.ts";
import { describe, expect, it } from "vitest";

describe("svg", () => {
	it("renderSync as self-closing", async () => {
		const input = `<svg><path d="0 0 0" /></svg>`;
		const output = renderSync(parse(input));
		expect(output).toEqual(input);
	});
});
