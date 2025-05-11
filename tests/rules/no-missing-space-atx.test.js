/**
 * @fileoverview Tests for no-missing-space-atx rule.
 * @author Sweta Tanwar
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-space-atx.js";
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

// Construct test scenarios
const validHeadings = [
	// Valid ATX headings with proper space
	"# Heading 1",
	"## Heading 2",
	"### Heading 3",
	"#### Heading 4",
	"##### Heading 5",
	"###### Heading 6",

	// Multiple headings with proper spacing
	dedent`# Heading 1

	## Heading 2
	
	### Heading 3`,

	// Extra space is fine
	"#  Heading with extra space",
];

const nonHeadings = [
	// Just hashes (not headings)
	"#",
	"##",

	// Setext headings (not covered by rule)
	"Heading 1\n=========",
	"Heading 2\n---------",

	// Not headings
	"Not a heading",
	"This is a paragraph with a #hashtag",
];

const codeBlocks = [
	// Code blocks
	'```js\n#Not a heading in a code block\nconsole.log("#Not a heading");\n```',

	// Lines with code markers should be skipped
	dedent`Text before
	#Heading with \`\`\` code markers - should be skipped
	Text after`,

	// Lines with tilde markers should be skipped
	dedent`Text before
	#Heading with ~~~ tilde markers - should be skipped
	Text after`,

	// Text node with code markers (to test the early return condition)
	"#Something with ``` backticks",

	// Another variation with code markers
	"#Heading with ``` in the middle and more text after",

	// Text with tilde markers
	"#Title with ~~~ tildes in it",
];

const edgeTestCases = [
	// Test node with backticks as the entire content (to test line 93)
	"```",

	// Text with code markers at start (to better test hasCodeBlockMarkers early return)
	"``` followed by text",

	// Text with tilde markers at start
	"~~~ followed by more text",
];

/**
 * Creates an invalid test case for a specific heading level
 * @param {number} level The heading level (1-6)
 * @returns {Object} The test case object
 */
function createInvalidTest(level) {
	const hashes = "#".repeat(level);
	return {
		code: `${hashes}Heading ${level}`,
		output: `${hashes} Heading ${level}`,
		errors: [{ messageId: "missingSpace", column: level }],
	};
}

// Create array of invalid test cases
const invalidTests = [
	// Basic heading tests (levels 1-6)
	...Array.from({ length: 6 }, (_, i) => createInvalidTest(i + 1)),

	// Mixed valid and invalid heading in document
	{
		code: dedent`# Heading 1

		##Heading 2
		
		### Heading 3`,
		output: dedent`# Heading 1

		## Heading 2
		
		### Heading 3`,
		errors: [
			{
				messageId: "missingSpace",
				line: 3,
				column: 2,
			},
		],
	},

	// Special cases
	{
		code: "#Heading with trailing space ",
		output: "# Heading with trailing space ",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
	{
		code: "#Text",
		output: "# Text",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
];

ruleTester.run("no-missing-space-atx", rule, {
	valid: [...validHeadings, ...nonHeadings, ...codeBlocks, ...edgeTestCases],
	invalid: invalidTests,
});
