/**
 * @fileoverview Tests for MarkdownSourceCode.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import { MarkdownSourceCode } from "../../src/language/markdown-source-code.js";
import { fromMarkdown } from "mdast-util-from-markdown";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const markdownText = `# Hello, world!

This is a paragraph.

\`\`\`js
console.log("Hello, world!");
\`\`\`

## This is a heading level 2

This is *another* paragraph.

<!-- eslint-disable-next-line no-console -->

This is a paragraph with an inline config comment. <!-- eslint-disable-line no-console -->

<!--
eslint-enable no-console -- ok to use console here
-->Something something<!-- eslint-disable semi -->

<!--
 eslint-disable-line no-console
 -->`;

const ast = fromMarkdown(markdownText);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("MarkdownSourceCode", () => {
	let sourceCode;

	beforeEach(() => {
		sourceCode = new MarkdownSourceCode({ text: markdownText, ast });
	});

	describe("getText()", () => {
		it("should return the text of the Markdown source code", () => {
			assert.strictEqual(sourceCode.getText(), markdownText);
		});

		it("should return just the text of the first paragraph", () => {
			assert.strictEqual(
				sourceCode.getText(ast.children[1]),
				"This is a paragraph.",
			);
		});

		it("should return the text of the code block plus the ## of the following heading", () => {
			assert.strictEqual(
				sourceCode.getText(ast.children[2], 0, 4),
				'```js\nconsole.log("Hello, world!");\n```\n\n##',
			);
		});
	});

	describe("getLoc()", () => {
		it("should return the location of a node", () => {
			assert.deepStrictEqual(
				sourceCode.getLoc(ast.children[0]),
				ast.children[0].position,
			);
		});
	});

	describe("getRange()", () => {
		it("should return the range of a node", () => {
			assert.deepStrictEqual(sourceCode.getRange(ast.children[0]), [
				ast.children[0].position.start.offset,
				ast.children[0].position.end.offset,
			]);
		});
	});

	describe("getInlineConfigNodes()", () => {
		it("should return the inline config nodes", () => {
			const nodes = sourceCode.getInlineConfigNodes();
			assert.strictEqual(nodes.length, 5);

			/* eslint-disable no-restricted-properties -- Needed to avoid extra asserts. */

			assert.deepEqual(nodes[0], {
				value: "eslint-disable-next-line no-console",
				position: {
					start: { line: 13, column: 1, offset: 140 },
					end: { line: 13, column: 45, offset: 184 },
				},
			});

			assert.deepEqual(nodes[1], {
				value: "eslint-disable-line no-console",
				position: {
					start: { line: 15, column: 52, offset: 237 },
					end: { line: 15, column: 91, offset: 276 },
				},
			});

			assert.deepEqual(nodes[2], {
				value: "eslint-enable no-console -- ok to use console here",
				position: {
					start: { line: 17, column: 1, offset: 278 },
					end: { line: 19, column: 4, offset: 337 },
				},
			});

			assert.deepEqual(nodes[3], {
				value: "eslint-disable semi",
				position: {
					start: { line: 19, column: 23, offset: 356 },
					end: { line: 19, column: 51, offset: 384 },
				},
			});

			assert.deepEqual(nodes[4], {
				value: "eslint-disable-line no-console",
				position: {
					start: { line: 21, column: 1, offset: 386 },
					end: { line: 23, column: 5, offset: 427 },
				},
			});

			/* eslint-enable no-restricted-properties -- Needed to avoid extra asserts. */
		});
	});

	describe("getDisableDirectives()", () => {
		it("should return the disable directives", () => {
			const { problems, directives } = sourceCode.getDisableDirectives();

			assert.strictEqual(problems.length, 1);

			assert.strictEqual(problems[0].ruleId, null);
			assert.strictEqual(
				problems[0].message,
				"eslint-disable-line comment should not span multiple lines.",
			);
			assert.deepStrictEqual(problems[0].loc, {
				start: { line: 21, column: 1, offset: 386 },
				end: { line: 23, column: 5, offset: 427 },
			});

			assert.strictEqual(directives.length, 4);

			assert.strictEqual(directives[0].type, "disable-next-line");
			assert.strictEqual(directives[0].value, "no-console");
			assert.strictEqual(directives[0].justification, "");

			assert.strictEqual(directives[1].type, "disable-line");
			assert.strictEqual(directives[1].value, "no-console");
			assert.strictEqual(directives[1].justification, "");

			assert.strictEqual(directives[2].type, "enable");
			assert.strictEqual(directives[2].value, "no-console");
			assert.strictEqual(
				directives[2].justification,
				"ok to use console here",
			);

			assert.strictEqual(directives[3].type, "disable");
			assert.strictEqual(directives[3].value, "semi");
			assert.strictEqual(directives[3].justification, "");
		});
	});

	describe("traverse()", () => {
		it("should traverse the AST", () => {
			const steps = sourceCode.traverse();
			const stepsArray = Array.from(steps).map(step => [
				step.phase,
				step.target.type,
				step.target.value,
			]);

			assert.deepStrictEqual(stepsArray, [
				[1, "root", void 0],
				[1, "heading", void 0],
				[1, "text", "Hello, world!"],
				[2, "text", "Hello, world!"],
				[2, "heading", void 0],
				[1, "paragraph", void 0],
				[1, "text", "This is a paragraph."],
				[2, "text", "This is a paragraph."],
				[2, "paragraph", void 0],
				[1, "code", 'console.log("Hello, world!");'],
				[2, "code", 'console.log("Hello, world!");'],
				[1, "heading", void 0],
				[1, "text", "This is a heading level 2"],
				[2, "text", "This is a heading level 2"],
				[2, "heading", void 0],
				[1, "paragraph", void 0],
				[1, "text", "This is "],
				[2, "text", "This is "],
				[1, "emphasis", void 0],
				[1, "text", "another"],
				[2, "text", "another"],
				[2, "emphasis", void 0],
				[1, "text", " paragraph."],
				[2, "text", " paragraph."],
				[2, "paragraph", void 0],
				[1, "html", "<!-- eslint-disable-next-line no-console -->"],
				[2, "html", "<!-- eslint-disable-next-line no-console -->"],
				[1, "paragraph", void 0],
				[
					1,
					"text",
					"This is a paragraph with an inline config comment. ",
				],
				[
					2,
					"text",
					"This is a paragraph with an inline config comment. ",
				],
				[1, "html", "<!-- eslint-disable-line no-console -->"],
				[2, "html", "<!-- eslint-disable-line no-console -->"],
				[2, "paragraph", void 0],
				[
					1,
					"html",
					"<!--\neslint-enable no-console -- ok to use console here\n-->Something something<!-- eslint-disable semi -->",
				],
				[
					2,
					"html",
					"<!--\neslint-enable no-console -- ok to use console here\n-->Something something<!-- eslint-disable semi -->",
				],
				[1, "html", "<!--\n eslint-disable-line no-console\n -->"],
				[2, "html", "<!--\n eslint-disable-line no-console\n -->"],
				[2, "root", void 0],
			]);
		});
	});
});
