/**
 * @fileoverview Tests for no-missing-link-fragments rule.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-link-fragments.js";
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

ruleTester.run("no-missing-link-fragments", rule, {
	valid: [
		// Simple case with matching fragment
		dedent`# Heading One
		
		[Link to heading](#heading-one)`,

		// Multiple headings and links
		dedent`# Introduction
		
		## First Section
		
		[Link to introduction](#introduction)
		
		[Link to section](#first-section)`,

		// Mixed case handling
		dedent`# TITLE
		
		[Link to title](#title)`,

		// Link to empty fragment (anchor) should pass
		dedent`# Title
		
		[Empty link](#)`,

		// Links without fragments should pass
		dedent`# Title
		
		[External link](https://example.com)
		[Relative link](./file.md)`,

		// Testing ignoreCase parameter
		{
			code: dedent`# Introduction
			
			[Case insensitive link](#INTRODUCTION)`,
			options: [{ ignoreCase: true }],
		},

		// Testing allowPattern parameter
		{
			code: dedent`# Title
			
			[Ignored pattern link](#section-123)`,
			options: [{ allowPattern: "^section-" }],
		},

		// Testing both parameters together
		{
			code: dedent`# Introduction
			
			[Case insensitive link](#INTRODUCTION)
			[Ignored pattern link](#section-123)`,
			options: [{ ignoreCase: true, allowPattern: "^section-" }],
		},

		// Testing exact match with explicit ignoreCase: false
		{
			code: dedent`# Introduction
			
			[Case sensitive match](#introduction)`,
			options: [{ ignoreCase: false }],
		},

		// Testing with empty allowPattern (explicit test for null allowedRegex path)
		{
			code: dedent`# Introduction
			
			[Valid link](#introduction)`,
			options: [{ allowPattern: "" }],
		},

		// Test a valid fragment match but without ignoreCase specified (default behavior)
		{
			code: dedent`# Introduction
			
			[Default match](#introduction)`,
			options: [{}], // Empty options object
		},

		// Test with plain text fragment that matches heading and allowPattern that doesn't match the fragment
		{
			code: dedent`# Introduction
			
			[Valid link with non-matching pattern](#introduction)`,
			options: [{ allowPattern: "^special-" }],
		},
	],
	invalid: [
		{
			// Missing fragment
			code: dedent`# Title\n\n[Link to non-existent heading](#non-existent)`,
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "non-existent",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 46,
				},
			],
		},
		{
			// Case mismatch is invalid by default
			code: dedent`# Introduction\n\n[Wrong case](#INTRODUCTION)`,
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "INTRODUCTION",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 28,
				},
			],
		},
		{
			// Multiple errors
			code: dedent`# Title\n\n[Link one](#missing-one)\n[Link two](#missing-two)`,
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "missing-one",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 25,
				},
				{
					messageId: "missingFragment",
					data: {
						fragment: "missing-two",
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 25,
				},
			],
		},
		{
			// Case mismatch with ignoreCase set to false explicitly
			code: dedent`# Introduction\n\n[Wrong case](#INTRODUCTION)`,
			options: [{ ignoreCase: false }],
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "INTRODUCTION",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 28,
				},
			],
		},
		{
			// Non-matching fragment with allowPattern that doesn't match
			code: dedent`# Title\n\n[Non-matching ignored pattern](#nonmatching)`,
			options: [{ allowPattern: "^section-" }],
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "nonmatching",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 45,
				},
			],
		},
		{
			// Non-matching fragment with empty allowPattern (explicit test for null allowedRegex path)
			code: dedent`# Title\n\n[Non-matching fragment](#nonexistent)`,
			options: [{ allowPattern: "" }],
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "nonexistent",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
			],
		},
		{
			// Missing fragment with no options specified (default behavior)
			code: dedent`# Title\n\n[Missing with defaults](#nonexistent)`,
			options: [{}], // Empty options object
			errors: [
				{
					messageId: "missingFragment",
					data: {
						fragment: "nonexistent",
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 38,
				},
			],
		},
	],
});
