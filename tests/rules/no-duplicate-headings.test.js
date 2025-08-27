/**
 * @fileoverview Tests for no-duplicate-heading rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-headings.js";
import markdown from "../../src/index.js";
import { Linter, RuleTester } from "eslint";
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
		// Using emphasis in headings should not be considered a duplicate by default.
		dedent`
			# Heading 1
			
			# Heading *1*
		`,
		dedent`
			# ***Heading 1***
			
			# Heading 1
		`,
		dedent`
			# Heading 1

			## Heading 2
        `,
		dedent`
			# Heading 1

			# Heading 1#
		`,
		dedent`
			Heading 1
			Hi
			===

			Heading 1
			Bye
			===
		`,
		dedent`
			Heading 1
			Text
			Hi
			===

			Heading 1
			Text
			Bye
			===
		`,
		dedent`
			Heading 2
			Hi
			---

			Heading 2
			Bye
			---
		`,
		dedent`
			Heading 2
			Text
			Hi
			---

			Heading 2
			Text
			Bye
			---
		`,
		"# Heading 1\n# \u00a0Heading 1", // We can't use `dedent` library when detecting NBSP(U+00A0) characters, as it automatically removes them.
		"# Heading 1\n# Heading 1\u00a0",
		"# Heading 1 #\n# \u00a0Heading 1 #",
		"# Heading 1 #\n# Heading 1\u00a0 #",
		"# Heading 1 #\n# Heading 1\u00a0#",
		"#  Heading 1  #\n# \u00a0Heading 1\u00a0#",
		"# \u00a0Heading 1 #\n# Heading 1\u00a0 #",
		"# foo \\###\n# foo ###",
		"# foo #\\##\n# foo ###",
		"# foo \\#",
		"Heading  \nHi\n===\n\nHeading\nHi\n===", // The first setext heading uses a Break node (double spaces), so the second setext heading isn't considered a duplicate.
		{
			code: dedent`
				# Change log

				## 1.0.0

				### Features

				## 2.0.0

				### Features
			`,
			options: [{ checkSiblingsOnly: true }],
		},
		{
			code: dedent`
				# Change log

				## 1.0.0

				### Features

				## 2.0.0

				### Features ###
			`,
			options: [{ checkSiblingsOnly: true }],
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
			options: [{ checkSiblingsOnly: true }],
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
			options: [{ checkSiblingsOnly: true }],
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
					data: {
						text: "Heading 1",
					},
				},
			],
		},
		{
			// Should handle CRLF line endings
			code: "# Heading 1\r\n# Heading 1",
			errors: [
				{
					messageId: "duplicateHeading",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 12,
					data: {
						text: "Heading 1",
					},
				},
			],
		},
		{
			// The first setext heading uses a single space, so the second setext heading is considered a duplicate.
			code: "Heading \nHi\n===\n\nHeading\nHi\n===",
			errors: [
				{
					messageId: "duplicateHeading",
					line: 5,
					column: 1,
					endLine: 7,
					endColumn: 4,
					data: {
						text: "Heading\nHi",
					},
				},
			],
		},
		{
			code: dedent`
				# Heading 1

				# Heading 1 ##
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 15,
					data: {
						text: "Heading 1",
					},
				},
			],
		},
		{
			code: dedent`
				# Heading 1

				# Heading 1 ##########
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 23,
					data: {
						text: "Heading 1",
					},
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
					data: {
						text: "Heading 1",
					},
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
					data: {
						text: "Heading 1",
					},
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
					data: {
						text: "Heading 1",
					},
				},
			],
		},
		{
			code: dedent`
				Heading 1
				Hi
				===

				Heading 1
				Hi
				===
			`,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 5,
					column: 1,
					endLine: 7,
					endColumn: 4,
					data: {
						text: "Heading 1\nHi",
					},
				},
			],
		},
		{
			// `*` and `_` emphasis should be considered duplicates.
			code: dedent`
				Heading *1*
				Hi
				===

				Heading _1_
				Hi
				===
			`,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 5,
					column: 1,
					endLine: 7,
					endColumn: 4,
					data: {
						text: "Heading 1\nHi",
					},
				},
			],
		},
		{
			code: dedent`
				Heading <u>1</u>
				Hi
				===

				Heading <u>1</u>
				Hi
				===
			`,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 5,
					column: 1,
					endLine: 7,
					endColumn: 4,
					data: {
						text: "Heading 1\nHi",
					},
				},
			],
		},
		{
			// Should handle CRLF line endings
			code: "Heading 1\r\nHi\r\n===\r\n\r\nHeading 1\r\nHi\r\n===",
			errors: [
				{
					messageId: "duplicateHeading",
					line: 5,
					column: 1,
					endLine: 7,
					endColumn: 4,
					data: {
						text: "Heading 1\r\nHi",
					},
				},
			],
		},
		{
			code: dedent`
				# Heading \`1\`

				# Heading \`1\`
            `,
			errors: [
				{
					messageId: "duplicateHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 14,
					data: {
						text: "Heading 1",
					},
				},
			],
		},
		{
			code: dedent`
				# Heading 1

				# Heading 1
            `,
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 12,
					data: {
						text: "Heading 1",
					},
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
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 16,
					data: {
						text: "Subsection A",
					},
				},
			],
		},
		{
			code: dedent`
				# Section 1

				## Subsection A
				## Subsection A ###

				# Section 2

				## Subsection B
			`,
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 20,
					data: {
						text: "Subsection A",
					},
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
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 9,
					column: 1,
					endLine: 9,
					endColumn: 16,
					data: {
						text: "Subsection A",
					},
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
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 6,
					column: 1,
					endLine: 7,
					endColumn: 13,
					data: {
						text: "Subsection A",
					},
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
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 14,
					column: 1,
					endLine: 15,
					endColumn: 13,
					data: {
						text: "Subsection A",
					},
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
			options: [{ checkSiblingsOnly: true }],
			errors: [
				{
					messageId: "duplicateHeading",
					line: 9,
					column: 1,
					endLine: 9,
					endColumn: 16,
					data: {
						text: "Subsection A",
					},
				},
				{
					messageId: "duplicateHeading",
					line: 10,
					column: 1,
					endLine: 11,
					endColumn: 13,
					data: {
						text: "Subsection A",
					},
				},
			],
		},
	],
});

// https://github.com/eslint/markdown/pull/463
it("`no-duplicate-headings` should not timeout for large inputs", () => {
	const linter = new Linter();
	linter.verify(`# example${" ".repeat(500_000)}?#`, {
		language: "markdown/commonmark",
		plugins: { markdown },
		rules: { "markdown/no-duplicate-headings": "error" },
	});
});
