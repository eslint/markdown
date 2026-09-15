/**
 * @fileoverview Tests for no-empty-images rule.
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import ruleTester from "./_utils/rule-tester.js";
import rule from "../../src/rules/no-empty-images.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

ruleTester("no-empty-images", rule, {
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
