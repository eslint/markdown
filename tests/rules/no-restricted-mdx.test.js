/**
 * @fileoverview Tests for no-restricted-mdx rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-restricted-mdx.js";
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
	languageOptions: {
		mdx: true,
	},
});

const code = `
import { SomeComponent } from "some-library";
export const someVariable = 42;

# This is a valid MDX

<SomeComponent>
This is some content inside a component.
</SomeComponent>
`.trimStart();

ruleTester.run("no-restricted-mdx", rule, {
	valid: [code],
	invalid: [
		{
			code,
			options: [{ disallowJSX: true }],
			errors: [
				{
					messageId: "disallowedJSX",
					line: 6,
					column: 1,
					endLine: 8,
					endColumn: 17,
				},
			],
		},
		{
			code,
			options: [{ disallowESMImports: true }],
			errors: [
				{
					messageId: "disallowedESMImport",
					line: 6,
					column: 1,
					endLine: 8,
					endColumn: 17,
				},
			],
		},
	],
});
