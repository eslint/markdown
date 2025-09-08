/**
 * @fileoverview Tests for fenced-code-language rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/fenced-code-language.js";
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
});

ruleTester.run("fenced-code-language", rule, {
	valid: [
		// backtick code block
		`\`\`\`js
console.log("Hello, world!");
\`\`\``,
		`\`\`\`javascript
console.log("Hello, world!");
\`\`\``,

		// tilde code block
		`~~~js
console.log("Hello, world!");
~~~`,
		`~~~javascript
console.log("Hello, world!");
~~~`,

		// indented code block
		`
    console.log("Hello, world!");
        `,
		{
			code: `\`\`\`js
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
		},
		{
			code: `\`\`\`js foo
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
		},
		{
			code: `\`\`\` js
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
		},
		{
			code: `\`\`\`JS
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["JS"] }],
		},
		{
			code: `~~~js
console.log("Hello, world!");
~~~`,
			options: [{ required: ["js"] }],
		},
		{
			code: `~~~js foo
console.log("Hello, world!");
~~~`,
			options: [{ required: ["js"] }],
		},
		{
			code: `~~~ js
console.log("Hello, world!");
~~~`,
			options: [{ required: ["js"] }],
		},
		{
			code: `~~~JS
console.log("Hello, world!");
~~~`,
			options: [{ required: ["JS"] }],
		},
	],
	invalid: [
		{
			code: `\`\`\`
console.log("Hello, world!");
\`\`\``,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
				},
			],
		},
		{
			code: ` \`\`\`
console.log("Hello, world!");
\`\`\``,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: `  \`\`\`
console.log("Hello, world!");
\`\`\``,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: `   \`\`\`
console.log("Hello, world!");
\`\`\``,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "```     \nconsole.log('Hello, world!');\n```",
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
				},
			],
		},
		{
			code: `~~~
console.log("Hello, world!");
~~~`,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
				},
			],
		},
		{
			code: ` ~~~
console.log("Hello, world!");
~~~`,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: `  ~~~
console.log("Hello, world!");
~~~`,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: `   ~~~
console.log("Hello, world!");
~~~`,
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "~~~     \nconsole.log('Hello, world!');\n~~~",
			errors: [
				{
					messageId: "missingLanguage",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
				},
			],
		},
		{
			code: `\`\`\`javascript
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: ` \`\`\`javascript
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: `  \`\`\`javascript
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: `   \`\`\`javascript
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: `\`\`\`\`javascript
console.log("Hello, world!");
\`\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: ` \`\`\`\`javascript
console.log("Hello, world!");
\`\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: `  \`\`\`\`javascript
console.log("Hello, world!");
\`\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: `   \`\`\`\`javascript
console.log("Hello, world!");
\`\`\`\``,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: `\`\`\`js
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["JS"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "js" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: `\`\`\` js
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["JS"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "js" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: `\`\`\`js foo
console.log("Hello, world!");
\`\`\``,
			options: [{ required: ["foo"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "js" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: `~~~javascript
console.log("Hello, world!");
~~~`,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: `~~~~javascript
console.log("Hello, world!");
~~~~`,
			options: [{ required: ["js"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "javascript" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: `~~~js
console.log("Hello, world!");
~~~`,
			options: [{ required: ["JS"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "js" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: `~~~ js
console.log("Hello, world!");
~~~`,
			options: [{ required: ["JS"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "js" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: `~~~js foo
console.log("Hello, world!");
~~~`,
			options: [{ required: ["foo"] }],
			errors: [
				{
					messageId: "disallowedLanguage",
					data: { lang: "js" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
	],
});
