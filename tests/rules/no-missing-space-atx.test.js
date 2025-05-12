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

//------------------------------------------------------------------------------
// Valid Test Cases
//------------------------------------------------------------------------------

const validHeadings = [
	// 1. Valid ATX headings with proper space (all heading levels)
	"# Heading 1",
	"## Heading 2",
	"### Heading 3",
	"#### Heading 4",
	"##### Heading 5",
	"###### Heading 6",

	// 2. Multiple headings with proper spacing in a single document
	dedent`# Heading 1

	## Heading 2
	
	### Heading 3`,

	// 3. Extra space after hash is valid
	"#  Heading with extra space",

	// 4. Not headings - single hash characters
	"#",

	// 5. Setext headings (not covered by this rule)
	"Heading 1\n=========",
	"Heading 2\n---------",

	// 6. Text containing hash characters (not headings)
	"Not a heading",
	"This is a paragraph with a #hashtag",
	"Text with # in the middle",

	// 7. Code blocks of various types
	// 7.1 Fenced code blocks with hash symbols should be ignored
	'```js\n#Not a heading in a code block\nconsole.log("#Not a heading");\n```',

	// 7.2 Empty code blocks
	"```",

	// 7.3 Code blocks with language markers
	"``` followed by text",
	"~~~ followed by more text",

	// 7.4 Paragraph followed by code block that starts with hash
	dedent`This is a paragraph followed by code.
	
\`\`\`
#This is in a code block
\`\`\``,

	// 8. Inline code with hash
	"This paragraph has `#inline-code` which is not a heading",
	"Here's a code span with a hash: `const tag = '#heading'`",
];

//------------------------------------------------------------------------------
// Invalid Test Cases
//------------------------------------------------------------------------------

const invalidTests = [
	// 1. Basic ATX headings without space (all 6 levels)
	{
		code: "#Heading 1",
		output: "# Heading 1",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
	{
		code: "##Heading 2",
		output: "## Heading 2",
		errors: [{ messageId: "missingSpace", column: 2 }],
	},
	{
		code: "###Heading 3",
		output: "### Heading 3",
		errors: [{ messageId: "missingSpace", column: 3 }],
	},
	{
		code: "####Heading 4",
		output: "#### Heading 4",
		errors: [{ messageId: "missingSpace", column: 4 }],
	},
	{
		code: "#####Heading 5",
		output: "##### Heading 5",
		errors: [{ messageId: "missingSpace", column: 5 }],
	},
	{
		code: "######Heading 6",
		output: "###### Heading 6",
		errors: [{ messageId: "missingSpace", column: 6 }],
	},

	// 2. Multi-line documents with mixed valid and invalid headings
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

	// 3. Short headings and edge cases
	{
		code: "#Text",
		output: "# Text",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
	{
		code: "#Heading with trailing space ",
		output: "# Heading with trailing space ",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},

	// 4. Headings with code-related characters
	// 4.1 Heading with backticks
	{
		code: "#Something with ``` backticks",
		output: "# Something with ``` backticks",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
	// 4.2 Heading with backticks in middle
	{
		code: "#Heading with ``` in the middle and more text after",
		output: "# Heading with ``` in the middle and more text after",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
	// 4.3 Heading with inline code
	{
		code: "#Heading with `inline code`",
		output: "# Heading with `inline code`",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},
	// 4.4 Heading with tilde markers
	{
		code: "#Title with ~~~ tildes in it",
		output: "# Title with ~~~ tildes in it",
		errors: [{ messageId: "missingSpace", column: 1 }],
	},

	// 5. Complex multi-line scenarios
	// 5.1 Heading with code markers in multi-line context
	{
		code: dedent`Text before
#Heading with \`\`\` code markers - should be fixed
Text after`,
		output: dedent`Text before
# Heading with \`\`\` code markers - should be fixed
Text after`,
		errors: [{ messageId: "missingSpace", line: 2, column: 1 }],
	},
	// 5.2 Multiple headings in one file with errors
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
			{ messageId: "missingSpace", line: 1, column: 1 },
			{ messageId: "missingSpace", line: 5, column: 2 },
			{ messageId: "missingSpace", line: 7, column: 3 },
		],
	},

	// 6. Special case: Indented code block (currently not properly detected as code)
	// NOTE: Unlike fenced code blocks, the current implementation doesn't properly
	// detect indented code blocks as code nodes. Markdown parsers should typically
	// handle this case, but our current AST processing sees this text as regular text
	// with a hash at the beginning, triggering the rule.
	{
		code: dedent`Regular paragraph

    #Not a heading in indented code block
    console.log("#still in code block");`,
		output: dedent`Regular paragraph

    # Not a heading in indented code block
    console.log("#still in code block");`,
		errors: [{ messageId: "missingSpace", line: 3, column: 1 }],
	},
];

ruleTester.run("no-missing-space-atx", rule, {
	valid: validHeadings,
	invalid: invalidTests,
});
