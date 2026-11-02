/**
 * @fileoverview Tests for no-invalid-label-refs rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-label-refs.js";
import markdown from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/commonmark",
});

ruleTester.run("no-invalid-label-refs", rule, {
	valid: [
		"[*foo*]",
		"[foo]\n\n[foo]: http://bar.com",
		"[foo][ foo ]\n\n[foo]: http://bar.com",
		"![foo][foo]\n\n[foo]: http://bar.com/image.jpg",
		"[foo][]\n\n[foo]: http://bar.com/image.jpg",
		"![foo][]\n\n[foo]: http://bar.com/image.jpg",
		"[  foo ][]\n\n[foo]: http://bar.com/image.jpg",
		"[eslint][\n\n]",
		"[*eslint*][]\n\n[*eslint*]: http://bar.com",
		String.raw`\[foo][ ]

		[foo]: http://bar.com`,

		// Opening bracket: odd number of backslashes.
		`${"\\".repeat(3)}[foo][ ]\n\n[foo]: http://bar.com`,
		`${"\\".repeat(5)}[foo][ ]\n\n[foo]: http://bar.com`,

		// Closing bracket: odd number of backslashes.
		`[foo${"\\".repeat(1)}][ ]\n\n[foo]: http://bar.com`,
		`[foo${"\\".repeat(3)}][ ]\n\n[foo]: http://bar.com`,
		`[foo${"\\".repeat(5)}][ ]\n\n[foo]: http://bar.com`,

		"[foo](http://bar.com)",
		"[foo][bar]\n\n[bar]: http://bar.com",
		String.raw`[before] \[foo][ ]

[foo]: http://bar.com`,
		String.raw`[before

][ ]

[before]: http://bar.com`,
		String.raw`\[foo][ ] \[bar][ ]

[foo]: http://foo.com
[bar]: http://bar.com`,
	],
	invalid: [
		{
			code: "[foo][ ]\n\n[foo]: http://bar.com/image.jpg",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "![foo][ ]\n\n[foo]: http://bar.com/image.jpg",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "[\nfoo\n][\n]\n\n[foo]: http://bar.com/image.jpg",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 3,
					column: 2,
					endLine: 4,
					endColumn: 2,
				},
			],
		},
		{
			code: "[\nfoo\n][\n ]\n\n[foo]: http://bar.com/image.jpg",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 3,
					column: 2,
					endLine: 4,
					endColumn: 3,
				},
			],
		},
		{
			code: "[foo][ ]\n[bar][ ]\n\n[foo]: http://foo.com\n[bar]: http://bar.com",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "invalidLabelRef",
					data: { label: "bar" },
					line: 2,
					column: 6,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: "[foo][ ]\n![bar][ ]\n\n[foo]: http://foo.com\n[bar]: http://bar.com",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "invalidLabelRef",
					data: { label: "bar" },
					line: 2,
					column: 7,
					endLine: 2,
					endColumn: 10,
				},
			],
		},
		{
			code: "- - - [foo][ ]\n\n[foo]: http://foo.com",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "eslint [eslint][ ]",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "eslint" },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "\\\\eslint [eslint][ ]",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "eslint" },
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "es\\\\lint\\\\ [eslint][ ]",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "eslint" },
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "[eslint][ ]",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "eslint" },
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "[eslint][\n]",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "eslint" },
					line: 1,
					column: 9,
					endLine: 2,
					endColumn: 2,
				},
			],
		},
		{
			code: "[*eslint*][ ]",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "*eslint*" },
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: String.raw`\\[foo][ ]

[foo]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: String.raw`][foo\]bar][ ]

[foo\]bar]: /url`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: {
						label: String.raw`foo\]bar`,
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},

		// Opening bracket: even number of backslashes.
		{
			code: `${"\\".repeat(4)}[foo][ ]\n\n[foo]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: `${"\\".repeat(6)}[foo][ ]\n\n[foo]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},

		// Closing bracket: even number of backslashes.
		{
			code: `[foo${"\\".repeat(2)}][ ]\n\n[foo${"\\".repeat(2)}]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: `foo${"\\".repeat(2)}` },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: `[foo${"\\".repeat(4)}][ ]\n\n[foo${"\\".repeat(4)}]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: `foo${"\\".repeat(4)}` },
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: `[foo${"\\".repeat(6)}][ ]\n\n[foo${"\\".repeat(6)}]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: `foo${"\\".repeat(6)}` },
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "# [foo][ ]\n\n[foo]: http://bar.com",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "| Label |\n| --- |\n| [foo][ ] |\n\n[foo]: http://bar.com",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 3,
					column: 8,
					endLine: 3,
					endColumn: 11,
				},
			],
		},
		{
			code: String.raw`[foo \[bar][ ]

[foo \[bar]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: String.raw`foo \[bar` },
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: String.raw`[one][ ] \[skip][ ] [two][ ]

[one]: http://one.com
[skip]: http://skip.com
[two]: http://two.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "one" },
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "invalidLabelRef",
					data: { label: "two" },
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
	],
});
