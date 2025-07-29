import { querySelector, querySelectorAll } from "../src";
import { parse, renderSync } from "../src";
import { describe, expect, it, test } from "vitest";

test("sanity", () => {
	expect(querySelector).toBeTypeOf("function");
	expect(querySelectorAll).toBeTypeOf("function");
});

describe("type selector", () => {
	it("type", async () => {
		const input = `<h1>Hello world!</h1>`;
		const output = renderSync(querySelector(parse(input), "h1"));
		expect(output).toEqual(input);
	});
});

/*

describe("id selector", () => {
	it("id", async () => {
		const input = `<h1 id="foo">Hello world!</h1>`;
		const output = renderSync(querySelectorAll(parse(input), "#foo")[0]);
		expect(output).toEqual(input);
	});
});

*/
