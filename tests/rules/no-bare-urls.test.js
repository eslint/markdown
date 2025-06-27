/**
 * @fileoverview Tests for no-bare-urls rule.
 * @author xbinaryx
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-bare-urls.js";
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
	language: "markdown/gfm",
});

ruleTester.run("no-bare-urls", rule, {
	valid: [
		"<https://www.google.com/>",
		"<user@example.com>",
		"[text [undefined] text](https://example.com).",
		"[is-a-valid]: https://example.com",
		'<a href="https://example.com">link</a>.',
		'<a href="https://example.com">https://example.com</a>',
		'<a href="https://example.com">Text https://example.com</a>',
		"This is not a bare [link]( https://example.com )",
		"Nor is [link](https://example.com/path-with(parens)).",
		"Or <https://example.com/path-with(parens)>.",
		dedent`
        <element-name first-attribute=" https://example.com/first " second-attribute=" https://example.com/second ">
            Text
        </element-name>`,
		dedent`
        <element-name
            first-attribute=" https://example.com/first "
            second-attribute=" https://example.com/second "></element-name>`,
		"Not <code>https://example.com</code> bare.",
		"Not <pre>https://example.com</pre> bare.",
		dedent`
        <p>
        Not bare due to being in an HTML block:
        https://example.com
        <code>https://example.com</code>
        <pre>https://example.com</pre>
        </p>`,
		dedent`
        <div>
        https://example.com
        </div>`,
		dedent`
        <div>
        https://example.com

        </div>`,
		"Text [link to https://example.com site](https://example.com) text.",
		"Image ![for https://example.com site](https://example.com) text.",
		"Links with spaces inside angle brackets are okay: [blue jay](<https://en.wikipedia.org/wiki/Blue jay>)",
		"[link \\[is-not-a-valid\\] link](https://example.com)",
		"text <https://example.com/dir/dir>",
		dedent`
        \`\`\`text
        Code https://example.com/code?type=fence code
        \`\`\``,
		"       Code https://example.com/code?type=indent code",
	],
	invalid: [
		{
			code: "https://www.example.com/",
			output: "<https://www.example.com/>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: "user@example.com",
			output: "<user@example.com>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "text https://www.google.com/",
			output: "text <https://www.google.com/>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		{
			code: "hTtPs://gOoGlE.cOm/",
			output: "<hTtPs://gOoGlE.cOm/>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "(https://example.com)",
			output: "(<https://example.com>)",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "# https://www.example.com/",
			output: "# <https://www.example.com/>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: dedent`
            | Link                 |
            |----------------------|
            | https://example.com/ |`,
			output: dedent`
            | Link                 |
            |----------------------|
            | <https://example.com/> |`,
			errors: [
				{
					messageId: "bareUrl",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 23,
				},
			],
		},
		{
			code: dedent`
            [link that [is-a-valid] link](https://example.com)
            
            [is-a-valid]: https://example.com
            `,
			output: dedent`
            [link that [is-a-valid] link](<https://example.com>)
            
            [is-a-valid]: https://example.com
            `,
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 31,
					endLine: 1,
					endColumn: 50,
				},
			],
		},
		{
			code: "Text <https://example.com/brackets> text https://example.com/bare text",
			output: "Text <https://example.com/brackets> text <https://example.com/bare> text",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 66,
				},
			],
		},
		{
			code: "> https://example.com/",
			output: "> <https://example.com/>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "Text https://example.com/first more text https://example.com/second",
			output: "Text <https://example.com/first> more text <https://example.com/second>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 31,
				},
				{
					messageId: "bareUrl",
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 68,
				},
			],
		},
		{
			code: dedent`
            Text https://example.com/first
            more text https://example.com/second`,
			output: dedent`
            Text <https://example.com/first>
            more text <https://example.com/second>`,
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 31,
				},
				{
					messageId: "bareUrl",
					line: 2,
					column: 11,
					endLine: 2,
					endColumn: 37,
				},
			],
		},
		{
			code: "Text <a>https://example.com</a> https://example.com",
			output: "Text <a>https://example.com</a> <https://example.com>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 33,
					endLine: 1,
					endColumn: 52,
				},
			],
		},
		{
			code: "<br> Another violation: https://example.com. <br>",
			output: "<br> Another violation: <https://example.com>. <br>",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: dedent`
            <div>
            
            https://example.com
            </div>`,
			output: dedent`
            <div>
            
            <https://example.com>
            </div>`,
			errors: [
				{
					messageId: "bareUrl",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
            <div>
            
            https://example.com

            </div>`,
			output: dedent`
            <div>
            
            <https://example.com>

            </div>`,
			errors: [
				{
					messageId: "bareUrl",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 20,
				},
			],
		},
		{
			code: "text **<a>https://example.com</a>** *https://example.com*",
			output: "text **<a>https://example.com</a>** *<https://example.com>*",
			errors: [
				{
					messageId: "bareUrl",
					line: 1,
					column: 38,
					endLine: 1,
					endColumn: 57,
				},
			],
		},
	],
});
