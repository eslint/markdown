/**
 * @fileoverview Tests for the package index's exports.
 * @author Steve Dodier-Lazaro
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import * as exports from "../../src/index.js";
import assert from "node:assert";

import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

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

	it("has a MarkdownSourceCode export", () => {
		assert.ok(exports.MarkdownSourceCode);
	});
});
