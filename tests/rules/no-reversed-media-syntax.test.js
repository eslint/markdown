/**
 * @fileoverview Tests for no-reversed-media-syntax rule.
 * @author xbinaryx
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-reversed-media-syntax.js";
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

ruleTester.run("no-reversed-media-syntax", rule, {
	valid: [
		"[foo](bar)",
		"[foo](#bar)",
		"[foo](http://bar.com)",
		"![foo](bar)",
		"![foo](#bar)",
		"![foo](http://bar.com)",
		"(foo)[bar](http://bar.com)",
		"		myObj.getFiles(test)[0]",
		dedent`
		\`\`\`js
		myObj.getFiles(test)[0];
		\`\`\`
		`,
		"`myobj.getFiles(test)[0]`",
		"&lpar;reversed&rpar;[link]",
		"a &rpar; a &lpar; a &rpar;[a]~",
		"a<pre>&rpar; a &lpar; a &rpar;[a]~</pre>",
		"\\(foo)[bar]",
		"(foo\\)[bar]",
		"(foo)\\[bar]",
		"(foo)[bar\\]",
		"text [foo](bar) text [foo](bar) text",
		"text [foo](bar)[foo](bar) text",
		"text [foo](bar)[foo](bar)[foo](bar) text",
		"text (text `func()[index]`) text",
		'hi <span class="foo(bar)[baz]">hi</span>',
		// Heading
		"# [ESLint](https://eslint.org/)",
		"# ![A beautiful sunset](sunset.png)",
		// TableCell
		{
			code: dedent`
			| ESLint                        | Sunset                            |
			| ----------------------------- | --------------------------------- |
			| [ESLint](https://eslint.org/) | ![A beautiful sunset](sunset.png) |
			`,
			language: "markdown/gfm",
		},
	],
	invalid: [
		{
			code: "()[]",
			output: "[]()",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: "(foo)[]",
			output: "[foo]()",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "!()[foo]",
			output: "![](foo)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "(foo)[bar]",
			output: "[foo](bar)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "(foo)[#bar]",
			output: "[foo](#bar)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "(foo)[http://bar.com]",
			output: "[foo](http://bar.com)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: "!(foo)[bar]",
			output: "![foo](bar)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "!(foo)[#bar]",
			output: "![foo](#bar)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "!(foo)[http://bar.com]",
			output: "![foo](http://bar.com)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "(*foo*)[]",
			output: "[*foo*]()",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "(**foo**)[]",
			output: "[**foo**]()",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "(~~foo~~)[]",
			output: "[~~foo~~]()",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "(`foo`)[]",
			output: "[`foo`]()",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "[^1]: (Footnote text)[https://example.com]",
			output: "[^1]: [Footnote text](https://example.com)",
			language: "markdown/gfm",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: dedent`
			(fo
			o)[bar]`,
			output: dedent`
			[fo
			o](bar)`,
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`
			(foo
			)[bar]`,
			output: dedent`
			[foo
			](bar)`,
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 2,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`
			(foo)[bar]
			!(foo)[bar]
			`,
			output: dedent`
			[foo](bar)
			![foo](bar)
			`,
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "reversedSyntax",
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
			\`code code
			code\`
			(foo)[bar]
			`,
			output: dedent`
			\`code code
			code\`
			[foo](bar)
			`,
			errors: [
				{
					messageId: "reversedSyntax",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 11,
				},
			],
		},
		{
			code: dedent`
			text
			text \`code
			code code
			code\` text
			text (foo)[bar]
			`,
			output: dedent`
			text
			text \`code
			code code
			code\` text
			text [foo](bar)
			`,
			errors: [
				{
					messageId: "reversedSyntax",
					line: 5,
					column: 6,
					endLine: 5,
					endColumn: 16,
				},
			],
		},
		{
			code: "text (text(foo)[bar] text",
			output: "text (text[foo](bar) text",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "(text foo())[bar]",
			output: "[text foo()](bar)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "text (foo)[bar] text !(baz)[qux] text",
			output: "text [foo](bar) text ![baz](qux) text",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 16,
				},
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 33,
				},
			],
		},
		{
			code: "abcd\n  \\a()[]",
			output: "abcd\n  \\a[]()",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 9,
				},
			],
		},
		{
			code: '[link1](#link "`") ()[] [link2](#link "`")',
			output: '[link1](#link "`") []() [link2](#link "`")',
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		// Heading
		{
			code: "# (ESLint)[https://eslint.org/]",
			output: "# [ESLint](https://eslint.org/)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 32,
				},
			],
		},
		{
			code: "# !(A beautiful sunset)[sunset.png]",
			output: "# ![A beautiful sunset](sunset.png)",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 36,
				},
			],
		},
		{
			code: dedent`
			Setext Heading
			  (ESLint)[https://eslint.org/]
			===
			`,
			output: dedent`
			Setext Heading
			  [ESLint](https://eslint.org/)
			===
			`,
			errors: [
				{
					messageId: "reversedSyntax",
					line: 2,
					column: 3,
					endLine: 2,
					endColumn: 32,
				},
			],
		},
		// TableCell
		{
			code: dedent`
			| ESLint                        | Sunset                            |
			| ----------------------------- | --------------------------------- |
			| (ESLint)[https://eslint.org/] | !(A beautiful sunset)[sunset.png] |
			`,
			output: dedent`
			| ESLint                        | Sunset                            |
			| ----------------------------- | --------------------------------- |
			| [ESLint](https://eslint.org/) | ![A beautiful sunset](sunset.png) |
			`,
			language: "markdown/gfm",
			errors: [
				{
					messageId: "reversedSyntax",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 32,
				},
				{
					messageId: "reversedSyntax",
					line: 3,
					column: 36,
					endLine: 3,
					endColumn: 68,
				},
			],
		},
	],
});
