/**
 * @fileoverview Tests for no-missing-atx-heading-space rule.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-atx-heading-space.js";
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

//------------------------------------------------------------------------------
// Valid Test Cases
//------------------------------------------------------------------------------

const validHeadings = [
	// 1. ATX headings with proper spacing
	"# Heading 1",
	"## Heading 2",
	"### Heading 3",
	"#### Heading 4",
	"##### Heading 5",
	"###### Heading 6",

	// 1.1 ATX heading-like text
	"####### Heading 7 (not a valid heading)",
	"#######Heading 7 (not a valid heading)",

	// 2. Document with multiple headings
	dedent`# Heading 1

	## Heading 2
	
	### Heading 3`,

	// 3. Variations on spacing
	"#  Heading with extra space",
	"#\tHeading with tab",

	// 4. Standalone hash
	"#",

	// 5. Alternative heading styles (not covered by this rule)
	"Heading 1\n=========",
	"Heading 2\n---------",

	// 6. Text with hash symbols
	"Not a heading",
	"This is a paragraph with a #hashtag",
	"Text with # in the middle",

	// 7. Code blocks containing hash symbols
	// 7.1 Fenced code blocks
	'```js\n#Not a heading in a code block\nconsole.log("#Not a heading");\n```',

	// 7.2 Empty code block
	"```",

	// 7.3 Code blocks with language identifiers
	"``` #followed #by text",
	"~~~ #followed #by more text",

	// 7.4 Code block after paragraph
	dedent`This is a paragraph followed by code.
	
	\`\`\`
	#This is in a code block
	\`\`\``,

	// 8. Inline code with hash symbols
	"This paragraph has `#inline-code` which is not a heading",
	"Here's a code span with a hash: `const tag = '#heading'`",

	// 9. Markdown links with hash in URLs
	"[#370](https://github.com/eslint/markdown/issues/370)",
	"![#370](https://github.com/eslint/markdown/image.png)",

	// 10. HTML headings (not ATX-style)
	"<h1>Heading 1</h1>",
	"<h2>Heading 2</h2>",
	"<h3>Heading 3</h3>",
	"<h4>Heading 4</h4>",
	"<h5>Heading 5</h5>",
	"<h6>Heading 6</h6>",
	"<h1>#valid heading</h1>",
	"<!-- #valid heading -->",

	// 11. Content inside single quotes and double quotes
	`'#something'`,
	`"#something"`,
	`"<h1>#valid heading</h1>"`,

	// 12. Content starting with more than 4 spaces(turn to codeblock)
	"    #Heading 1",
];

//------------------------------------------------------------------------------
// Invalid Test Cases
//------------------------------------------------------------------------------

const invalidTests = [
	// 1. Missing space after hash in all heading levels
	{
		code: "#Heading 1",
		output: "# Heading 1",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 11,
			},
		],
	},
	{
		code: "##Heading 2",
		output: "## Heading 2",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 12,
			},
		],
	},
	{
		code: "###Heading 3",
		output: "### Heading 3",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 13,
			},
		],
	},
	{
		code: "####Heading 4",
		output: "#### Heading 4",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 14,
			},
		],
	},
	{
		code: "#####Heading 5",
		output: "##### Heading 5",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 15,
			},
		],
	},
	{
		code: "######Heading 6",
		output: "###### Heading 6",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 16,
			},
		],
	},

	// 2. Mixed valid and invalid headings in one document
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
				column: 1,
				endLine: 3,
				endColumn: 12,
			},
		],
	},

	// 3. Simple heading variations
	{
		code: "#Text",
		output: "# Text",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 6,
			},
		],
	},
	{
		code: "#Heading with trailing space ",
		output: "# Heading with trailing space ",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 30,
			},
		],
	},

	// 4. Headings containing code-like syntax
	// 4.1 With fenced code markers
	{
		code: "#Something with ``` backticks",
		output: "# Something with ``` backticks",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 30,
			},
		],
	},
	// 4.2 With backticks mid-heading
	{
		code: "#Heading with ``` in the middle and more text after",
		output: "# Heading with ``` in the middle and more text after",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 52,
			},
		],
	},
	// 4.3 With inline code
	{
		code: "#Heading with `inline code`",
		output: "# Heading with `inline code`",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 28,
			},
		],
	},
	// 4.4 With tilde markers
	{
		code: "#Title with ~~~ tildes in it",
		output: "# Title with ~~~ tildes in it",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 29,
			},
		],
	},

	// 5. Multi-line documents
	// 5.1 With code markers in context
	{
		code: dedent`Text before
		#Heading with \`\`\` code markers
		Text after`,
		output: dedent`Text before
		# Heading with \`\`\` code markers
		Text after`,
		errors: [
			{
				messageId: "missingSpace",
				line: 2,
				column: 1,
				endLine: 2,
				endColumn: 31,
			},
		],
	},

	{
		code: "   ##Heading 2",
		output: "   ## Heading 2",
		errors: [
			{
				messageId: "missingSpace",
				line: 1,
				column: 4,
				endLine: 1,
				endColumn: 15,
			},
		],
	},
	// 5.2 Multiple incorrect headings in one file
	{
		code: dedent`#First heading
		
		Some text
		
		##Second heading
		
		###Third heading`,
		output: dedent`# First heading
		
		Some text
		
		## Second heading
		
		### Third heading`,
		errors: [
			{
				messageId: "missingSpace",
				line: 1,
				column: 1,
				endLine: 1,
				endColumn: 15,
			},
			{
				messageId: "missingSpace",
				line: 5,
				column: 1,
				endLine: 5,
				endColumn: 17,
			},
			{
				messageId: "missingSpace",
				line: 7,
				column: 1,
				endLine: 7,
				endColumn: 17,
			},
		],
	},

	// 6. Emphasis handling
	{
		code: "#*hi*",
		output: "# *hi*",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 6,
			},
		],
	},

	{
		code: "#~hi~",
		output: "# ~hi~",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 6,
			},
		],
	},

	{
		code: "#_hi_",
		output: "# _hi_",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 6,
			},
		],
	},

	{
		code: "#__hi__",
		output: "# __hi__",
		errors: [
			{
				messageId: "missingSpace",
				column: 1,
				line: 1,
				endLine: 1,
				endColumn: 8,
			},
		],
	},

	// 7. Quoted Headings
	{
		code: "> #Quoted heading",
		output: "> # Quoted heading",
		errors: [
			{
				messageId: "missingSpace",
				column: 3,
				line: 1,
				endLine: 1,
				endColumn: 18,
			},
		],
	},
	{
		code: "> ##Quoted heading",
		output: "> ## Quoted heading",
		errors: [
			{
				messageId: "missingSpace",
				column: 3,
				line: 1,
				endLine: 1,
				endColumn: 19,
			},
		],
	},
	{
		code: dedent`- Item
		  > #Quoted heading in list`,
		output: dedent`- Item
		  > # Quoted heading in list`,
		errors: [
			{
				messageId: "missingSpace",
				column: 3,
				line: 2,
				endLine: 2,
				endColumn: 26,
			},
		],
	},
];

ruleTester.run("no-missing-atx-heading-space", rule, {
	valid: validHeadings,
	invalid: invalidTests,
});
