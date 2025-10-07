/**
 * @fileoverview Tests for util.js
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import {
	findOffsets,
	frontmatterHasTitle,
	stripHtmlComments,
} from "../src/util.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("util", () => {
	describe("findOffsets()", () => {
		it("should return correct offsets for a simple string", () => {
			const text = "Hello world!";
			const offset = 6; // 'w' in "world"
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 0, columnOffset: 6 });
		});

		it("should handle line breaks correctly", () => {
			const text = "Hello\nworld!";
			const offset = 6; // 'w' in "world"
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 1, columnOffset: 0 });
		});

		it("should handle Windows-style line endings", () => {
			const text = "Hello\r\nworld!";
			const offset = 7; // 'w' in "world"
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 1, columnOffset: 0 });
		});

		it("should handle offsets at the start of the string", () => {
			const text = "Hello, world!";
			const offset = 0; // Start of the string
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 0, columnOffset: 0 });
		});

		it("should handle offsets at the end of the string", () => {
			const text = "Hello, world!";
			const offset = text.length - 1; // Last character '!'
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, {
				lineOffset: 0,
				columnOffset: text.length - 1,
			});
		});
	});

	describe("frontmatterHasTitle()", () => {
		const pattern = /^title:\s*My Document$/u;

		it("should return false if pattern is null", () => {
			const frontmatter = "title: My Document";
			assert.strictEqual(frontmatterHasTitle(frontmatter, null), false);
		});

		it("should return true when the title matches the pattern", () => {
			const frontmatter = "title: My Document\ndescription: Test";
			assert.strictEqual(frontmatterHasTitle(frontmatter, pattern), true);
		});

		it("should return false when the title does not match the pattern", () => {
			const frontmatter = "title: Another Document\ndescription: Test";
			assert.strictEqual(
				frontmatterHasTitle(frontmatter, pattern),
				false,
			);
		});

		it("should return true if the pattern matches any line in multiline frontmatter", () => {
			const frontmatter = [
				"description: Test",
				"title: My Document",
				"author: xbinaryx",
			].join("\n");
			assert.strictEqual(frontmatterHasTitle(frontmatter, pattern), true);
		});

		it("should return false for empty frontmatter", () => {
			const frontmatter = "";
			assert.strictEqual(
				frontmatterHasTitle(frontmatter, pattern),
				false,
			);
		});
	});

	describe("stripHtmlComments()", () => {
		it("should replace single-line HTML comments with spaces", () => {
			const input = "Hello<!--1234567-->World";
			const result = stripHtmlComments(input);
			assert.strictEqual(input.length, result.length);
			assert.strictEqual(result, `Hello${" ".repeat(14)}World`);
		});

		it("should replace multi-line HTML comments with spaces", () => {
			const input = "Hello<!--\r\nmulti\nline\rcomment\r\n-->World";
			const result = stripHtmlComments(input);
			assert.strictEqual(input.length, result.length);
			assert.strictEqual(
				result,
				`Hello${" ".repeat(4)}\r\n${" ".repeat(5)}\n${" ".repeat(4)}\r${" ".repeat(7)}\r\n${" ".repeat(3)}World`,
			);
		});

		it("should handle surrogate pairs like emojis correctly", () => {
			// NOTE: 👍's length is 2, 🚀's length is 2, 🙇‍♂️'s length is 5.
			const input = "Hello<!--👍🚀🙇‍♂️-->World";
			const result = stripHtmlComments(input);
			assert.strictEqual(input.length, result.length);
			assert.strictEqual(result, `Hello${" ".repeat(16)}World`);
		});
	});
});
