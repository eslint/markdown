/**
 * @fileoverview Tests for no-reference-like-url rule.
 * @author TKDev7
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-reference-like-url.js";
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

ruleTester.run("no-reference-like-url", rule, {
	valid: [
		"[Mercury](https://example.com/mercury/)",
		'[Mercury](https://example.com/mercury/ "Go to Mercury")',
		"![Venus](https://example.com/venus/)",
		'![Venus](https://example.com/venus/ "Go to Venus")',
		"[text][mercury]",
		"[mercury]: https://example.com/mercury/",
		dedent`
			[Mercury](mercury) is the first planet.

			[venus]: https://example.com/venus/
		`,
		dedent`
			[Planet 1](https://example.com/planet1/)
			[Planet 2](https://example.com/planet2/)

			[planet1]: https://example.com/planet1/
			[planet2]: https://example.com/planet2/
		`,
		dedent`
			\`[Mercury](mercury) is the first planet.\`
			\`![Mercury](mercury) is the first planet.\`

			[mercury]: https://example.com/mercury/
		`,
		dedent`
			\`\`\`markdown
			[Mercury](mercury)
			![Mercury](mercury)

			[mercury]: https://example.com/mercury/
			\`\`\`
		`,
		dedent`
			<div>[Mercury](mercury)</div>

			<div>![Mercury](mercury)</div>

			[mercury]: https://example.com/mercury/
		`,
		dedent`
			\[Mercury](mercury)
			[Mercury\](mercury)
			![Mercury\](mercury)
			[Mercury]\(mercury)
			![Mercury]\(mercury)

			[mercury]: https://example.com/mercury/
		`,
		dedent`
			[foo bar](foo bar)
			![foo bar](foo bar)

			[foo bar]: https://example.com/foo-bar
		`,
		dedent`
		    [link](<uri>)
   		    [uri]: https://example.com/uri
		`,
		dedent`
			![image](<uri>)
			[uri]: https://example.com/uri
		`,
		{
			code: dedent`
				<http://foo>

				[http://foo]: hi
			`,
			language: "markdown/gfm",
		},
		{
			code: dedent`
				http://foo

				[http://foo]: hi
			`,
			language: "markdown/gfm",
		},
	],
	invalid: [
		{
			code: dedent`
				[Mercury](mercury)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][mercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[**Mercury**](mercury)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[**Mercury**][mercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: dedent`
				[Mercury](MERCURY)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][MERCURY]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[Mercury](MeRcUrY)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][MeRcUrY]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[Mercury](<mercury>)

				[<mercury>]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][<mercury>]

				[<mercury>]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus)

				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][venus]

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
				![Venus](VENUS)

				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][VENUS]

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
				![Venus](VeNuS)

				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][VeNuS]

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
				![Venus](<venus>)

				[<venus>]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][<venus>]

				[<venus>]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
				![**Mercury** is a planet](mercury)

				[mercury]: https://example.com/mercury.jpg
			`,
			output: dedent`
				![**Mercury** is a planet][mercury]

				[mercury]: https://example.com/mercury.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 36,
				},
			],
		},
		{
			code: dedent`
				![Mercury](mercury) is the first planet from the sun.

				[mercury]: https://example.com/mercury/
			`,
			output: dedent`
				![Mercury][mercury] is the first planet from the sun.

				[mercury]: https://example.com/mercury/
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury) is the first planet from the sun.

				[mercury]: https://example.com/mercury/
			`,
			output: dedent`
				[Mercury][mercury] is the first planet from the sun.

				[mercury]: https://example.com/mercury/
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[Planet 1](planet1) and [Planet 2](planet2) are neighbors.

				[planet1]: https://example.com/planet1/
				[planet2]: https://example.com/planet2/
			`,
			output: dedent`
				[Planet 1][planet1] and [Planet 2][planet2] are neighbors.

				[planet1]: https://example.com/planet1/
				[planet2]: https://example.com/planet2/
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 20,
				},
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury) is the first planet and ![Venus](venus) is the second.

				[mercury]: https://example.com/mercury
				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				[Mercury][mercury] is the first planet and ![Venus][venus] is the second.

				[mercury]: https://example.com/mercury
				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 44,
					endLine: 1,
					endColumn: 59,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury "")

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][mercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus "")

				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][venus]

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury '')

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][mercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus '')

				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][venus]

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury ())

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][mercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus ())

				[venus]: https://example.com/venus.jpg
			`,
			output: dedent`
				![Venus][venus]

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury "Go to Mercury")

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus "Venus Image")

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 30,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury 'Go to Mercury')

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus 'Venus Image')

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 30,
				},
			],
		},
		{
			code: dedent`
				[Mercury](mercury (Go to Mercury))

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: dedent`
				![Venus](venus (Venus Image))

				[venus]: https://example.com/venus.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 30,
				},
			],
		},
		{
			code: dedent`
				[Click Me
				](test)
				
				[test]: https://abc.com
			`,
			output: dedent`
				[Click Me
				][test]
				
				[test]: https://abc.com
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`
				![Click Me
				](test)
				
				[test]: https://abc.com
			`,
			output: dedent`
				![Click Me
				][test]
				
				[test]: https://abc.com
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`
				[Mercury](@mercury)
				![Mercury](@mercury)

				[@mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][@mercury]
				![Mercury][@mercury]

				[@mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 20,
				},
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 21,
				},
			],
		},
		// This test case is skipped for non-Node environments like Bun
		...(typeof process !== "undefined" &&
		process.release &&
		process.release.name === "node" &&
		(!process.versions || !process.versions.bun)
			? [
					{
						code: dedent`
						[link](GRÜẞE)
						
						[Grüsse]: https://example.com/
					`,
						output: dedent`
						[link][GRÜẞE]
						
						[Grüsse]: https://example.com/
					`,
						errors: [
							{
								messageId: "referenceLikeUrl",
								data: { type: "link", prefix: "" },
								line: 1,
								column: 1,
								endLine: 1,
								endColumn: 14,
							},
						],
					},
				]
			: []),
	],
});
