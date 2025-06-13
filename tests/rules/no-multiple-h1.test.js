/**
 * @fileoverview Tests for no-multiple-h1 rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-multiple-h1.js";
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

ruleTester.run("no-multiple-h1", rule, {
	valid: [
		"# Only one h1",
		dedent`
			# Heading 1
			Text
		`,
		dedent`
			# Heading 1 #
			Text
		`,
		dedent`
			# Heading 1
			## Heading 2
		`,
		dedent`
			Only one h1
			===========
		`,
		dedent`
			Heading 1
			==========
			Text
		`,
		dedent`
			Heading 1
			==========
			Heading 2
			----------
		`,
		dedent`
			# Heading 1
			\`\`\`markdown
			# Heading 1-2
			\`\`\`
		`,
		dedent`
			<p>
			# Not heading
			</p>
		`,
		{
			code: dedent`
			    ---
				[ "title" ]
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
			    ---
				[
					"title"
				]
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
			    ---
				[
					"title:"
				]
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
			    ---
				[
					"title="
				]
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				title: My Title
				---
				## Heading 2
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				## Heading 2
			`,
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				{
					"title": "My Title"
				}
				---
				## Heading 2
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				[
					"title"
				]
				---
				## Heading 2
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				# title: My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				# title = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				author: Pixel998 # title: My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				author = "Pixel998" # title = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				heading: My Title
				---
				## Heading 2
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*:" }],
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				heading = "My Title"
				+++
				## Heading 2
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*=" }],
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				{
					"heading": "My Title"
				}
				---
				## Heading 2
			`,
			options: [{ frontmatterTitle: '^\\s*"heading"\\s*:' }],
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				[
					"heading"
				]
				---
				## Heading 2
			`,
			options: [{ frontmatterTitle: '^\\s*"heading"\\s*:' }],
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				author: Pixel998
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				author = "Pixel998"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				{
					"author": "name"
				}
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				[
					"author"
				]
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				title: My Title
				---
				# Heading 1
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				# Heading 1
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				{
					"title": "My Title"
				}
				---
				# Heading 1
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "json",
			},
		},
		'<h1 class="title">Heading</h1>',
		dedent`
			# Heading 1

			<!-- <h1>Commented Heading</h1> -->
			<!-- <h1>Commented Heading</h1> -->
		`,
	],
	invalid: [
		{
			code: dedent`
				# Heading 1
				# Another H1
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				# Heading 2
				# Heading 3
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 12,
				},
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				> # Quoted heading
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 3,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				> > # Double-quoted heading
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 28,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				- Item
				  item
				  > # Quoted heading in list
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 5,
					endLine: 4,
					endColumn: 29,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				Another H1
				==========
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 1,
					endLine: 3,
					endColumn: 11,
				},
			],
		},
		{
			code: dedent`
				Another H1
				==========
				# Heading 1
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				---
				# Heading 1
				# Another H1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				---
				title: My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				"title": My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				+++
				"title" = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				{ "title": "My Title" }
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: '---\n   {    "title": "My Title" }\n---\n# Heading 1',
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"title": "My Title"
				}
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				'title': My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				+++
				'title' = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				{
					'title': 'My Title'
				}
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				author: Pixel998
				title: My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				+++
				author = "Pixel998"
				title = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"author": "name",
					"title": "My Title"
				}
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				TITLE: My Title
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				+++
				TITLE = "My Title"
				+++
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"TITLE": "My Title"
				}
				---
				# Heading 1
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				heading: My Title
				---
				# Heading 1
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*:" }],
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				+++
				heading = "My Title"
				+++
				# Heading 1
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*=" }],
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"heading": "My Title"
				}
				---
				# Heading 1
			`,
			options: [{ frontmatterTitle: '^\\s*"heading"\\s*:' }],
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 12,
				},
			],
		},
		{
			code: dedent`
				---
				title: My Title
				---
				# Heading 1
				# Another H1
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				# Heading 1
				# Another H1
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"title": "My Title"
				}
				---
				# Heading 1
				# Another H1
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				<h1>Heading</h1>

				# Another H1
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				# Heading 1

				<h1 
				class="title">
				Another H1</h1>
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 5,
					endColumn: 16,
				},
			],
		},
		{
			code: dedent`
				# Heading
				<h1>Another H1</h1>
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
				<h1>First H1</h1>

				<h1>Second H1</h1>
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				<h1>First H1</h1>
				<p>Text</p>
				<h1>Second H1</h1>
				<p>Text</p>
				<h1>Third H1</h1>
			`,
			errors: [
				{
					messageId: "multipleH1",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 19,
				},
				{
					messageId: "multipleH1",
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
				---
				title: My Title
				---
				<h1>Another H1</h1>
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				# Heading 1

				<h1>Another H1</h1>
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 12,
				},
				{
					messageId: "multipleH1",
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"title": "My Title"
				}
				---
				# Heading 1
				
				<h1>Another H1</h1>
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "multipleH1",
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 12,
				},
				{
					messageId: "multipleH1",
					line: 8,
					column: 1,
					endLine: 8,
					endColumn: 20,
				},
			],
		},
	],
});
