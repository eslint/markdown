/**
 * @fileoverview Tests for no-heading-like-paragraph rule.
 * @author Gaic4o
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-heading-like-paragraph.js";
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
	language: "markdown/commonmark",
});

ruleTester.run("no-heading-like-paragraph", rule, {
	valid: [
		// Basic
		"",
		"  ",
		"Installation",
		"###### Installation",
		"# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six",

		// Setext heading
		"####### Installation\n===",

		// Not an opening sequence
		"#######Installation",
		"Installation ####### Configuration",
		"###### ####### Installation",
		"#######\u00A0Installation", // a no-break space doesn't delimit an opening sequence
		"#######*Installation*",

		// Escapes and character references
		"\\####### Installation",
		"&#35;###### Installation",

		// Code
		"```md\n####### Installation\n```",
		"    ####### Installation",

		// InlineCode
		"`####### Installation`",

		// HTML
		"<div>\n####### Installation\n</div>",

		// Continuation line that can't open a heading
		"foo\n    ####### bar", // four spaces of indentation are too many for a heading
		"> foo\n>     ####### bar", // the block quote marker eats one space, leaving four
		"10. Intro\n        ####### Heading", // four spaces of list item indentation plus four more
		"foo\n\t####### bar", // a tab reaches the next tab stop, so it counts as four columns
		"-    foo\n    ####### bar", // the list item needs five columns, so this is a lazy continuation line indented by four
		"-\tfoo\n\t\t####### bar", // the first tab is the list item's indentation, the second is four more columns

		// Line separator (U+2028) and paragraph separator (U+2029) aren't Markdown line
		// endings, so the hash characters stay in the middle of a line
		"Installation\u2028####### Configuration",
		"Installation\u2029####### Configuration",

		// Block quote
		"> foo\n> ###### hi\n> bar",
		// Deeply nested block quotes without hash characters must not trigger
		// exponential backtracking in the block quote marker prefix
		`${"> ".repeat(30)}foo\n${"> ".repeat(30)}bar`,

		// GFM
		{
			code: "###### Installation",
			language: "markdown/gfm",
		},
		{
			code: "#######Installation",
			language: "markdown/gfm",
		},
		{
			code: "| ####### Installation |\n| --- |",
			language: "markdown/gfm",
		},
	],

	invalid: [
		// Basic
		{
			code: "####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### Installation",
						},
					],
				},
			],
		},
		{
			code: "######## Configuration",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "8" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "########",
								maxDepthHashes: "######",
							},
							output: "###### Configuration",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\######## Configuration",
						},
					],
				},
			],
		},
		{
			code: "#######\tInstallation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "######\tInstallation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\#######\tInstallation",
						},
					],
				},
			],
		},
		{
			code: "#######",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "######",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\#######",
						},
					],
				},
			],
		},
		{
			code: "####### ",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### ",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### ",
						},
					],
				},
			],
		},
		{
			code: "#######\nInstallation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "######\nInstallation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\#######\nInstallation",
						},
					],
				},
			],
		},
		{
			code: "#######\r\nInstallation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "######\r\nInstallation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\#######\r\nInstallation",
						},
					],
				},
			],
		},
		{
			code: "####### Installation #######",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### Installation #######",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### Installation #######",
						},
					],
				},
			],
		},
		{
			code: "####### **Installation**",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### **Installation**",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### **Installation**",
						},
					],
				},
			],
		},
		{
			code: "####### Installation\nRun the following command.",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### Installation\nRun the following command.",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### Installation\nRun the following command.",
						},
					],
				},
			],
		},
		{
			code: dedent`####### Installation

			######## Configuration`,
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### Installation\n\n######## Configuration",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### Installation\n\n######## Configuration",
						},
					],
				},
				{
					messageId: "headingLikeParagraph",
					data: { count: "8" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 9,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "########",
								maxDepthHashes: "######",
							},
							output: "####### Installation\n\n###### Configuration",
						},
						{
							messageId: "escapeLeadingHash",
							output: "####### Installation\n\n\\######## Configuration",
						},
					],
				},
			],
		},

		// Indent
		{
			code: "   ####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 11,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "   ###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "   \\####### Installation",
						},
					],
				},
			],
		},

		// Continuation line
		{
			code: "Some paragraph text.\n####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "Some paragraph text.\n###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "Some paragraph text.\n\\####### Installation",
						},
					],
				},
			],
		},
		{
			code: "Some paragraph\r\n####### Heading",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "Some paragraph\r\n###### Heading",
						},
						{
							messageId: "escapeLeadingHash",
							output: "Some paragraph\r\n\\####### Heading",
						},
					],
				},
			],
		},
		{
			code: "Some paragraph\r####### Heading",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "Some paragraph\r###### Heading",
						},
						{
							messageId: "escapeLeadingHash",
							output: "Some paragraph\r\\####### Heading",
						},
					],
				},
			],
		},
		{
			code: "Some paragraph text.\n   ####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 4,
					endLine: 2,
					endColumn: 11,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "Some paragraph text.\n   ###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "Some paragraph text.\n   \\####### Installation",
						},
					],
				},
			],
		},
		{
			code: "Some paragraph text.\n####### Installation\n####### Configuration",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "Some paragraph text.\n###### Installation\n####### Configuration",
						},
						{
							messageId: "escapeLeadingHash",
							output: "Some paragraph text.\n\\####### Installation\n####### Configuration",
						},
					],
				},
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "Some paragraph text.\n####### Installation\n###### Configuration",
						},
						{
							messageId: "escapeLeadingHash",
							output: "Some paragraph text.\n####### Installation\n\\####### Configuration",
						},
					],
				},
			],
		},

		// Blockquote
		{
			code: "> ####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 10,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "> ###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "> \\####### Installation",
						},
					],
				},
			],
		},
		{
			code: "> > ####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "> > ###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "> > \\####### Installation",
						},
					],
				},
			],
		},

		{
			code: "> foo\n> ####### hi\n> bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 3,
					endLine: 2,
					endColumn: 10,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "> foo\n> ###### hi\n> bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "> foo\n> \\####### hi\n> bar",
						},
					],
				},
			],
		},
		{
			code: "> > foo\n> > ####### hi",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "> > foo\n> > ###### hi",
						},
						{
							messageId: "escapeLeadingHash",
							output: "> > foo\n> > \\####### hi",
						},
					],
				},
			],
		},
		{
			code: "> foo\n####### hi",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "> foo\n###### hi",
						},
						{
							messageId: "escapeLeadingHash",
							output: "> foo\n\\####### hi",
						},
					],
				},
			],
		},

		// List item
		{
			code: "- ####### Installation",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 10,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "- ###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "- \\####### Installation",
						},
					],
				},
			],
		},
		{
			code: "- Installation\n\n  ####### Configuration",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 10,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "- Installation\n\n  ###### Configuration",
						},
						{
							messageId: "escapeLeadingHash",
							output: "- Installation\n\n  \\####### Configuration",
						},
					],
				},
			],
		},
		{
			// the four spaces are the list item's indentation, not paragraph indentation
			code: "10. Intro\n    ####### Heading",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "10. Intro\n    ###### Heading",
						},
						{
							messageId: "escapeLeadingHash",
							output: "10. Intro\n    \\####### Heading",
						},
					],
				},
			],
		},
		{
			code: "- a\n  - b\n    ####### c",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "- a\n  - b\n    ###### c",
						},
						{
							messageId: "escapeLeadingHash",
							output: "- a\n  - b\n    \\####### c",
						},
					],
				},
			],
		},
		{
			code: "> - foo\n>   ####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "> - foo\n>   ###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "> - foo\n>   \\####### bar",
						},
					],
				},
			],
		},
		{
			code: "- - foo\n    ####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "- - foo\n    ###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "- - foo\n    \\####### bar",
						},
					],
				},
			],
		},
		{
			code: "- foo\n####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "- foo\n###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "- foo\n\\####### bar",
						},
					],
				},
			],
		},
		{
			code: "-     code\n\n  foo\n  ####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 4,
					column: 3,
					endLine: 4,
					endColumn: 10,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "-     code\n\n  foo\n  ###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "-     code\n\n  foo\n  \\####### bar",
						},
					],
				},
			],
		},
		{
			code: "-\n  foo\n  ####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 10,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "-\n  foo\n  ###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "-\n  foo\n  \\####### bar",
						},
					],
				},
			],
		},

		// Tabs count toward the columns a container consumes
		{
			code: "- foo\n\t####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 9,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "- foo\n\t###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "- foo\n\t\\####### bar",
						},
					],
				},
			],
		},
		{
			code: "-\tfoo\n\t####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 9,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "-\tfoo\n\t###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "-\tfoo\n\t\\####### bar",
						},
					],
				},
			],
		},
		{
			code: "10. foo\n\t####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 9,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "10. foo\n\t###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: "10. foo\n\t\\####### bar",
						},
					],
				},
			],
		},
		{
			// the block quote marker takes one column of each tab, leaving two for the list item
			code: ">\t- foo\n>\t  ####### bar",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: ">\t- foo\n>\t  ###### bar",
						},
						{
							messageId: "escapeLeadingHash",
							output: ">\t- foo\n>\t  \\####### bar",
						},
					],
				},
			],
		},

		// GFM
		{
			code: "####### Installation",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "###### Installation",
						},
						{
							messageId: "escapeLeadingHash",
							output: "\\####### Installation",
						},
					],
				},
			],
		},
		{
			code: dedent`[^note]: ####### Installation

			Text[^note]`,
			language: "markdown/gfm",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 17,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "[^note]: ###### Installation\n\nText[^note]",
						},
						{
							messageId: "escapeLeadingHash",
							output: "[^note]: \\####### Installation\n\nText[^note]",
						},
					],
				},
			],
		},
		{
			// the four spaces are the footnote definition's indentation
			code: dedent`[^note]: Intro
			    ####### Heading

			Text[^note]`,
			language: "markdown/gfm",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 12,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "[^note]: Intro\n    ###### Heading\n\nText[^note]",
						},
						{
							messageId: "escapeLeadingHash",
							output: "[^note]: Intro\n    \\####### Heading\n\nText[^note]",
						},
					],
				},
			],
		},
		{
			code: "[^note]: Intro\n\t####### Heading\n\nText[^note]",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 9,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "[^note]: Intro\n\t###### Heading\n\nText[^note]",
						},
						{
							messageId: "escapeLeadingHash",
							output: "[^note]: Intro\n\t\\####### Heading\n\nText[^note]",
						},
					],
				},
			],
		},
		{
			code: "[^note]: - foo\n      ####### bar\n\nText[^note]",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 7,
					endLine: 2,
					endColumn: 14,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "[^note]: - foo\n      ###### bar\n\nText[^note]",
						},
						{
							messageId: "escapeLeadingHash",
							output: "[^note]: - foo\n      \\####### bar\n\nText[^note]",
						},
					],
				},
			],
		},
		{
			code: "[^note]: > - foo\n    >   ####### bar\n\nText[^note]",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "headingLikeParagraph",
					data: { count: "7" },
					line: 2,
					column: 9,
					endLine: 2,
					endColumn: 16,
					suggestions: [
						{
							messageId: "useMaxDepthHashes",
							data: {
								hashes: "#######",
								maxDepthHashes: "######",
							},
							output: "[^note]: > - foo\n    >   ###### bar\n\nText[^note]",
						},
						{
							messageId: "escapeLeadingHash",
							output: "[^note]: > - foo\n    >   \\####### bar\n\nText[^note]",
						},
					],
				},
			],
		},
	],
});
