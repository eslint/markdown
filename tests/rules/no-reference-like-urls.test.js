/**
 * @fileoverview Tests for no-reference-like-urls rule.
 * @author TKDev7
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-reference-like-urls.js";
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

ruleTester.run("no-reference-like-urls", rule, {
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
		dedent`
				# Heading with [Mercury](mercury)
				# Heading with ![Mercury](mercury)

				[venus]: https://example.com/venus/
			`,
		dedent`
				# Heading with [Mercury][mercury]
				# Heading with ![Mercury][mercury]

				[mercury]: https://example.com/mercury
			`,
		dedent`
				Heading with [Mercury](mercury)
				===============================
				Heading with ![Mercury](mercury)
				================================

				[venus]: https://example.com/venus/
			`,
		dedent`
				Heading with [Mercury][mercury]
				===============================
				Heading with ![Mercury][mercury]
				================================

				[mercury]: https://example.com/mercury
			`,
		{
			code: dedent`
				| Planet  | Link                |
				|---------|---------------------|
				| Mercury | [Mercury](mercury)  |
				| Mercury | ![Mercury](mercury) |

				[venus]: https://example.com/venus/
			`,
			language: "markdown/gfm",
		},
		{
			code: dedent`
				| Planet  | Link                |
				|---------|---------------------|
				| Mercury | [Mercury][mercury]  |
				| Mercury | ![Mercury][mercury] |

				[mercury]: https://example.com/mercury
			`,
			language: "markdown/gfm",
		},
		// Backslash escaping
		`${"\\".repeat(1)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
		`${"\\".repeat(3)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
		`${"\\".repeat(5)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
		`${"\\".repeat(7)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
	],
	invalid: [
		{
			code: dedent`
				[Mercury](  mercury)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][  mercury]

				[mercury]: https://example.com/mercury
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
				[Mercury](\tmercury)

				[mercury]: https://example.com/mercury
			`.replace(/\\t/gu, "\t"),
			output: dedent`
				[Mercury][\tmercury]

				[mercury]: https://example.com/mercury
			`.replace(/\\t/gu, "\t"),
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
				[Mercury](\nmercury)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				[Mercury][\nmercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`
				[Mercury](\r\nmercury)

				[mercury]: https://example.com/mercury
			`.replace(/\\r/gu, "\r"),
			output: dedent`
				[Mercury][\r\nmercury]

				[mercury]: https://example.com/mercury
			`.replace(/\\r/gu, "\r"),
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`
				[Mercury](\rmercury)

				[mercury]: https://example.com/mercury
			`.replace(/\\r/gu, "\r"),
			output: dedent`
				[Mercury][\rmercury]

				[mercury]: https://example.com/mercury
			`.replace(/\\r/gu, "\r"),
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`
				![Mercury](\nmercury)

				[mercury]: https://example.com/mercury.jpg
			`,
			output: dedent`
				![Mercury][\nmercury]

				[mercury]: https://example.com/mercury.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`
				![Mercury](\r\nmercury)

				[mercury]: https://example.com/mercury.jpg
			`.replace(/\\r/gu, "\r"),
			output: dedent`
				![Mercury][\r\nmercury]

				[mercury]: https://example.com/mercury.jpg
			`.replace(/\\r/gu, "\r"),
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`
				![Mercury](\rmercury)

				[mercury]: https://example.com/mercury.jpg
			`.replace(/\\r/gu, "\r"),
			output: dedent`
				![Mercury][\rmercury]

				[mercury]: https://example.com/mercury.jpg
			`.replace(/\\r/gu, "\r"),
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`
				![Mercury](  mercury)

				[mercury]: https://example.com/mercury.jpg
			`,
			output: dedent`
				![Mercury][  mercury]

				[mercury]: https://example.com/mercury.jpg
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
				![Mercury](\tmercury)

				[mercury]: https://example.com/mercury.jpg
			`.replace(/\\t/gu, "\t"),
			output: dedent`
				![Mercury][\tmercury]

				[mercury]: https://example.com/mercury.jpg
			`.replace(/\\t/gu, "\t"),
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
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
				\\[Mercury](mercury)

				[mercury]: https://example.com/mercury/
			`,
			output: dedent`
				\\[Mercury][mercury]

				[mercury]: https://example.com/mercury/
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: dedent`
				\\![Venus](venus)

				[venus]: https://example.com/venus/
			`,
			output: dedent`
				\\![Venus][venus]

				[venus]: https://example.com/venus/
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 18,
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
		{
			code: dedent`
				# Heading with [Mercury](mercury)
				# Heading with ![Mercury](mercury)

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				# Heading with [Mercury][mercury]
				# Heading with ![Mercury][mercury]

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 34,
				},
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 2,
					column: 16,
					endLine: 2,
					endColumn: 35,
				},
			],
		},
		{
			code: dedent`
				Heading with [Mercury](mercury)
				===============================
				Heading with ![Mercury](mercury)
				================================

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				Heading with [Mercury][mercury]
				===============================
				Heading with ![Mercury][mercury]
				================================

				[mercury]: https://example.com/mercury
			`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 32,
				},
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 3,
					column: 14,
					endLine: 3,
					endColumn: 33,
				},
			],
		},
		{
			code: dedent`
				| Planet  | Link                |
				|---------|---------------------|
				| Mercury | [Mercury](mercury)  |
				| Mercury | ![Mercury](mercury) |

				[mercury]: https://example.com/mercury
			`,
			output: dedent`
				| Planet  | Link                |
				|---------|---------------------|
				| Mercury | [Mercury][mercury]  |
				| Mercury | ![Mercury][mercury] |

				[mercury]: https://example.com/mercury
			`,
			language: "markdown/gfm",
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 3,
					column: 13,
					endLine: 3,
					endColumn: 31,
				},
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 4,
					column: 13,
					endLine: 4,
					endColumn: 32,
				},
			],
		},
		// Backslash escaping
		{
			code: `${"\\".repeat(1)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(1)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: `${"\\".repeat(3)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(3)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: `${"\\".repeat(5)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(5)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: `${"\\".repeat(7)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(7)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: `${"\\".repeat(2)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(2)}[Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: `${"\\".repeat(4)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(4)}[Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: `${"\\".repeat(6)}[Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(6)}[Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "link", prefix: "" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: `${"\\".repeat(2)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(2)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: `${"\\".repeat(4)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(4)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: `${"\\".repeat(6)}![Mercury](mercury)\n\n[mercury]: https://example.com/mercury`,
			output: `${"\\".repeat(6)}![Mercury][mercury]\n\n[mercury]: https://example.com/mercury`,
			errors: [
				{
					messageId: "referenceLikeUrl",
					data: { type: "image", prefix: "!" },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 26,
				},
			],
		},
		// This test case is skipped for non-Node environments like Bun
		...(typeof process !== "undefined" &&
		process.release?.name === "node" &&
		!process.versions?.bun
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
