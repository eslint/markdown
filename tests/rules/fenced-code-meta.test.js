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
		`\`\`\`
		console.log("Hello, world!");
		\`\`\``,
		`\`\`\`js foo
		console.log("Hello, world!");
		\`\`\``,
		`\`\`\` js   foo
		console.log("Hello, world!");
		\`\`\``,
		{
			code: `\`\`\`
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
		},
		{
			code: `\`\`\`js
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
		},
		{
			code: `\`\`\` js
			console.log("Hello, world!");
			\`\`\``,
			options: ["never"],
		},
		`~~~
		console.log("Hello, world!");
		~~~`,
		`~~~js foo
		console.log("Hello, world!");
		~~~`,
		`~~~ js   foo
		console.log("Hello, world!");
		~~~`,
		{
			code: `~~~
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
		},
		{
			code: `~~~js
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
		},
		{
			code: `~~~ js
			console.log("Hello, world!");
			~~~`,
			options: ["never"],
		},
		'\tconsole.log("Hello, world!");',
		{
			code: '\tconsole.log("Hello, world!");',
			options: ["never"],
		},
	],
	invalid: [
		{
			code: `\`\`\`javascript
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
			code: `~~~javascript
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
			code: `\`\`\` js  
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
			code: `~~~ js  
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
			code: `\`\`\`js title="example.js"
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
			code: `~~~js title="example.js"
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
			code: `\`\`\`js foo bar
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
			code: `~~~js foo bar
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
			code: `\`\`\` js foo
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
			code: `~~~ js foo
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
			code: `\`\`\`js js
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
			code: `~~~js js
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
			code: `\`\`\` js   foo   
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
			code: `~~~ js   foo   
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
