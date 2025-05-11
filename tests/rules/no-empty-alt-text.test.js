/**
 * @fileoverview Tests for no-empty-alt-text rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-empty-alt-text.js";
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

ruleTester.run("no-empty-alt-text", rule, {
	valid: [
		"![Alternate text](image.jpg)",
		'![Alternate text](image.jpg "Title")',
		dedent`
		![Alternate text][notitle]

		[notitle]: image.jpg`,
		dedent`
		![Alternate text][title]

		[title]: image.jpg "Title"`,
		"[![Alternate text](image.jpg)](image.jpg)",
	],
	invalid: [
		{
			code: "![ ](image.jpg)",
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "![](image.jpg)",
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: '![](image.jpg "Title")',
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "Image without alternate text ![](image.jpg) in a sentence.",
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: dedent`
			![][notitle]

			[notitle]: image.jpg`,
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
			![][title]

			[title]: image.jpg "Title"`,
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "[![](image.jpg)](image.jpg)",
			errors: [
				{
					messageId: "emptyAltText",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
	],
});
