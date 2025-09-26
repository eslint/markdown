/**
 * @fileoverview Tests for util.js
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import { frontmatterHasTitle } from "../src/util.js";

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
