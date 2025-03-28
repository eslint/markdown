/**
 * @fileoverview Tests for MarkdownLanguage
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { MarkdownLanguage } from "../../src/language/markdown-language.js";
import assert from "node:assert";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("MarkdownLanguage", () => {
	describe("parse()", () => {
		it("should parse markdown", () => {
			const language = new MarkdownLanguage();
			const result = language.parse({
				body: "# Hello, World!\n\nHello, World!",
				path: "test.css",
			});

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "root");
			assert.strictEqual(result.ast.children[0].type, "heading");
			assert.strictEqual(result.ast.children[1].type, "paragraph");
		});

		it("should not parse gfm features in commonmark mode", () => {
			const language = new MarkdownLanguage({ mode: "commonmark" });
			const result = language.parse({
				body: "| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |",
				path: "test.md",
			});

			assert.strictEqual(result.ok, true);
			// The table should not be parsed and should be recognized as plain text.
			assert.strictEqual(result.ast.children[0].type, "paragraph");
		});

		it("should parse gfm features in gfm mode", () => {
			const language = new MarkdownLanguage({ mode: "gfm" });
			const result = language.parse({
				body: "| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |",
				path: "test.md",
			});

			assert.strictEqual(result.ok, true);
			// The table should be parsed correctly.
			assert.strictEqual(result.ast.children[0].type === "table", true);
			assert.strictEqual(
				result.ast.children[0].type === "paragraph",
				false,
			);
		});
	});

	describe("createSourceCode()", () => {
		it("should create a MarkdownSourceCode instance for commonmark", () => {
			const language = new MarkdownLanguage({ mode: "commonmark" });
			const file = {
				body: "| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |",
				path: "test.json",
			};
			const parseResult = language.parse(file);
			const sourceCode = language.createSourceCode(file, parseResult);

			assert.strictEqual(
				sourceCode.constructor.name,
				"MarkdownSourceCode",
			);
			assert.strictEqual(sourceCode.ast.type, "root");
			assert.strictEqual(sourceCode.ast.children[0].type, "paragraph");
			assert.strictEqual(
				sourceCode.text,
				"| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |",
			);
		});

		it("should create a MarkdownSourceCode instance for gfm", () => {
			const language = new MarkdownLanguage({ mode: "gfm" });
			const file = {
				body: "| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |",
				path: "test.json",
			};
			const parseResult = language.parse(file);
			const sourceCode = language.createSourceCode(file, parseResult);

			assert.strictEqual(
				sourceCode.constructor.name,
				"MarkdownSourceCode",
			);
			assert.strictEqual(sourceCode.ast.type, "root");
			assert.strictEqual(sourceCode.ast.children[0].type, "table");
			assert.strictEqual(
				sourceCode.text,
				"| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |",
			);
		});
	});
});
