/**
 * @fileoverview Tests for no-emphasis-as-headings rule.
 * @author lumir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import rule from "../../src/rules/no-emphasis-as-headings.js";
import markdown from "../../src/index.js";
import { RuleTester } from "eslint";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/commonmark",
});

ruleTester.run("no-emphasis-as-headings", rule, {
	valid: [
		"",
		"  ",
		"foo\nbar\nbaz",
		"foo\n\nbar\n\nbaz\n\nqux",
		"`*foo*`",

		"*foo*\nbar\nbaz",
		"_foo_\nbar\nbaz",
		"**foo**\nbar\nbaz",
		"__foo__\nbar\nbaz",
		"***foo***\nbar\nbaz",
		"___foo___\nbar\nbaz",

		"foo\n*bar*\nbaz",
		"foo\n_bar_\nbaz",
		"foo\n**bar**\nbaz",
		"foo\n__bar__\nbaz",
		"foo\n***bar***\nbaz",
		"foo\n___bar___\nbaz",

		"**foo** bar\n\nfoo **bar**",
		"**foo** **bar**",
		"** foo **", // This is not a `strong` node.

		// Other whitespace must not be trimmed.
		"\u00A0*foo*",
		"*foo*\u00A0",
		"\u00A0*foo*\u00A0", // Non-breaking space
		"*foo*\v", // Vertical tab
		"*foo*\f", // Form feed
		"*foo*\u1680", // Ogham space mark
		"*foo*\u2003", // Em space
		"*foo*\u2028", // Line separator
		"*foo*\u2029", // Paragraph separator
		"*foo*\u202F", // Narrow non-breaking space
		"*foo*\u3000", // Ideographic space
		"*foo*\uFEFF", // Zero width non-breaking space

		// Indented code blocks are not checked by this rule.
		"\t*foo*",
		"    *foo*",

		// Punctuation
		"*foo.*",
		"*foo,*",
		"*foo;*",
		"*foo:*",
		"*foo!*",
		"*foo?*",
		"*foo。*",
		"*foo\uFF0C*", // `，`
		"*foo\uFF1B*", // `；`
		"*foo\uFF1A*", // `：`
		"*foo\uFF01*", // `！`
		"*foo\uFF1F*", // `？`
		"**foo.**",
		"***foo.***",
		"*[foo.](https://example.com/)*",
		"*foo `bar`.*",
		"**`foo`?**",
		{
			code: "*foo $bar$.*",
			languageOptions: {
				math: true,
			},
		},
		{
			code: "**$foo$?**",
			languageOptions: {
				math: true,
			},
		},

		// Multiline
		"*foo\nbar*",
		"_foo\nbar_",
		"**foo\nbar**",
		"__foo\nbar__",

		// `blockquote` is not checked by this rule.
		// This behavior aligns with `markdownlint`.
		"> *foo*",
		"> _foo_",
		"> **foo**",
		"> __foo__",
		"> ***foo***",
		"> ___foo___",

		"> > *foo*",
		"> > _foo_",
		"> > **foo**",
		"> > __foo__",
		"> > ***foo***",
		"> > ___foo___",

		"> - *foo*",
		"> - _foo_",
		"> - **foo**",
		"> - __foo__",
		"> - ***foo***",
		"> - ___foo___",

		`
> > *inner*
>
> *outer sibling*`,

		// `heading` is not checked by this rule.
		// This behavior aligns with `markdownlint`.
		"# *foo*",
		"# _foo_",
		"# **foo**",
		"# __foo__",
		"# ***foo***",
		"# ___foo___",

		// `listItem` is not checked by this rule.
		// This behavior aligns with `markdownlint`.
		"- *foo*",
		"- _foo_",
		"- **foo**",
		"- __foo__",
		"- ***foo***",
		"- ___foo___",

		"* *foo*",
		"* _foo_",
		"* **foo**",
		"* __foo__",
		"* ***foo***",
		"* ___foo___",

		"- > *foo*",
		"- > _foo_",
		"- > **foo**",
		"- > __foo__",
		"- > ***foo***",
		"- > ___foo___",

		`- ${"*item* ".repeat(10_000)}`, // To prevent inefficient algorithm (O(n²)) in emphasis handling.

		`
- outer
  - *inner*

  *outer sibling*`,

		// `strikethrough` is not checked by this rule.
		// This behavior aligns with `markdownlint`.
		{
			code: "~foo~",
			language: "markdown/gfm",
		},
		{
			code: "~~foo~~",
			language: "markdown/gfm",
		},

		// `tableCell` is not checked by this rule because it cannot contain headings.
		// This behavior aligns with `markdownlint`.
		{
			code: `
|  foo  |  bar  |
|  ---  |  ---  |
| *baz* | *qux* |`,
			language: "markdown/gfm",
		},
		{
			code: `
|  foo  |  bar  |
|  ---  |  ---  |
| _baz_ | _qux_ |`,
			language: "markdown/gfm",
		},
		{
			code: `
|   foo   |   bar   |
|   ---   |   ---   |
| **baz** | **qux** |`,
			language: "markdown/gfm",
		},
		{
			code: `
|   foo   |   bar   |
|   ---   |   ---   |
| __baz__ | __qux__ |`,
			language: "markdown/gfm",
		},
		{
			code: `
*foo* | bar
----- | ---
 baz  | qux`,
			language: "markdown/gfm",
		},

		// `footnoteDefinition` is not checked by this rule.
		// This behavior aligns with `markdownlint`.
		{
			code: "[^1]: *foo*",
			language: "markdown/gfm",
		},
		{
			code: "[^1]: _foo_",
			language: "markdown/gfm",
		},
		{
			code: "[^1]: **foo**",
			language: "markdown/gfm",
		},
		{
			code: "[^1]: __foo__",
			language: "markdown/gfm",
		},
		{
			code: `
[^outer]:
    > [^inner]: *inner*

    *outer sibling*`,
			language: "markdown/gfm",
		},

		// Options
		{
			code: "*foo)*",
			options: [
				{
					punctuation: [")"],
				},
			],
		},
		{
			code: "*foo$*",
			options: [
				{
					punctuation: ["$"],
				},
			],
		},
		{
			code: "*foo👍*",
			options: [
				{
					punctuation: ["👍"],
				},
			],
		},
		{
			code: "**foo👍**",
			options: [
				{
					punctuation: ["👍"],
				},
			],
		},
		{
			code: "*foo💥*",
			options: [
				{
					punctuation: ["💥"],
				},
			],
		},
		{
			code: "**foo💥**",
			options: [
				{
					punctuation: ["💥"],
				},
			],
		},
	],

	invalid: [
		{
			code: "*foo*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "_foo_",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "**foo**",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "__foo__",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},

		// `markdownlint` does not flag emphasis with trailing spaces as a heading, but this rule does.
		{
			code: "*foo* ",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*  ",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\t",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\t\t",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo* \t",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\t ",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\n",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\r",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\r\n",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo* \n",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo*\t\r",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo* \t\r\n",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: " *foo*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "   *foo* \t",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "*foo* <!-- comment -->",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*foo* <!-- comment --> <!-- comment -->",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},

		// `markdownlint` does not flag triple emphasis as a heading, but this rule does.
		{
			code: "***foo***",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "___foo___",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "*__foo__*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "__*foo*__",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "_**foo**_",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "**_foo_**",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},

		// `markdownlint` does not flag emphasis with nested emphasis as a heading, but this rule does.
		{
			code: "*foo _bar_ baz*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "_foo *bar* baz_",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},

		// Punctuation
		{
			code: "*foo.b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo,b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo;b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo:b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo!b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo?b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo。b*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo\uFF0Cb*", // `，`
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo\uFF1Bb*", // `；`
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo\uFF1Ab*", // `：`
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo\uFF01b*", // `！`
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "*foo\uFF1Fb*", // `？`
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "foo\n\n**bar**\n\nbaz\n\n__qux__",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 8,
				},
				{
					messageId: "noEmphasisAsHeadings",
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 8,
				},
			],
		},
		{
			code: "*Heading&nbsp;*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},

		// Punctuation inside inline code and inline math is ignored.
		{
			code: "*`foo.`*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "*foo `bar.`*",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "**`foo?`**",
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "*$foo.$*",
			languageOptions: {
				math: true,
			},
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "**foo $bar?$**",
			languageOptions: {
				math: true,
			},
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
				},
			],
		},

		// Options
		{
			code: "*foo.*",
			options: [
				{
					punctuation: [],
				},
			],
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "_foo._",
			options: [
				{
					punctuation: ["!"],
				},
			],
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "**foo.**",
			options: [
				{
					punctuation: ["?"],
				},
			],
			errors: [
				{
					messageId: "noEmphasisAsHeadings",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
	],
});
