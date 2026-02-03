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
		{
			code: `
[MERCURY]: https://example.com/mercury/
[mercury]: https://example.com/venus/
`,
			options: [
				{
					allowDefinitions: ["MERCURY"],
				},
			],
		},
		{
			code: `
[mercury]: https://example.com/mercury/
[MERCURY]: https://example.com/venus/
`,
			options: [
				{
					allowDefinitions: ["mercury"],
				},
			],
		},
		{
			code: `
[   mercury   ]: https://example.com/mercury/
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
[mercury]: https://example.com/mercury/
[   mercury   ]: https://example.com/venus/
`,
			options: [
				{
					allowDefinitions: ["   mercury   "],
				},
			],
		},
		{
			code: `
[foo bar]: https://example.com/foo-bar/
[foo bar]: https://example.com/foo-bar/
`,
			options: [
				{
					allowDefinitions: ["foo\t\r\nbar"],
				},
			],
		},
		{
			code: `
[^MERCURY]: Hello, Mercury!
[^mercury]: Hello, Venus!
`,
			options: [
				{
					allowFootnoteDefinitions: ["MERCURY"],
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^MERCURY]: Hello, Venus!
`,
			options: [
				{
					allowFootnoteDefinitions: ["mercury"],
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
					checkFootnoteDefinitions: false,
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
					checkFootnoteDefinitions: true,
					allowFootnoteDefinitions: ["mercury"],
				},
			],
		},
		// This test case is skipped when running on Bun
		...(!process.versions.bun
			? [
					{
						code: `
						[Grüsse]: https://example.com/
						[Grüsse]: https://example.com/
						`,
						options: [{ allowDefinitions: ["GRÜẞE"] }],
					},
					{
						code: `
						[^Grüsse]: Grüsse
						[^Grüsse]: Grüsse
						`,
						options: [{ allowFootnoteDefinitions: ["GRÜẞE"] }],
					},
				]
			: []),
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
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
				{
					messageId: "duplicateDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 38,
				},
				{
					messageId: "duplicateDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
[Mercury]: https://example.com/venus/
`, // case insensitive
			errors: [
				{
					messageId: "duplicateDefinition",
					data: {
						identifier: "mercury",
						label: "Mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
[mercury    ]: https://example.com/venus/
`,
			errors: [
				{
					messageId: "duplicateDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 42,
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
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
[^mercury]: Hello, Earth!
[^mercury]: Hello, Mars!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 26,
				},
				{
					messageId: "duplicateFootnoteDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 26,
				},
				{
					messageId: "duplicateFootnoteDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 25,
				},
			],
		},

		{
			code: `
[^mercury]: Hello, Mercury!
[^Mercury]: Hello, Venus!
`, // case insensitive
			errors: [
				{
					messageId: "duplicateFootnoteDefinition",
					data: {
						identifier: "mercury",
						label: "Mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
					checkFootnoteDefinitions: true,
				},
			],

			errors: [
				{
					messageId: "duplicateFootnoteDefinition",
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
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
					data: {
						identifier: "mercury",
						label: "mercury",
						firstLine: "2",
						firstLabel: "mercury",
					},
					line: 12,
					column: 1,
					endLine: 12,
					endColumn: 38,
				},
			],
		},
	],
});
