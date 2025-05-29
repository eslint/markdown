/**
 * @fileoverview Tests for no-duplicate-heading rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-headings.js";
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

ruleTester.run("no-duplicate-headings", rule, {
	valid: [
		`# Heading 1

        ## Heading 2`,
		{
			code: dedent`
				# Change log

				## 1.0.0

				### Features

				## 2.0.0

				### Features
			`,
			options: [{ siblingsOnly: true }],
		},
		{
			code: dedent`
				1.0.0
				=====

				Features
				--------

				2.0.0
				=====

				Features
				--------
			`,
			options: [{ siblingsOnly: true }],
		},
		{
			code: dedent`
				1.0.0
				=====

				Features
				--------

				2.0.0
				=====

				## Features
			`,
			options: [{ siblingsOnly: true }],
		},
	],
	invalid: [
		{
			code: `
# Heading 1

# Heading 1
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: `
# Heading 1

## Heading 1
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 13,
				},
			],
		},
		{
			code: `
# Heading 1

Heading 1
---------
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 5,
					endColumn: 10,
				},
			],
		},
		{
			code: `
# Heading 1

Heading 1
=========
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 5,
					endColumn: 10,
				},
			],
		},
		{
			code: dedent`
				# Heading 1

				# Heading 1
            `,
			options: [{ siblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				# Section 1

				## Subsection A
				## Subsection A

				# Section 2

				## Subsection B
			`,
			options: [{ siblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
				# Section 1

				## Subsection A
				## Subsection B

				# Section 2

				## Subsection A
				## Subsection A
			`,
			options: [{ siblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 9,
					column: 1,
					endLine: 9,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
				Section 1
				=========

				Subsection A
				------------
				Subsection A
				------------

				Section 2
				=========

				Subsection B
				------------
			`,
			options: [{ siblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 6,
					column: 1,
					endLine: 7,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				Section 1
				=========

				Subsection A
				------------
				Subsection B
				------------

				Section 2
				=========

				Subsection A
				------------
				Subsection A
				------------
			`,
			options: [{ siblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 14,
					column: 1,
					endLine: 15,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				# Section 1

				## Subsection A
				## Subsection B

				# Section 2

				## Subsection A
				## Subsection A
				Subsection A
				------------
			`,
			options: [{ siblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 9,
					column: 1,
					endLine: 9,
					endColumn: 16,
				},
				{
					messageId: "duplicateHeading",
					line: 10,
					column: 1,
					endLine: 11,
					endColumn: 13,
				},
			],
		},
	],
});
