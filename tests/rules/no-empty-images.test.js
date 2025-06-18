/**
 * @fileoverview Tests for no-empty-images rule.
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-empty-images.js";
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

ruleTester.run("no-empty-images", rule, {
	valid: ["![foo](bar)", "![foo](#bar)", "![foo](http://bar.com/image.png)"],
	invalid: [
		{
			code: "![]()",
			errors: [
				{
					messageId: "emptyImage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "![](#)",
			errors: [
				{
					messageId: "emptyImage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "![foo]()",
			errors: [
				{
					messageId: "emptyImage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "![foo](#)",
			errors: [
				{
					messageId: "emptyImage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "![foo]( )",
			errors: [
				{
					messageId: "emptyImage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
	],
});
