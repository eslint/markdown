/**
 * @fileoverview Tests for no-html rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-html.js";
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

ruleTester.run("no-html", rule, {
	valid: [
		"Hello world!",
		" 1 < 5",
		"<!-- comment -->",
		dedent`\`\`\`html
        <b>Hello world!</b>
        \`\`\``,
		{
			code: "<b>Hello world!</b>",
			options: [{ allowed: ["b"] }],
		},
		{
			code: "<custom-element>Hello world!</custom-element>",
			options: [{ allowed: ["custom-element"] }],
		},
	],
	invalid: [
		{
			code: "<b>Hello world!</b>",
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
					data: {
						name: "b",
					},
				},
			],
		},
		{
			code: "<b>Hello world!</b>",
			options: [{ allowed: ["em"] }],
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
					data: {
						name: "b",
					},
				},
			],
		},
		{
			code: "<b>Hello world!</b><i>Goodbye world!</i>",
			options: [{ allowed: ["em"] }],
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
					data: {
						name: "b",
					},
				},
				{
					messageId: "disallowedElement",
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 23,
					data: {
						name: "i",
					},
				},
			],
		},
		{
			code: "<!-- hi --><b>Hello world!</b>",
			options: [{ allowed: ["em"] }],
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
					data: {
						name: "b",
					},
				},
			],
		},
		{
			code: "<custom-element>Hello world!</custom-element>",
			options: [{ allowed: ["em"] }],
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
					data: {
						name: "custom-element",
					},
				},
			],
		},
		{
			code: "<span >Content</span>",
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
					data: { name: "span" },
				},
			],
		},
		{
			code: '<div id="foo">Some content</div>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
					data: {
						name: "div",
					},
				},
			],
		},
		{
			code: '<p class="text-center" data-attr="value">Content</p>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 42,
					data: {
						name: "p",
					},
				},
			],
		},
		{
			code: '<span\nclass="highlight"\ndata-id="123">Text</span>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
					data: {
						name: "span",
					},
				},
			],
		},
		{
			code: '<span\rclass="highlight"\rdata-id="123">Text</span>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
					data: {
						name: "span",
					},
				},
			],
		},
		{
			code: '<span\r\nclass="highlight"\r\ndata-id="123">Text</span>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
					data: {
						name: "span",
					},
				},
			],
		},
		{
			code: '<div   class="test"   >Content</div>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 24,
					data: { name: "div" },
				},
			],
		},
		{
			code: '<input type="text" placeholder="Enter text" />',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 47,
					data: {
						name: "input",
					},
				},
			],
		},
		{
			code: '<a href="#"><span class="highlight">Link</span></a>',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 13,
					data: { name: "a" },
				},
				{
					messageId: "disallowedElement",
					line: 1,
					column: 13,
					endLine: 1,
					endColumn: 37,
					data: { name: "span" },
				},
			],
		},
		{
			code: '<input placeholder=">" />',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 26,
					data: {
						name: "input",
					},
				},
			],
		},
		{
			code: "<input placeholder='>'></input>",
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 24,
					data: {
						name: "input",
					},
				},
			],
		},
		{
			code: '<input\nplaceholder=">" />',
			errors: [
				{
					messageId: "disallowedElement",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 7,
					data: {
						name: "input",
					},
				},
			],
		},
		{
			code: dedent`
			<!-- comment -->
			<input
				placeholder="Enter name"
         		name="First Name"
		 	/>`,
			errors: [
				{
					messageId: "disallowedElement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 7,
					data: {
						name: "input",
					},
				},
			],
		},
	],
});
