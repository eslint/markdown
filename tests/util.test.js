/**
 * @fileoverview Tests for util.js
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import { findOffsets, frontmatterHasTitle } from "../src/util.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("util", () => {
	describe("findOffsets()", () => {
		// TODO
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
});
