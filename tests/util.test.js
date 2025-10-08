/**
 * @fileoverview Tests for util.js
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import { frontmatterHasTitle, stripHtmlComments } from "../src/util.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("util", () => {
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

		it("should return true if the pattern matches any line in multiline frontmatter (CRLF)", () => {
			const frontmatter = [
				"description: Test",
				"title: My Document",
				"author: lumirlumir",
			].join("\r\n");
			assert.strictEqual(frontmatterHasTitle(frontmatter, pattern), true);
		});

		it("should return true if the pattern matches any line in multiline frontmatter (CR)", () => {
			const frontmatter = [
				"description: Test",
				"title: My Document",
				"author: lumirlumir",
			].join("\r");
			assert.strictEqual(frontmatterHasTitle(frontmatter, pattern), true);
		});

		it("should return true if the pattern matches any line in multiline frontmatter (LF)", () => {
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
