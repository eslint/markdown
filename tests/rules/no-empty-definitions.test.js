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
		"[//]: # (This is a comment 1)",
		"[//]: <> (This is a comment 2)",
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
		"[^foo]: <span></span> <!-- comment -->",
		"[^foo]: content <!-- comment -->",
		"[^foo]: <!-- comment --> content",
		"[^foo]: <!-- comment --> content <!-- comment -->",
		dedent`
		[^foo]: <!-- comm
		    ent --> content <!-- comment -->
		`,
		{
			code: "[foo]: #",
			options: [{ allowDefinitions: ["foo"] }],
		},
		{
			code: "[bar]: <>",
			options: [{ allowDefinitions: ["bar"] }],
		},
		{
			code: "[foo]: #\n[bar]: <>",
			options: [{ allowDefinitions: ["foo", "bar"] }],
		},
		{
			code: "[^note]:",
			options: [{ checkFootnoteDefinitions: false }],
		},
		{
			code: "[^note]:",
			options: [
				{
					checkFootnoteDefinitions: true,
					allowFootnoteDefinitions: ["note"],
				},
			],
		},
		{
			code: "[FOO]: #",
			options: [{ allowDefinitions: ["FOO"] }],
		},
		{
			code: "[foo]: #",
			options: [{ allowDefinitions: ["FOO"] }],
		},
		{
			code: "[FOO]: #",
			options: [{ allowDefinitions: ["foo"] }],
		},
		{
			code: "[   foo   ]: #",
			options: [{ allowDefinitions: ["foo"] }],
		},
		{
			code: "[foo]: #",
			options: [{ allowDefinitions: ["   foo   "] }],
		},
		{
			code: "[foo bar]: #",
			options: [{ allowDefinitions: ["foo\t\r\nbar"] }],
		},
		{
			code: "[FOO]: <>",
			options: [{ allowDefinitions: ["FOO"] }],
		},
		{
			code: "[foo]: <>",
			options: [{ allowDefinitions: ["FOO"] }],
		},
		{
			code: "[FOO]: <>",
			options: [{ allowDefinitions: ["foo"] }],
		},
		{
			code: "[   foo   ]: <>",
			options: [{ allowDefinitions: ["foo"] }],
		},
		{
			code: "[foo]: <>",
			options: [{ allowDefinitions: ["   foo   "] }],
		},
		{
			code: "[foo bar]: <>",
			options: [{ allowDefinitions: ["foo\t\r\nbar"] }],
		},
		{
			code: "[^NOTE]:",
			options: [{ allowFootnoteDefinitions: ["NOTE"] }],
		},
		{
			code: "[^note]:",
			options: [{ allowFootnoteDefinitions: ["NOTE"] }],
		},
		{
			code: "[^NOTE]:",
			options: [{ allowFootnoteDefinitions: ["note"] }],
		},
		{
			code: "[^note]:",
			options: [{ allowFootnoteDefinitions: ["   note   "] }],
		},
		// This test case is skipped for non-Node environments like Bun
		...(typeof process !== "undefined" &&
		process.release?.name === "node" &&
		!process.versions?.bun
			? [
					{
						code: "[Grüsse]: #",
						options: [{ allowDefinitions: ["GRÜẞE"] }],
					},
					{
						code: "[Grüsse]: <>",
						options: [{ allowDefinitions: ["GRÜẞE"] }],
					},
					{
						code: "[^Grüsse]:",
						options: [{ allowFootnoteDefinitions: ["GRÜẞE"] }],
					},
				]
			: []),
	],
	invalid: [
		{
			code: "[foo]: #",
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo" },
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
					data: { identifier: "foo" },
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
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "emptyDefinition",
					data: { identifier: "bar" },
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
					data: { identifier: "note" },
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
					data: { identifier: "note" },
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
					data: { identifier: "note" },
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
					data: { identifier: "a" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "b" },
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
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "note" },
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
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^foo]: <!-- comment -->",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: dedent`
			[^foo]: <!-- comment
			    -->`,
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`
			[^foo]: <!-- comment -->
			    <!-- another comment -->`,
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 29,
				},
			],
		},
		{
			code: "[//]: #\n[foo]: #",
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: "[foo]: #",
			options: [
				{
					allowDefinitions: ["bar"],
					allowFootnoteDefinitions: ["foo"],
				},
			],
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^foo]:",
			options: [
				{
					allowDefinitions: ["foo"],
					allowFootnoteDefinitions: ["bar"],
				},
			],
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
	],
});
