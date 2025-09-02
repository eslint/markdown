/**
 * @fileoverview Tests for no-missing-label-refs rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-label-refs.js";
import markdown from "../../src/index.js";
import { Linter, RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/commonmark",
});

ruleTester.run("no-missing-label-refs", rule, {
	valid: [
		"[*foo*]",
		"[foo]\n\n[foo]: http://bar.com",
		"[foo][foo]\n\n[foo]: http://bar.com",
		"[foo][foo]\n\n[ foo ]: http://bar.com",
		"[foo][ foo ]\n\n[ foo ]: http://bar.com",
		"![foo][foo]\n\n[foo]: http://bar.com/image.jpg",
		"[foo][]\n\n[foo]: http://bar.com/image.jpg",
		"![foo][]\n\n[foo]: http://bar.com/image.jpg",
		"[  foo ][]\n\n[foo]: http://bar.com/image.jpg",
		"[foo][ ]\n\n[foo]: http://bar.com/image.jpg",
		"[\nfoo\n][\n]\n\n[foo]: http://bar.com/image.jpg",
		"[]",
		"][]",
		"[][]",
		"[] []",
		"[foo",
		"foo]",
		"foo][bar]\n\n[bar]: http://bar.com",
		"foo][bar][baz]\n\n[baz]: http://baz.com",
		"[][foo]\n\n[foo]: http://foo.com",
		"[foo][bar\\]\n\n[foo]: http://foo.com",
		"\\[\\]",
		`${"\\".repeat(3)}[${"\\".repeat(3)}]`,
		`${"\\".repeat(5)}[${"\\".repeat(5)}]`,
		`${"\\".repeat(7)}[${"\\".repeat(7)}]`,
		"[\\]",
		`[${"\\".repeat(3)}]`,
		`[${"\\".repeat(5)}]`,
		`[${"\\".repeat(7)}]`,
		"\\[]",
		`${"\\".repeat(3)}[]`,
		`${"\\".repeat(5)}[]`,
		`${"\\".repeat(7)}[]`,
		"\\[escaped\\]",
		`${"\\".repeat(3)}[escaped${"\\".repeat(3)}]`,
		`${"\\".repeat(5)}[escaped${"\\".repeat(5)}]`,
		`${"\\".repeat(7)}[escaped${"\\".repeat(7)}]`,
		"\\[escaped]",
		`${"\\".repeat(3)}[escaped]`,
		`${"\\".repeat(5)}[escaped]`,
		`${"\\".repeat(7)}[escaped]`,
		"[escaped\\]",
		`[escaped${"\\".repeat(3)}]`,
		`[escaped${"\\".repeat(5)}]`,
		`[escaped${"\\".repeat(7)}]`,
		"\\[escaped\\]\\[escaped\\]",
		`${"\\".repeat(3)}[escaped${"\\".repeat(3)}]${"\\".repeat(3)}[escaped${"\\".repeat(3)}]`,
		`${"\\".repeat(5)}[escaped${"\\".repeat(5)}]${"\\".repeat(5)}[escaped${"\\".repeat(5)}]`,
		`${"\\".repeat(7)}[escaped${"\\".repeat(7)}]${"\\".repeat(7)}[escaped${"\\".repeat(7)}]`,
		"\\[escaped\\]\\[escaped]",
		`${"\\".repeat(3)}[escaped${"\\".repeat(3)}]${"\\".repeat(3)}[escaped]`,
		`${"\\".repeat(5)}[escaped${"\\".repeat(5)}]${"\\".repeat(5)}[escaped]`,
		`${"\\".repeat(7)}[escaped${"\\".repeat(7)}]${"\\".repeat(7)}[escaped]`,
		"[escaped\\]\\[escaped\\]",
		`[escaped${"\\".repeat(3)}]${"\\".repeat(3)}[escaped${"\\".repeat(3)}]`,
		`[escaped${"\\".repeat(5)}]${"\\".repeat(5)}[escaped${"\\".repeat(5)}]`,
		`[escaped${"\\".repeat(7)}]${"\\".repeat(7)}[escaped${"\\".repeat(7)}]`,
		"\\[escaped]\\[escaped]",
		`${"\\".repeat(3)}[escaped]${"\\".repeat(3)}[escaped]`,
		`${"\\".repeat(5)}[escaped]${"\\".repeat(5)}[escaped]`,
		`${"\\".repeat(7)}[escaped]${"\\".repeat(7)}[escaped]`,
		"[escaped\\][escaped\\]",
		`[escaped${"\\".repeat(3)}][escaped${"\\".repeat(3)}]`,
		`[escaped${"\\".repeat(5)}][escaped${"\\".repeat(5)}]`,
		`[escaped${"\\".repeat(7)}][escaped${"\\".repeat(7)}]`,
	],
	invalid: [
		{
			code: "[foo][bar]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "![foo][bar]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "[foo][]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: "![foo][]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "[foo]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: "![foo]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "[foo]\n[bar]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 5,
				},
			],
		},
		{
			code: "- - - [foo]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "foo][bar]\n\n[baz]: http://baz.com",
			errors: [
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "foo][bar][baz]\n\n[bar]: http://bar.com",
			errors: [
				{
					messageId: "notFound",
					data: { label: "baz" },
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: "[foo]\n[foo][bar]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 2,
					column: 7,
					endLine: 2,
					endColumn: 10,
				},
			],
		},
		{
			code: "[Foo][foo]\n[Bar][]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 10,
				},
				{
					messageId: "notFound",
					data: { label: "Bar" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 5,
				},
			],
		},
		{
			code: "[Foo][]\n[Bar][]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "Foo" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
				{
					messageId: "notFound",
					data: { label: "Bar" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 5,
				},
			],
		},
		{
			code: "[Foo][foo]\n[Bar][bar]\n[Hoge][]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 10,
				},
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 2,
					column: 7,
					endLine: 2,
					endColumn: 10,
				},
				{
					messageId: "notFound",
					data: { label: "Hoge" },
					line: 3,
					column: 2,
					endLine: 3,
					endColumn: 6,
				},
			],
		},
		{
			code: "[Foo][]\n[Bar][bar]\n[Hoge][hoge]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "Foo" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 2,
					column: 7,
					endLine: 2,
					endColumn: 10,
				},
				{
					messageId: "notFound",
					data: { label: "hoge" },
					line: 3,
					column: 8,
					endLine: 3,
					endColumn: 12,
				},
			],
		},
		{
			code: "[][foo]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: " foo\n  [bar]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "bar" },
					line: 2,
					column: 4,
					endLine: 2,
					endColumn: 7,
				},
			],
		},
		// Backslash escaping
		{
			code: `${"\\".repeat(2)}[foo]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: `${"\\".repeat(2)}[foo${"\\".repeat(2)}][bar${"\\".repeat(2)}]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: `bar${"\\".repeat(2)}` },
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: `${"\\".repeat(4)}[foo${"\\".repeat(4)}][bar${"\\".repeat(4)}]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: `bar${"\\".repeat(4)}` },
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: `${"\\".repeat(6)}[foo${"\\".repeat(6)}][bar${"\\".repeat(6)}]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: `bar${"\\".repeat(6)}` },
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: "\\[[foo]\\]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: `${"\\".repeat(3)}[[foo]${"\\".repeat(3)}]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: `${"\\".repeat(5)}[[foo]${"\\".repeat(5)}]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: `${"\\".repeat(7)}[[foo]${"\\".repeat(7)}]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: "foo" },
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "[\\[foo\\]]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "\\[foo\\]" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: `[${"\\".repeat(3)}[foo${"\\".repeat(3)}]]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: `${"\\".repeat(3)}[foo${"\\".repeat(3)}]` },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: `[${"\\".repeat(5)}[foo${"\\".repeat(5)}]]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: `${"\\".repeat(5)}[foo${"\\".repeat(5)}]` },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: `[${"\\".repeat(7)}[foo${"\\".repeat(7)}]]`,
			errors: [
				{
					messageId: "notFound",
					data: { label: `${"\\".repeat(7)}[foo${"\\".repeat(7)}]` },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "[\\[\\[foo\\]\\]]",
			errors: [
				{
					messageId: "notFound",
					data: { label: "\\[\\[foo\\]\\]" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
	],
});

// https://github.com/eslint/markdown/pull/463
it("`no-missing-label-refs` should not timeout for large inputs", () => {
	const linter = new Linter();
	linter.verify("[abcd".repeat(100_000), {
		language: "markdown/commonmark",
		plugins: { markdown },
		rules: { "markdown/no-missing-label-refs": "error" },
	});
});
