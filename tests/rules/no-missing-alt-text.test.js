/**
 * @fileoverview Tests for no-missing-alt-text rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-alt-text.js";
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

ruleTester.run("no-missing-alt-text", rule, {
	valid: [
		"![Alternative text](image.jpg)",
		'![Alternative text](image.jpg "Title")',
		dedent`
		![Alternative text][notitle]

		[notitle]: image.jpg`,
		dedent`
		![Alternative text][title]

		[title]: image.jpg "Title"`,
		"[![Alternative text](image.jpg)](image.jpg)",
		'<img src="image.png" alt="Descriptive text" />',
		'<img src="image.png" alt />',
		'<img src="image.png" alt="" />',
		"<img src=\"image.png\" alt='' />",
		'<IMG SRC="image.png" ALT="Descriptive text"/>',
		'<img src="image.png" aria-hidden="true"/>',
		'<img src="image.png" ARIA-HIDDEN="TRUE" />',
		'<p><img src="image.png" alt="Descriptive text" /></p>',
	],
	invalid: [
		{
			code: "![ ](image.jpg)",
			errors: [
				{
					messageId: "missingAltText",
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
					messageId: "missingAltText",
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
					messageId: "missingAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "Image without an alternative text ![](image.jpg) in a sentence.",
			errors: [
				{
					messageId: "missingAltText",
					line: 1,
					column: 35,
					endLine: 1,
					endColumn: 49,
				},
			],
		},
		{
			code: dedent`
			![][notitle]

			[notitle]: image.jpg`,
			errors: [
				{
					messageId: "missingAltText",
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
					messageId: "missingAltText",
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
					messageId: "missingAltText",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: '<img src="image.png" />',
			errors: [
				{
					messageId: "missingAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: '<IMG SRC="image.png" />',
			errors: [
				{
					messageId: "missingAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: '<img src="image.png" alt=" " />',
			errors: [
				{
					messageId: "missingAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 32,
				},
			],
		},
		{
			code: dedent`
			<p>
			<img src="image.png" />
			</p>
			`,
			errors: [
				{
					messageId: "missingAltText",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 24,
				},
			],
		},
		{
			code: dedent`
			<p>
			<img src="image.png" />
			<img src="image2.png" />
			</p>
			`,
			errors: [
				{
					messageId: "missingAltText",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 24,
				},
				{
					messageId: "missingAltText",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 25,
				},
			],
		},
		{
			code: '<img src="image.png" aria-hidden="false"/>',
			errors: [
				{
					messageId: "missingAltText",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: dedent`
			<img
			src="image.png" />
  			`,
			errors: [
				{
					messageId: "missingAltText",
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
	],
});
