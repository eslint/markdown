/**
 * @fileoverview Tests for fenced-code-meta rule.
 * @author TKDev7
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/fenced-code-meta.js";
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

ruleTester.run("fenced-code-meta", rule, {
	valid: [
		dedent`\`\`\`
		console.log("Hello, world!");
		\`\`\``,
		dedent`\`\`\`js foo
		console.log("Hello, world!");
		\`\`\``,
		dedent`\`\`\` js   foo
		console.log("Hello, world!");
		\`\`\``,
		{
			code: dedent`\`\`\`
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
		},
		{
			code: dedent`\`\`\`js
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
		},
		{
			code: dedent`\`\`\` js
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
		},
		dedent`~~~
		console.log("Hello, world!");
		~~~`,
		dedent`~~~js foo
		console.log("Hello, world!");
		~~~`,
		dedent`~~~ js   foo
		console.log("Hello, world!");
		~~~`,
		{
			code: dedent`~~~
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
		},
		{
			code: dedent`~~~js
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
		},
		{
			code: dedent`~~~ js
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
		},
		'\tconsole.log("Hello, world!");',
		{
			code: '\tconsole.log("Hello, world!");',
			options: ["never"],
		},
		'\n    console.log("Hello, world!")\n',
		{
			code: '\n    console.log("Hello, world!")\n',
			options: ["never"],
		},
	],
	invalid: [
		{
			code: dedent`\`\`\`javascript
			console.log("Hello, world!");
			\`\`\``,
			errors: [
				{
					messageId: "missingMetadata",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`~~~javascript
			console.log("Hello, world!");
			~~~`,
			errors: [
				{
					messageId: "missingMetadata",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`\`\`\` js  
			console.log("Hello, world!");
			\`\`\``,
			errors: [
				{
					messageId: "missingMetadata",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`~~~ js  
			console.log("Hello, world!");
			~~~`,
			errors: [
				{
					messageId: "missingMetadata",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`\`\`\`js title="example.js"
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: dedent`~~~js title="example.js"
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: dedent`\`\`\`js foo bar
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`~~~js foo bar
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`\`\`\` js foo
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: dedent`~~~ js foo
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: dedent`\`\`\`js js
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`~~~js js
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`\`\`\` js   foo   
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`~~~ js   foo   
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
			errors: [
				{
					messageId: "disallowedMetadata",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
	],
});
