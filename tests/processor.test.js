/**
 * @fileoverview Tests for the Markdown processor.
 * @author Brandon Mills
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { assert } from "chai";
import path from "node:path";
import { processor } from "../src/processor.js";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const pkg = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"),
);

const BOM = "\uFEFF";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("processor", () => {
	describe("meta", () => {
		it("should have meta property", () => {
			assert.deepStrictEqual(processor.meta, {
				name: "@eslint/markdown/markdown",
				version: pkg.version,
			});
		});
	});

	[true, false].forEach(withBom => {
		describe(withBom ? "with BOM" : "without BOM", () => {
			const prefix = withBom ? BOM : "";

			describe("preprocess", () => {
				it("should not crash", () => {
					processor.preprocess(`${prefix}Hello, world!`);
				});

				it("should not crash on an empty string", () => {
					processor.preprocess(`${prefix}`);
				});

				it("should return an array", () => {
					assert.isArray(
						processor.preprocess(`${prefix}Hello, world!`),
					);
				});

				it("should ignore normal text", () => {
					const blocks = processor.preprocess(
						`${prefix}Hello, world!`,
					);

					assert.strictEqual(blocks.length, 0);
				});

				it("should ignore inline code", () => {
					const blocks = processor.preprocess(
						`${prefix}Hello, \`{{name}}!`,
					);

					assert.strictEqual(blocks.length, 0);
				});

				it("should ignore space-indented code blocks", () => {
					const code =
						prefix +
						[
							"Hello, world!",
							"    ",
							"    var answer = 6 * 7;",
							"    ",
							"Goodbye",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 0);
				});

				it("should ignore 4-space-indented code fences", () => {
					const code =
						prefix +
						[
							"Hello, world!",
							"    ```js",
							"    var answer = 6 * 7;",
							"    ```",
							"Goodbye",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 0);
				});

				it("should ignore 4-space-indented fence ends", () => {
					const code =
						prefix +
						[
							"Hello, world!",
							"```js",
							"var answer = 6 * 7;",
							"    ```",
							"Goodbye",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						"var answer = 6 * 7;\n    ```\nGoodbye\n",
					);
				});

				it("should ignore tab-indented code blocks", () => {
					const code =
						prefix +
						[
							"Hello, world!",
							"\t",
							"\tvar answer = 6 * 7;",
							"\t",
							"Goodbye",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 0);
				});

				it("should terminate blocks at EOF", () => {
					const code =
						prefix +
						["Hello, world!", "```js", "var answer = 6 * 7;"].join(
							"\n",
						);
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "var answer = 6 * 7;\n");
				});

				it("should allow backticks or tildes", () => {
					const code =
						prefix +
						[
							"```js",
							"backticks",
							"```",
							"~~~js",
							"tildes",
							"~~~",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 2);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "backticks\n");
					assert.strictEqual(blocks[1].filename, "1.js");
					assert.strictEqual(blocks[1].text, "tildes\n");
				});

				it("should allow more than three fence characters", () => {
					const code = prefix + ["````js", "four", "````"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "four\n");
				});

				it("should require end fences at least as long as the starting fence", () => {
					const code =
						prefix +
						[
							"````js",
							"four",
							"```",
							"````",
							"`````js",
							"five",
							"`````",
							"``````js",
							"six",
							"```````",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 3);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "four\n```\n");
					assert.strictEqual(blocks[1].filename, "1.js");
					assert.strictEqual(blocks[1].text, "five\n");
					assert.strictEqual(blocks[2].filename, "2.js");
					assert.strictEqual(blocks[2].text, "six\n");
				});

				it("should not allow other content on ending fence line", () => {
					const code =
						prefix +
						["```js", "test();", "``` end", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "test();\n``` end\n");
				});

				it("should allow empty blocks", () => {
					const code = prefix + ["```js", "", "````"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "\n");
				});

				it("should allow whitespace-only blocks", () => {
					const code =
						prefix +
						["  ```js", "", " ", "  ", "   ", "    ", "```"].join(
							"\n",
						);
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "\n\n\n \n  \n");
				});

				it("should preserve leading and trailing empty lines", () => {
					const code =
						prefix +
						["```js", "", "console.log(42);", "", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						"\nconsole.log(42);\n\n",
					);
				});

				it("should ignore code fences with unspecified info string", () => {
					const code =
						prefix +
						["```", "var answer = 6 * 7;", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 0);
				});

				it("should find code fences with js info string", () => {
					const code =
						prefix +
						["```js", "var answer = 6 * 7;", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
				});

				it("should find code fences with javascript info string", () => {
					const code =
						prefix +
						["```javascript", "var answer = 6 * 7;", "```"].join(
							"\n",
						);
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
				});

				it("should find code fences with node info string", () => {
					const code =
						prefix +
						["```node", "var answer = 6 * 7;", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.node");
				});

				it("should find code fences with jsx info string", () => {
					const code =
						prefix +
						["```jsx", "var answer = 6 * 7;", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.jsx");
				});

				it("should find code fences ignoring info string case", () => {
					const code =
						prefix +
						["```JavaScript", "var answer = 6 * 7;", "```"].join(
							"\n",
						);
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.JavaScript");
				});

				it("should ignore anything after the first word of the info string", () => {
					const code =
						prefix +
						[
							"```js more words are ignored",
							"var answer = 6 * 7;",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
				});

				it("should ignore leading whitespace in the info string", () => {
					const code =
						prefix +
						[
							"```  js ignores leading whitespace",
							"var answer = 6 * 7;",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
				});

				it("should ignore trailing whitespace in the info string", () => {
					const code =
						prefix +
						["```js    ", "var answer = 6 * 7;", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
				});

				it("should translate the language to its file extension with leading whitespace and trailing characters", () => {
					const code =
						prefix +
						[
							"```   javascript  CUSTOM",
							"var answer = 6 * 7;",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
				});

				it("should find code fences not surrounded by blank lines", () => {
					const code =
						prefix +
						[
							"<!-- eslint-disable -->",
							"```js",
							"var answer = 6 * 7;",
							"```",
							"Paragraph text",
							"```js",
							"var answer = 6 * 7;",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 2);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[1].filename, "1.js");
				});

				it("should return the source code in the block", () => {
					const code =
						prefix +
						["```js", "var answer = 6 * 7;", "```"].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "var answer = 6 * 7;\n");
				});

				it("should allow multi-line source code", () => {
					const code =
						prefix +
						[
							"```js",
							"var answer = 6 * 7;",
							"console.log(answer);",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						"var answer = 6 * 7;\nconsole.log(answer);\n",
					);
				});

				it("should preserve original line endings", () => {
					const code =
						prefix +
						[
							"```js",
							"var answer = 6 * 7;",
							"console.log(answer);",
							"```",
						].join("\r\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						"var answer = 6 * 7;\r\nconsole.log(answer);\n",
					);
				});

				it("should unindent space-indented code fences", () => {
					const code =
						prefix +
						[
							"  ```js",
							"  var answer = 6 * 7;",
							"    console.log(answer);",
							" // Fin.",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						"var answer = 6 * 7;\n  console.log(answer);\n// Fin.\n",
					);
				});

				it("should find multiple code fences", () => {
					const code =
						prefix +
						[
							"Hello, world!",
							"",
							"```js",
							"var answer = 6 * 7;",
							"```",
							"",
							"```js",
							"console.log(answer);",
							"```",
							"",
							"Goodbye",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 2);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(blocks[0].text, "var answer = 6 * 7;\n");
					assert.strictEqual(blocks[1].filename, "1.js");
					assert.strictEqual(
						blocks[1].text,
						"console.log(answer);\n",
					);
				});

				it("should insert leading configuration comments", () => {
					const code =
						prefix +
						[
							"<!-- eslint-env browser -->",
							"<!--",
							"    eslint quotes: [",
							'        "error",',
							'        "single"',
							"    ]",
							"-->",
							"",
							"```js",
							"alert('Hello, world!');",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						[
							"/* eslint-env browser */",
							"/*",
							"    eslint quotes: [",
							'        "error",',
							'        "single"',
							"    ]",
							"*/",
							"alert('Hello, world!');",
							"",
						].join("\n"),
					);
				});

				it("should insert global comments", () => {
					const code =
						prefix +
						[
							"<!-- global foo -->",
							"<!-- global bar:false, baz:true -->",
							"",
							"```js",
							"alert(foo, bar, baz);",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						[
							"/* global foo */",
							"/* global bar:false, baz:true */",
							"alert(foo, bar, baz);",
							"",
						].join("\n"),
					);
				});

				// https://github.com/eslint/markdown/issues/76
				it("should insert comments inside list items", () => {
					const code =
						prefix +
						[
							"* List item followed by a blank line",
							"",
							"<!-- eslint-disable no-console -->",
							"```js",
							'console.log("Blank line");',
							"```",
							"",
							"* List item without a blank line",
							"<!-- eslint-disable no-console -->",
							"```js",
							'console.log("No blank line");',
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 2);
					assert.strictEqual(
						blocks[0].text,
						[
							"/* eslint-disable no-console */",
							'console.log("Blank line");',
							"",
						].join("\n"),
					);
					assert.strictEqual(
						blocks[1].text,
						[
							"/* eslint-disable no-console */",
							'console.log("No blank line");',
							"",
						].join("\n"),
					);
				});

				it("should ignore non-eslint comments", () => {
					const code =
						prefix +
						[
							"<!-- eslint-env browser -->",
							"<!-- not an eslint comment -->",
							"",
							"```js",
							"alert('Hello, world!');",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						["alert('Hello, world!');", ""].join("\n"),
					);
				});

				it("should ignore non-comment html", () => {
					const code =
						prefix +
						[
							"<!-- eslint-env browser -->",
							"<p>For example:</p>",
							"",
							"```js",
							"alert('Hello, world!');",
							"```",
						].join("\n");
					const blocks = processor.preprocess(code);

					assert.strictEqual(blocks.length, 1);
					assert.strictEqual(blocks[0].filename, "0.js");
					assert.strictEqual(
						blocks[0].text,
						["alert('Hello, world!');", ""].join("\n"),
					);
				});

				describe("eslint-skip", () => {
					it("should skip the next block", () => {
						const code =
							prefix +
							[
								"<!-- eslint-skip -->",
								"",
								"```js",
								"alert('Hello, world!');",
								"```",
							].join("\n");
						const blocks = processor.preprocess(code);

						assert.strictEqual(blocks.length, 0);
					});

					it("should skip only one block", () => {
						const code =
							prefix +
							[
								"<!-- eslint-skip -->",
								"",
								"```js",
								"alert('Hello, world!');",
								"```",
								"",
								"```js",
								"var answer = 6 * 7;",
								"```",
							].join("\n");
						const blocks = processor.preprocess(code);

						assert.strictEqual(blocks.length, 1);
						assert.strictEqual(blocks[0].filename, "0.js");
						assert.strictEqual(
							blocks[0].text,
							"var answer = 6 * 7;\n",
						);
					});

					it("should still work surrounded by other comments", () => {
						const code =
							prefix +
							[
								"<!-- eslint-disable no-console -->",
								"<!-- eslint-skip -->",
								"<!-- eslint-disable quotes -->",
								"",
								"```js",
								"alert('Hello, world!');",
								"```",
								"",
								"```js",
								"var answer = 6 * 7;",
								"```",
							].join("\n");
						const blocks = processor.preprocess(code);

						assert.strictEqual(blocks.length, 1);
						assert.strictEqual(blocks[0].filename, "0.js");
						assert.strictEqual(
							blocks[0].text,
							"var answer = 6 * 7;\n",
						);
					});
				});
			});

			describe("postprocess", () => {
				const code =
					prefix +
					[
						"Hello, world!",
						"",
						"```js",
						"var answer = 6 * 7;",
						"if (answer === 42) {",
						"    console.log(answer);",
						"}",
						"```",
						"",
						"Let's make a list.",
						"",
						"1. First item",
						"",
						"   ```JavaScript",
						"   var arr = [",
						"       1,",
						"       2",
						"   ];",
						"   ```",
						"",
						"1. Second item",
						"",
						"  ```JS",
						"  function boolean(arg) {",
						"  \treturn",
						"  \t!!arg;",
						"  };",
						"  ```",
					].join("\n");
				const messages = [
					[
						{
							line: 1,
							endLine: 1,
							column: 1,
							message: 'Use the global form of "use strict".',
							ruleId: "strict",
						},
						{
							line: 3,
							endLine: 3,
							column: 5,
							message: "Unexpected console statement.",
							ruleId: "no-console",
						},
					],
					[
						{
							line: 3,
							endLine: 3,
							column: 6,
							message: "Missing trailing comma.",
							ruleId: "comma-dangle",
							fix: { range: [24, 24], text: "," },
						},
					],
					[
						{
							line: 3,
							endLine: 6,
							column: 2,
							message: "Unreachable code after return.",
							ruleId: "no-unreachable",
						},
						{
							line: 4,
							endLine: 4,
							column: 2,
							message: "Unnecessary semicolon.",
							ruleId: "no-extra-semi",
							fix: { range: [41, 42], text: "" },
						},
					],
				];

				beforeEach(() => {
					processor.preprocess(code);
				});

				it("should allow for no messages", () => {
					const result = processor.postprocess([[], [], []]);

					assert.strictEqual(result.length, 0);
				});

				it("should flatten messages", () => {
					const result = processor.postprocess(messages);

					assert.strictEqual(result.length, 5);
					assert.strictEqual(
						result[0].message,
						'Use the global form of "use strict".',
					);
					assert.strictEqual(
						result[1].message,
						"Unexpected console statement.",
					);
					assert.strictEqual(
						result[2].message,
						"Missing trailing comma.",
					);
					assert.strictEqual(
						result[3].message,
						"Unreachable code after return.",
					);
					assert.strictEqual(
						result[4].message,
						"Unnecessary semicolon.",
					);
				});

				it("should translate line numbers", () => {
					const result = processor.postprocess(messages);

					assert.strictEqual(result[0].line, 4);
					assert.strictEqual(result[1].line, 6);
					assert.strictEqual(result[2].line, 17);
					assert.strictEqual(result[3].line, 26);
					assert.strictEqual(result[4].line, 27);
				});

				it("should translate endLine numbers", () => {
					const result = processor.postprocess(messages);

					assert.strictEqual(result[0].endLine, 4);
					assert.strictEqual(result[1].endLine, 6);
					assert.strictEqual(result[2].endLine, 17);
					assert.strictEqual(result[3].endLine, 29);
					assert.strictEqual(result[4].endLine, 27);
				});

				it("should translate column numbers", () => {
					const result = processor.postprocess(messages);

					assert.strictEqual(result[0].column, 1);
					assert.strictEqual(result[1].column, 5);
				});

				it("should translate indented column numbers", () => {
					const result = processor.postprocess(messages);

					assert.strictEqual(result[2].column, 9);
					assert.strictEqual(result[3].column, 4);
					assert.strictEqual(result[4].column, 4);
				});

				it("should adjust fix range properties", () => {
					const result = processor.postprocess(messages);

					assert.deepStrictEqual(result[2].fix.range, [179, 179]);
					assert.deepStrictEqual(result[4].fix.range, [267, 268]);
				});

				// https://github.com/eslint/markdown/pull/282
				it("should adjust fix range properties (2)", () => {
					const codeWithSpaceInParens =
						prefix + ["```js", "( a)", "```"].join("\n");

					processor.preprocess(codeWithSpaceInParens);

					const messagesForBlocks = [
						[
							{
								line: 1,
								endLine: 1,
								column: 2,
								message:
									"There should be no space after this paren.",
								ruleId: "space-in-parens",
								fix: { range: [1, 2], text: "" },
							},
						],
					];

					const result = processor.postprocess(messagesForBlocks);

					assert.deepStrictEqual(result[0].fix.range, [7, 8]);
				});

				describe("should exclude messages from unsatisfiable rules", () => {
					it("eol-last", () => {
						const result = processor.postprocess([
							[
								{
									line: 4,
									column: 3,
									message:
										"Newline required at end of file but not found.",
									ruleId: "eol-last",
								},
							],
						]);

						assert.strictEqual(result.length, 0);
					});

					it("unicode-bom", () => {
						const result = processor.postprocess([
							[
								{
									line: 1,
									column: 1,
									message:
										"Expected Unicode BOM (Byte Order Mark).",
									ruleId: "unicode-bom",
								},
							],
						]);

						assert.strictEqual(result.length, 0);
					});
				});

				it("should attach messages without `line` to opening code fence", () => {
					const message = {
						message:
							'Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser.',
						ruleId: null,
					};
					const result = processor.postprocess([
						[message],
						[message],
						[message],
					]);

					assert.strictEqual(result.length, 3);
					assert.deepStrictEqual(result[0], {
						...message,
						line: 3,
						column: 1,
					});
					assert.deepStrictEqual(result[1], {
						...message,
						line: 14,
						column: 4,
					});
					assert.deepStrictEqual(result[2], {
						...message,
						line: 23,
						column: 3,
					});
				});

				it("should ignore messages after the code block", () => {
					const empty = prefix + ["```javascript", "```"].join("\n");

					processor.preprocess(empty, "empty.md");
					const message = {
						message: "Empty file",
						ruleId: null,
						line: 2,
					};
					const result = processor.postprocess(
						[[message]],
						"empty.md",
					);

					assert.deepStrictEqual(result, []);
				});
			});
		});
	});

	describe("supportsAutofix", () => {
		it("should equal true", () => {
			assert.strictEqual(processor.supportsAutofix, true);
		});
	});
});
