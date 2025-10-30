/**
 * @fileoverview Tests for the package index's exports.
 * @author Steve Dodier-Lazaro
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as exports from "../../src/index.js";
import { MarkdownLanguage } from "../../src/language/markdown-language.js";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rulesDir = path.resolve(dirname, "../../src/rules");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Package exports", () => {
	it("has the ESLint plugin as a default export", () => {
		assert.deepStrictEqual(Object.keys(exports.default), [
			"meta",
			"processors",
			"languages",
			"rules",
			"configs",
		]);
	});

	it("has all available rules exported in the ESLint plugin", async () => {
		const allRules = (await fs.readdir(rulesDir))
			.filter(name => name.endsWith(".js"))
			.map(name => name.slice(0, -".js".length))
			.sort();
		const exportedRules = exports.default.rules;

		assert.deepStrictEqual(
			Object.keys(exportedRules).sort(),
			allRules,
			"Expected all rules to be exported in the ESLint plugin (`plugin.rules` in `src/index.js`)",
		);

		for (const [ruleName, rule] of Object.entries(exportedRules)) {
			assert.strictEqual(
				rule,
				(
					await import(
						pathToFileURL(path.resolve(rulesDir, `${ruleName}.js`))
					)
				).default,
				`Expected ${ruleName}.js to be exported under key "${ruleName}" in the ESLint plugin (\`plugin.rules\` in \`src/index.js\`)`,
			);
		}
	});

	it("has a markdown processor with preprocess and postprocess methods", () => {
		const processors = exports.default.processors;
		assert.ok(processors);
		assert.ok(
			"markdown" in processors,
			"Expected a 'markdown' processor to be exported",
		);
		const markdownProcessor = processors.markdown;
		assert.strictEqual(
			typeof markdownProcessor.preprocess,
			"function",
			"Expected markdown.preprocess to be a function",
		);
		assert.strictEqual(
			typeof markdownProcessor.postprocess,
			"function",
			"Expected markdown.postprocess to be a function",
		);
	});

	it("has languages that are instances of MarkdownLanguage", () => {
		const languages = exports.default.languages;
		assert.ok(languages);
		assert.ok(
			"commonmark" in languages,
			"Expected 'commonmark' language to be exported",
		);
		assert.ok("gfm" in languages, "Expected 'gfm' language to be exported");
		for (const [name, language] of Object.entries(languages)) {
			assert.ok(
				language instanceof MarkdownLanguage,
				`Expected language '${name}' to be an instance of MarkdownLanguage`,
			);
		}
	});

	it("uses a language mode that matches the language name", () => {
		const { commonmark, gfm } = exports.default.languages;
		const file = { body: "~~Hello~~" };

		// CommonMark should NOT parse GFM strikethrough
		const cmResult = commonmark.parse(file);
		assert.strictEqual(cmResult.ok, true);
		assert.strictEqual(
			cmResult.ast.children[0].children[0].type,
			"text",
			"Expected CommonMark to treat '~~Hello~~' as plain text",
		);

		// GFM should parse strikethrough
		const gfmResult = gfm.parse(file);
		assert.strictEqual(gfmResult.ok, true);
		assert.strictEqual(
			gfmResult.ast.children[0].children[0].type,
			"delete",
			"Expected GFM to parse '~~Hello~~' into a 'delete' node",
		);
	});

	it("has a MarkdownLanguage export", () => {
		assert.ok(exports.MarkdownLanguage);
	});

	it("has a MarkdownSourceCode export", () => {
		assert.ok(exports.MarkdownSourceCode);
	});
});
