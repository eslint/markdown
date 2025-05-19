/**
 * @fileoverview Tests for no-duplicate-definitions rule.
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-definitions.js";
import markdown from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/gfm",
});

ruleTester.run("no-duplicate-definitions", rule, {
	valid: [
		`
[mercury]: https://example.com/mercury/
`,

		`
[mercury]: https://example.com/mercury/
[venus]: https://example.com/venus/
`,

		`
[^mercury]: Hello, Mercury!
`,

		`
[^mercury]: Hello, Mercury!
[^venus]: Hello, Venus!
`,

		`
[alpha]: bravo

[^alpha]: bravo
`,

		`
[//]: # (This is a comment 1)
[//]: <> (This is a comment 2)
`,

		{
			code: `
[mercury]: https://example.com/mercury/
[mercury]: https://example.com/venus/
`,
			options: [
				{
					allowDefinitions: ["mercury"],
				},
			],
		},

		{
			code: `
[^mercury]: Hello, Mercury!
[^mercury]: Hello, Venus!
`,
			options: [
				{
					allowFootnoteDefinitions: ["mercury"],
				},
			],
		},
	],

	invalid: [
		{
			code: `
[mercury]: https://example.com/mercury/
[mercury]: https://example.com/venus/
`,
			errors: [
				{
					messageId: "duplicateDefinition",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
			],
		},

		{
			code: `
[mercury]: https://example.com/mercury/
[mercury]: https://example.com/venus/
[mercury]: https://example.com/earth/
[mercury]: https://example.com/mars/
`,
			errors: [
				{
					messageId: "duplicateDefinition",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
				{
					messageId: "duplicateDefinition",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 38,
				},
				{
					messageId: "duplicateDefinition",
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 37,
				},
			],
		},

		{
			code: `
[mercury]: https://example.com/mercury/
[mercury]: https://example.com/venus/
`,
			options: [
				{
					allowDefinitions: ["venus"],
					allowFootnoteDefinitions: ["mercury"],
				},
			],

			errors: [
				{
					messageId: "duplicateDefinition",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
			],
		},

		{
			code: `
[^mercury]: Hello, Mercury!
[^mercury]: Hello, Venus!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinition",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 26,
				},
			],
		},

		{
			code: `
[^mercury]: Hello, Mercury!
[^mercury]: Hello, Venus!
`,
			options: [
				{
					allowDefinitions: ["mercury"],
					allowFootnoteDefinitions: ["venus"],
				},
			],

			errors: [
				{
					messageId: "duplicateFootnoteDefinition",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 26,
				},
			],
		},

		{
			code: `
[mercury]: https://example.com/mercury/
[earth]: https://example.com/earth/
[mars]: https://example.com/mars/

[//]: # (comment about mars)

[jupiter]: https://example.com/jupiter/

[//]: # (comment about jupiter)

[mercury]: https://example.com/venus/
`,
			errors: [
				{
					messageId: "duplicateDefinition",
					line: 12,
					column: 1,
					endLine: 12,
					endColumn: 38,
				},
			],
		},
	],
});
