/**
 * @fileoverview Tests for no-multiple-h1 rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-multiple-h1.js";
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

ruleTester.run("no-multiple-h1", rule, {
	valid: [
		"# Only one h1",
		dedent`
			# Heading 1
			Text
		`,
		dedent`
			# Heading 1
			## Heading 2
		`,
		dedent`
			Only one h1
			===========
		`,
		dedent`
			Heading 1
			==========
			Text
		`,
		dedent`
			Heading 1
			==========
			Heading 2
			----------
		`,
		dedent`
			# Heading 1
			\`\`\`markdown
			# Heading 1-2
			\`\`\`
		`,
	],
	invalid: [
		{
			code: dedent`
				# Heading 1
				# Another H1
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				Another H1
				==========
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 1,
					endLine: 3,
					endColumn: 11,
				},
			],
		},
		{
			code: dedent`
				Another H1
				==========
				# Heading 1
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 12,
				},
			],
		},
	],
});
