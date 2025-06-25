/**
 * @fileoverview Tests for no-empty-definitions rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-empty-definitions.js";
import markdown from "../../src/index.js";
import { RuleTester } from "eslint";
import dedent from "dedent";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/gfm",
});

ruleTester.run("no-empty-definitions", rule, {
	valid: [
		"[foo]: bar",
		"[foo]: #bar",
		"[foo]: http://bar.com",
		"[foo]: <https://bar.com>",
		"[^note]: This is a footnote.",
		"[^note]: ![]()",
		"[^note]: [text](url)",
		"[^note]:\n    Content",
		"[^note]:\n    > blockquote",
		"[^note]: <span></span>",
		"\\[^note]:",
		"[\\^note]:",
		"[^note\\]:",
		"[^note]\\:",
		{
			code: "[^note]:",
			options: [{ checkFootnoteDefinitions: false }],
		},
	],
	invalid: [
		{
			code: "[foo]: #",
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[foo]: <>",
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: dedent`
			[foo]: #
			[bar]: <>
			`,
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "emptyDefinition",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 10,
				},
			],
		},
		{
			code: "[^note]:",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^note]:   ",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "[^note]:\n",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^a]:\n[^b]:",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
				{
					messageId: "emptyFootnoteDefinition",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 6,
				},
			],
		},
		{
			code: "[foo]: #\n[^note]:",
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "emptyFootnoteDefinition",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: "[foo]: #\n[^note]:",
			options: [{ checkFootnoteDefinitions: false }],
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
	],
});
