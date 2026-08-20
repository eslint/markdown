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
		"`####### Installation`",

		// HTML
		"<div>\n####### Installation\n</div>",

		// Paragraph continuation line
		"Installation\n####### Configuration",

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
	],
});
