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
					endColumn: 1,
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
	],
});
