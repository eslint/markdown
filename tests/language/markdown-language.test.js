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
	describe("validateLanguageOptions()", () => {
		it("should throw an error if `frontmatter` is not `false`, `'yaml'`, or `'toml'`", () => {
			const language = new MarkdownLanguage();

			assert.throws(() => {
				language.validateLanguageOptions({ frontmatter: "invalid" });
			}, /Invalid language option value/u);
			assert.throws(() => {
				language.validateLanguageOptions({ frontmatter: 123 });
			}, /Invalid language option value/u);
		});

		it("should not throw an error when `frontmatter` is not provided", () => {
			const language = new MarkdownLanguage();

			assert.doesNotThrow(() => {
				language.validateLanguageOptions();
			});
			assert.doesNotThrow(() => {
				language.validateLanguageOptions({});
			});
		});

		it("should not throw an error when `frontmatter` is not provided and other keys are present", () => {
			const language = new MarkdownLanguage();
			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ foo: "bar" });
			});
		});

		it("should not throw an error when `frontmatter` has a correct value in commonmark mode", () => {
			const language = new MarkdownLanguage({ mode: "commonmark" });

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ frontmatter: false });
			});
			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ frontmatter: "yaml" });
			});
			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ frontmatter: "toml" });
			});
		});

		it("should not throw an error when `frontmatter` has a correct value in gfm mode", () => {
			const language = new MarkdownLanguage({ mode: "gfm" });

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ frontmatter: false });
			});
			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ frontmatter: "yaml" });
			});
			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ frontmatter: "toml" });
			});
		});
	});

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
			assert.strictEqual(result.ast.children[0].type, "table");
		});

		it("should not parse frontmatter by default", () => {
			const language = new MarkdownLanguage();
			const result = language.parse({
				body: "---\ntitle: Hello\n---\n\n# Hello, World!\n\nHello, World!",
				path: "test.md",
			});

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "root");
			assert.strictEqual(result.ast.children[0].type, "thematicBreak");
			assert.strictEqual(result.ast.children[1].type, "heading");
			assert.strictEqual(result.ast.children[2].type, "heading");
			assert.strictEqual(result.ast.children[3].type, "paragraph");
		});

		it("should parse YAML frontmatter in commonmark mode when `frontmatter: 'yaml'` is set", () => {
			const language = new MarkdownLanguage({ mode: "commonmark" });
			const result = language.parse(
				{
					body: "---\ntitle: Hello\n---\n\n# Hello, World!\n\nHello, World!",
					path: "test.md",
				},
				{
					languageOptions: {
						frontmatter: "yaml",
					},
				},
			);

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "root");
			assert.strictEqual(result.ast.children[0].type, "yaml");
			assert.strictEqual(result.ast.children[0].value, "title: Hello");
			assert.strictEqual(result.ast.children[1].type, "heading");
			assert.strictEqual(result.ast.children[2].type, "paragraph");
		});

		it("should parse YAML frontmatter in gfm mode when `frontmatter: 'yaml'` is set", () => {
			const language = new MarkdownLanguage({ mode: "gfm" });
			const result = language.parse(
				{
					body: "---\ntitle: Hello\n---\n\n# Hello, World!\n\nHello, World!",
					path: "test.md",
				},
				{
					languageOptions: {
						frontmatter: "yaml",
					},
				},
			);

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "root");
			assert.strictEqual(result.ast.children[0].type, "yaml");
			assert.strictEqual(result.ast.children[0].value, "title: Hello");
			assert.strictEqual(result.ast.children[1].type, "heading");
			assert.strictEqual(result.ast.children[2].type, "paragraph");
		});

		it("should parse TOML frontmatter in commonmark mode when `frontmatter: 'toml'` is set", () => {
			const language = new MarkdownLanguage({ mode: "commonmark" });
			const result = language.parse(
				{
					body: "+++\ntitle = 'Hello'\n+++\n\n# Hello, World!\n\nHello, World!",
					path: "test.md",
				},
				{
					languageOptions: {
						frontmatter: "toml",
					},
				},
			);

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "root");
			assert.strictEqual(result.ast.children[0].type, "toml");
			assert.strictEqual(result.ast.children[0].value, "title = 'Hello'");
			assert.strictEqual(result.ast.children[1].type, "heading");
			assert.strictEqual(result.ast.children[2].type, "paragraph");
		});

		it("should parse TOML frontmatter in gfm mode when `frontmatter: 'toml'` is set", () => {
			const language = new MarkdownLanguage({ mode: "gfm" });
			const result = language.parse(
				{
					body: "+++\ntitle = 'Hello'\n+++\n\n# Hello, World!\n\nHello, World!",
					path: "test.md",
				},
				{
					languageOptions: {
						frontmatter: "toml",
					},
				},
			);

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "root");
			assert.strictEqual(result.ast.children[0].type, "toml");
			assert.strictEqual(result.ast.children[0].value, "title = 'Hello'");
			assert.strictEqual(result.ast.children[1].type, "heading");
			assert.strictEqual(result.ast.children[2].type, "paragraph");
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
