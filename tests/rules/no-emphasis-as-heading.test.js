/**
 * @fileoverview Test for `no-emphasis-as-heading.ts`.
 * @author lumir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-emphasis-as-heading.js";
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

ruleTester.run("no-emphasis-as-heading", rule, {
	valid: [
		// Basic
		{
			name: "Empty",
			code: "",
		},
		{
			name: "Empty string",
			code: "  ",
		},
		{
			name: "Paragraph without bolded text",
			code: "#Book\n\nFirst Chapter\n\nContent\n\nSecond Chapter\n\nContent",
		},
		{
			name: "Paragraph with bolded text and other text",
			code: "**Hello** World.\n\nHello **World**.",
		},
		{
			name: "Paragraph with bolded text and other multiline text",
			code: "**Hello**\nWorld.\n\nHello\n**World**.",
		},
		{
			name: "Bold with whitespace inside",
			code: "** Not fully bolded paragraph **",
		},
		{
			name: "Multiple bold elements comprising entire paragraph",
			code: "**First part** **second part**",
		},

		// ListItem
		{
			name: "Bold text in list item",
			code: "- **List item**\n- __List item__",
		},
	],

	invalid: [
		// Basic
		{
			name: "Paragraph with fully bolded text",
			code: "#Book\n\n**First Chapter**\n\nContent\n\n__Second Chapter__\n\nContent",
			errors: [
				{
					messageId: "noEmphasisAsHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
				{
					messageId: "noEmphasisAsHeading",
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 19,
				},
			],
		},
		{
			name: "Paragraph with fully bolded single character",
			code: "**X**",
			errors: [
				{
					messageId: "noEmphasisAsHeading",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},

		// Blockquote
		{
			name: "Bold text in blockquote",
			code: "> **Blockquote**",
			errors: [
				{
					messageId: "noEmphasisAsHeading",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
	],
});
