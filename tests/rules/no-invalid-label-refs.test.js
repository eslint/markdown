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
		...[3, 5].map(
			count => `${"\\".repeat(count)}[foo][ ]\n\n[foo]: http://bar.com`,
		),

		// Closing bracket: odd number of backslashes.
		...[1, 3, 5].map(
			count => `[foo${"\\".repeat(count)}][ ]\n\n[foo]: http://bar.com`,
		),
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
		...[4, 6].map(count => ({
			code: `${"\\".repeat(count)}[foo][ ]\n\n[foo]: http://bar.com`,
			errors: [
				{
					messageId: "invalidLabelRef",
					data: { label: "foo" },
					line: 1,
					column: count + 6,
					endLine: 1,
					endColumn: count + 9,
				},
			],
		})),
		// Closing bracket: even number of backslashes.
		...[2, 4, 6].map(count => {
			const backslashes = "\\".repeat(count);

			return {
				code: `[foo${backslashes}][ ]\n\n[foo${backslashes}]: http://bar.com`,
				errors: [
					{
						messageId: "invalidLabelRef",
						data: { label: `foo${backslashes}` },
						line: 1,
						column: count + 6,
						endLine: 1,
						endColumn: count + 9,
					},
				],
			};
		}),
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
