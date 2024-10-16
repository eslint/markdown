/**
 * @fileoverview Tests for no-missing-label-refs rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-label-refs.js";
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
	],
});
