/**
 * @fileoverview Tests for no-empty-definitions rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import dedent from "dedent";
import ruleTester from "./_utils/rule-tester.js";
import rule from "../../src/rules/no-empty-definitions.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

ruleTester("no-empty-definitions", rule, {
	valid: [
		"[foo]: bar",
		"[foo]: #bar",
		"[foo]: http://bar.com",
		"[foo]: <https://bar.com>",
		"[//]: # (This is a comment 1)",
		"[//]: <> (This is a comment 2)",
		{
			code: "[^note]: This is a footnote.",
			language: "markdown/gfm",
		},
		{
			code: "[^note]: ![]()",
			language: "markdown/gfm",
		},
		{
			code: "[^note]: [text](url)",
			language: "markdown/gfm",
		},
		{
			code: "[^note]:\n    Content",
			language: "markdown/gfm",
		},
		{
			code: "[^note]:\n    > blockquote",
			language: "markdown/gfm",
		},
		{
			code: "[^note]: <span></span>",
			language: "markdown/gfm",
		},
		"\\[^note]:",
		"[\\^note]:",
		"[^note\\]:",
		"[^note]\\:",
		{
			code: "[^foo]: <span></span> <!-- comment -->",
			language: "markdown/gfm",
		},
		{
			code: "[^foo]: content <!-- comment -->",
			language: "markdown/gfm",
		},
		{
			code: "[^foo]: <!-- comment --> content",
			language: "markdown/gfm",
		},
		{
			code: "[^foo]: <!-- comment --> content <!-- comment -->",
			language: "markdown/gfm",
		},
		{
			code: dedent`
			[^foo]: <!-- comm
			    ent --> content <!-- comment -->
			`,
			language: "markdown/gfm",
		},
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
			language: "markdown/gfm",
			options: [{ checkFootnoteDefinitions: false }],
		},
		{
			code: "[^note]:",
			language: "markdown/gfm",
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
			language: "markdown/gfm",
			options: [{ allowFootnoteDefinitions: ["NOTE"] }],
		},
		{
			code: "[^note]:",
			language: "markdown/gfm",
			options: [{ allowFootnoteDefinitions: ["NOTE"] }],
		},
		{
			code: "[^NOTE]:",
			language: "markdown/gfm",
			options: [{ allowFootnoteDefinitions: ["note"] }],
		},
		{
			code: "[^note]:",
			language: "markdown/gfm",
			options: [{ allowFootnoteDefinitions: ["   note   "] }],
		},
		// This test case is skipped when running on Bun
		...(!process.versions.bun
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
						language: "markdown/gfm",
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
					data: { identifier: "foo", label: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[Foo]: #",
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo", label: "Foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[  Foo  ]: #",
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo", label: "Foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "[foo]: <>",
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo", label: "foo" },
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
					data: { identifier: "foo", label: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "emptyDefinition",
					data: { identifier: "bar", label: "bar" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 10,
				},
			],
		},
		{
			code: "[^note]:",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "note", label: "note" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^Note]:",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "note", label: "Note" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^note]:   ",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "note", label: "note" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "[^note]:\n",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "note", label: "note" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^a]:\n[^b]:",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "a", label: "a" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "b", label: "b" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 6,
				},
			],
		},
		{
			code: "[foo]: #\n[^note]:",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo", label: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "note", label: "note" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: "[foo]: #\n[^note]:",
			language: "markdown/gfm",
			options: [{ checkFootnoteDefinitions: false }],
			errors: [
				{
					messageId: "emptyDefinition",
					data: { identifier: "foo", label: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^foo]: <!-- comment -->",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo", label: "foo" },
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
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo", label: "foo" },
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
			language: "markdown/gfm",
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo", label: "foo" },
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
					data: { identifier: "foo", label: "foo" },
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
					data: { identifier: "foo", label: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[^foo]:",
			language: "markdown/gfm",
			options: [
				{
					allowDefinitions: ["foo"],
					allowFootnoteDefinitions: ["bar"],
				},
			],
			errors: [
				{
					messageId: "emptyFootnoteDefinition",
					data: { identifier: "foo", label: "foo" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
	],
});
