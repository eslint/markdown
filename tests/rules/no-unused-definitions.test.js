/**
 * @fileoverview Tests for no-unused-definitions rule.
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-unused-definitions.js";
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

ruleTester.run("no-unused-definitions", rule, {
	valid: [
		"",
		"   ",
		`
[Mercury][mercury]

[mercury]: https://example.com/mercury/
`, // Link - full
		`
[mercury][]

[mercury]: https://example.com/mercury/
`, // Link - collapsed
		`
[mercury]

[mercury]: https://example.com/mercury/
`, // Link - shortcut
		`
[Mercury][mercury]

[mercury]: https://example.com/mercury/
[Mercury]: https://example.com/venus/
`, // case insensitive
		`
[Mercury][mercury]        

[mercury]: https://example.com/mercury/
[   mercury       ]: https://example.com/venus/
`, // with extra spaces
		`
![Venus Image][venus]

[venus]: https://example.com/venus.jpg        
`, // Image - full
		`
![venus][]

[venus]: https://example.com/venus.jpg
`, // Image - collapsed
		`
![venus]

[venus]: https://example.com/venus.jpg
`, // Image - shortcut
		`
Mercury[^mercury]

[^mercury]: Hello, Mercury!
`,
		`
Mercury[^mercury]

[^mercury]: Hello, Mercury!
[^Mercury]: Hello, Venus!
`, // case insensitive
		`
Mercury[^mercury]

[^mercury]: https://example.com/mercury/
[    ^mercury       ]: https://example.com/venus/
`, // with extra spaces
		`
[//]: # (This is a comment 1)
[//]: <> (This is a comment 2)
`,
		`
[Alpha][alpha] and [Alpha][^alpha]

[alpha]: bravo

[^alpha]: bravo
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
			code: "[MERCURY]: https://example.com/mercury/",
			options: [
				{
					allowDefinitions: ["MERCURY"],
				},
			],
		},
		{
			code: "[mercury]: https://example.com/mercury/",
			options: [
				{
					allowDefinitions: ["MERCURY"],
				},
			],
		},
		{
			code: "[MERCURY]: https://example.com/mercury/",
			options: [
				{
					allowDefinitions: ["mercury"],
				},
			],
		},
		{
			code: "[   mercury   ]: https://example.com/mercury/",
			options: [
				{
					allowDefinitions: ["mercury"],
				},
			],
		},
		{
			code: "[mercury]: https://example.com/mercury/",
			options: [
				{
					allowDefinitions: ["   mercury   "],
				},
			],
		},
		{
			code: "[foo bar]: https://example.com/foo-bar/",
			options: [
				{
					allowDefinitions: ["foo\t\r\nbar"],
				},
			],
		},
		{
			code: "[^MERCURY]: Hello, Mercury!",
			options: [
				{
					allowFootnoteDefinitions: ["MERCURY"],
				},
			],
		},
		{
			code: "[^mercury]: Hello, Mercury!",
			options: [
				{
					allowFootnoteDefinitions: ["MERCURY"],
				},
			],
		},
		{
			code: "[^MERCURY]: Hello, Mercury!",
			options: [
				{
					allowFootnoteDefinitions: ["mercury"],
				},
			],
		},
		{
			code: "[^mercury]: Hello, Mercury!",
			options: [
				{
					allowFootnoteDefinitions: ["   mercury   "],
				},
			],
		},
		// This test case is skipped for non-Node environments like Bun
		...(typeof process !== "undefined" &&
		process.release?.name === "node" &&
		!process.versions?.bun
			? [
					{
						code: "[Grüsse]: https://example.com/",
						options: [
							{
								allowDefinitions: ["GRÜẞE"],
							},
						],
					},
					{
						code: "[^Grüsse]: Grüsse",
						options: [
							{
								allowFootnoteDefinitions: ["GRÜẞE"],
							},
						],
					},
				]
			: []),
	],

	invalid: [
		{
			code: `
[mercury]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "unusedDefinition",
					data: { identifier: "mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 40,
				},
			],
		},

		{
			code: `
[Mercury]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "unusedDefinition",
					data: { identifier: "Mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 40,
				},
			],
		},

		{
			code: `
[  Mercury  ]: https://example.com/mercury/
`,
			errors: [
				{
					messageId: "unusedDefinition",
					data: { identifier: "Mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 44,
				},
			],
		},

		{
			code: `
[mercury]: https://example.com/mercury/
[mercury]: https://example.com/venus/
[mercury]: https://example.com/earth/
`,
			errors: [
				{
					messageId: "unusedDefinition",
					data: { identifier: "mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 40,
				},
				{
					messageId: "unusedDefinition",
					data: { identifier: "mercury" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
				{
					messageId: "unusedDefinition",
					data: { identifier: "mercury" },
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
`,
			options: [
				{
					allowDefinitions: ["venus"],
					allowFootnoteDefinitions: ["mercury"],
				},
			],

			errors: [
				{
					messageId: "unusedDefinition",
					data: { identifier: "mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 40,
				},
			],
		},

		{
			code: `
[^mercury]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "unusedFootnoteDefinition",
					data: { identifier: "mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 28,
				},
			],
		},

		{
			code: `
[^Mercury]: Hello, Mercury!
`,
			errors: [
				{
					messageId: "unusedFootnoteDefinition",
					data: { identifier: "Mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 28,
				},
			],
		},

		{
			code: `
[^mercury]: Hello, Mercury!
[^mercury]: Hello, Venus!
[^mercury]: Hello, Earth!
`,
			errors: [
				{
					messageId: "unusedFootnoteDefinition",
					data: { identifier: "mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 28,
				},
				{
					messageId: "unusedFootnoteDefinition",
					data: { identifier: "mercury" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 26,
				},
				{
					messageId: "unusedFootnoteDefinition",
					data: { identifier: "mercury" },
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
`,
			options: [
				{
					allowDefinitions: ["mercury"],
					allowFootnoteDefinitions: ["venus"],
				},
			],

			errors: [
				{
					messageId: "unusedFootnoteDefinition",
					data: { identifier: "mercury" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 28,
				},
			],
		},

		{
			code: `
Hello, [Mercury][mercury]! 
I am living on [Earth][earth] and I am going to [Mars][mars].

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
					messageId: "unusedDefinition",
					data: { identifier: "jupiter" },
					line: 11,
					column: 1,
					endLine: 11,
					endColumn: 40,
				},
			],
		},
	],
});
