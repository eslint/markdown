/**
 * @fileoverview Tests for table-column-count rule.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/table-column-count.js";
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

ruleTester.run("table-column-count", rule, {
	valid: [
		dedent`
            | Header | Header |
            | ------ | ------ |
            | Cell   | Cell   |
            | Cell   | Cell   |
        `,
		dedent`
            | Header | Header | Header |
            | ------ | ------ | ------ |
            | Cell   | Cell   |
            | Cell   |        |
        `,
		dedent`
            | A | B |
            |---|---|
            |   |   |
            | C |   |
        `,
		`Just some text. | not a table |`,
		dedent`
            | Header | Header |
            | ------ | ------ | ----- |
            | Cell   | Cell   |
        `,
		dedent`
            | Header | Header |
            | ------ | ------ |
        `,
		dedent`
            Some text before.

            | H1 | H2 |
            |----|----|
            | D1 | D2 |

            Some text after.
        `,
		dedent`
            | Valid | Table |
            | ----- | ----- |
            | Row   | Here  |
        `,
		dedent`
			| abc | defghi |
			:-: | -----------:
			bar | baz
		`,
		dedent`
            | f|oo  |
            | ------ |
            | b \`|\` az |
            | b **|** im |
        `,
		dedent`
			| abc | def |
			| --- | --- |
			| bar | baz |
			> bar
		`,
		dedent`
			| abc | def |
			| --- | --- |
		`,
	],

	invalid: [
		{
			code: dedent`
                | Head1 | Head2 |
                | ----- | ----- |
                | R1C1  | R1C2  | R2C3  |
            `,
			errors: [
				{
					messageId: "inconsistentColumnCount",
					data: { actualCells: "3", expectedCells: "2" },
					line: 3,
					column: 17,
					endLine: 3,
					endColumn: 26,
				},
			],
		},
		{
			code: dedent`
                | Head1 | Head2 |
                | ----- | ----- |
                | R1C1  | R1C2  | R2C3  | R3C4 |
            `,
			errors: [
				{
					messageId: "inconsistentColumnCount",
					data: { actualCells: "4", expectedCells: "2" },
					line: 3,
					column: 17,
					endLine: 3,
					endColumn: 33,
				},
			],
		},
		{
			code: dedent`
                | A |
                | - |
                | 1 | 2 |
            `,
			errors: [
				{
					messageId: "inconsistentColumnCount",
					data: { actualCells: "2", expectedCells: "1" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 10,
				},
			],
		},
		{
			code: dedent`
                Some introductory text.

                | Header1 | Header2 |
                | ------- | ------- |
                | Data1   | Data2   | Data3 |
                | D4      | D5      |

                Some concluding text.
            `,
			errors: [
				{
					messageId: "inconsistentColumnCount",
					data: { actualCells: "3", expectedCells: "2" },
					line: 5,
					column: 21,
					endLine: 5,
					endColumn: 30,
				},
			],
		},
		{
			code: dedent`
                | abc | defghi |
				:-: | -----------:
				bar | baz
				bar | baz | bad
            `,
			errors: [
				{
					messageId: "inconsistentColumnCount",
					data: { actualCells: "3", expectedCells: "2" },
					line: 4,
					column: 11,
					endLine: 4,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
					| abc | def |
					| --- | --- |
					| bar | baz | Extra |
					> This is a blockquote after
				`,
			errors: [
				{
					messageId: "inconsistentColumnCount",
					data: { actualCells: "3", expectedCells: "2" },
					line: 3,
					column: 13,
					endLine: 3,
					endColumn: 22,
				},
			],
		},
	],
});
