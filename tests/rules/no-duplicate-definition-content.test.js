/**
 * @fileoverview Tests for no-duplicate-definition-content rule.
 * @author sethamus
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-definition-content.js";
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

ruleTester.run("no-duplicate-definition-content", rule, {
	valid: [
		`
[mercury]: https://example.com/mercury/
[venus]: https://example.com/venus/
`,
		`
[^mercury]: Hello, Mercury!
[^venus]: Hello, Venus!
`,
		`
[alpha]: bravo

[^charlie]: bravo
`,
		`
[mercury]: https://example.com/mercury/
[Mercury]: https://example.com/mercury/
`,
		`
[^mercury]: Hello, Mercury!
[^Mercury]: Hello, Mercury!
`,
		`
[mercury]: https://example.com/mercury/
[venus]: https://example.com/Mercury/
`,
		`
[mercury]: <>
[venus]: <>
`,
		`
[^mercury]:
[^venus]:
`,
		`
[//]: # (This is a comment)
[top]: #
`,
		`
[^mercury]: [Mercury](https://example.com/mercury/)
[^venus]: [Mercury](https://example.com/venus/)
`,
		`
[^mercury]: > Hello,
    >
    > Mercury!

[^venus]: > Hello,

    Mercury!
`,
		{
			code: `
[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/
`,
			options: [
				{
					allowDefinitions: ["venus"],
				},
			],
		},
		{
			code: `
[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/
`,
			options: [
				{
					allowDefinitions: ["VENUS"],
				},
			],
		},
		{
			code: `
[mercury]: https://example.com/mercury/
[   venus   ]: https://example.com/mercury/
`,
			options: [
				{
					allowDefinitions: ["venus"],
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
`,
			options: [
				{
					allowFootnoteDefinitions: ["venus"],
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
`,
			options: [
				{
					allowFootnoteDefinitions: ["VENUS"],
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^VENUS]: Hello, Mercury!
`,
			options: [
				{
					allowFootnoteDefinitions: ["venus"],
				},
			],
		},
	],
	invalid: [
		{
			code: `
[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[venus]: https://example.com/mercury/
[earth]: https://example.com/mercury/
[mars]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "earth",
						label: "earth",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 38,
				},
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "mars",
						label: "mars",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[Mercury]: https://example.com/mercury/
[VENUS]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "VENUS",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "Mercury",
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
[   mercury   ]: https://example.com/mercury/
[venus    ]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[mercury]: https://example.com/mercury/ "Mercury"
[venus]: https://example.com/mercury/ "Venus"
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 46,
				},
			],
		},
		{
			code: `
[mercury]: https://example.com/mercury/
[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 38,
				},
			],
		},
		{
			code: `
[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/
`,
			options: [
				{
					allowDefinitions: ["earth"],
					allowFootnoteDefinitions: ["venus"],
				},
			],
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[^mercury]: mercury
[^venus]: mercury
`,
			language: "markdown/commonmark",
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "^venus",
						label: "^venus",
						firstLine: "2",
						firstIdentifier: "^mercury",
						firstLabel: "^mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[^venus]: Hello, Mercury!
[^earth]: Hello, Mercury!
[^mars]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 26,
				},
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "earth",
						label: "earth",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 26,
				},
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "mars",
						label: "mars",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[^Mercury]: Hello, Mercury!
[^VENUS]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "VENUS",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "Mercury",
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
[^mercury]: *Hello*, [Mercury](https://example.com/mercury/)!
[^venus]: _Hello_, [Mercury](<https://example.com/mercury/>)!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 62,
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 26,
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!

[^earth]: Hello, Earth!

    [^venus]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 6,
					column: 5,
					endLine: 6,
					endColumn: 30,
				},
			],
		},
		{
			code: `
[^mercury]: Hello

    [^venus]: World

[^earth]: Hello

    [^mars]: World
`,
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "mars",
						label: "mars",
						firstLine: "4",
						firstIdentifier: "venus",
						firstLabel: "venus",
					},
					line: 8,
					column: 5,
					endLine: 8,
					endColumn: 19,
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
`,
			options: [
				{
					allowDefinitions: ["venus"],
					allowFootnoteDefinitions: ["earth"],
				},
			],
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
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
[venus]: https://example.com/mercury/
[earth]: https://example.com/mercury/
`,
			options: [
				{
					allowDefinitions: ["mercury"],
				},
			],
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "earth",
						label: "earth",
						firstLine: "3",
						firstIdentifier: "venus",
						firstLabel: "venus",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 38,
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
[^earth]: Hello, Mercury!
`,
			options: [
				{
					allowFootnoteDefinitions: ["mercury"],
				},
			],
			errors: [
				{
					messageId: "duplicateFootnoteDefinitionContent",
					data: {
						identifier: "earth",
						label: "earth",
						firstLine: "3",
						firstIdentifier: "venus",
						firstLabel: "venus",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 26,
				},
			],
		},
		{
			code: `
[^mercury]: Hello, Mercury!

    [mercury]: https://example.com/mercury/

[venus]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "4",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 38,
				},
			],
		},
		{
			code: `
[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/

[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!
`,
			options: [
				{
					checkFootnoteDefinitions: false,
				},
			],
			errors: [
				{
					messageId: "duplicateDefinitionUrl",
					data: {
						identifier: "venus",
						label: "venus",
						firstLine: "2",
						firstIdentifier: "mercury",
						firstLabel: "mercury",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
			],
		},
	],
});
