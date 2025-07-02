/**
 * @fileoverview Tests for heading-increment rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/heading-increment.js";
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

ruleTester.run("heading-increment", rule, {
	valid: [
		"# Heading 1",
		"## Heading 2",
		dedent`
		# Heading 1
        ## Heading 2`,
		dedent`
		# Heading 1
        # Heading 2`,
		dedent`
		Only one h1
		===========`,
		dedent`
		Heading 1
		==========
		Heading 2
		----------`,
		dedent`
		# Heading 1
		\`\`\`markdown
		### Heading 3
		\`\`\``,
		dedent`
		<p>
		# Not heading
		### Not heading
		</p>`,
		{
			code: dedent`
			    ---
				[ "title" ]
				---
				### Heading 3
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
				### Heading 3
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
				### Heading 3
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
				### Heading 3
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
				---
				title: "My Title"
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
				### Heading 3
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
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				author: xbinaryx # title: My Title
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				author = "xbinaryx" # title = "My Title"
				+++
				### Heading 3
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
				---
				heading: "My Title"
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
				### Heading 3
			`,
			options: [{ frontmatterTitle: '^\\s*"heading"\\s*:' }],
			languageOptions: {
				frontmatter: "json",
			},
		},
		{
			code: dedent`
				---
				author: xbinaryx
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				+++
				author = "xbinaryx"
				+++
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
		},
		{
			code: dedent`
				---
				{
					"author": "xbinaryx"
				}
				---
				### Heading 3
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
				### Heading 3
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
				### Heading 3
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "yaml",
			},
		},
		{
			code: dedent`
				---
				title: "My Title"
				---
				### Heading 3
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
				### Heading 3
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
				### Heading 3
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "json",
			},
		},
	],
	invalid: [
		{
			code: dedent`
                # Heading 1

                ### Heading 3
            `,
			errors: [
				{
					messageId: "skippedHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 14,
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
				},
			],
		},
		{
			code: dedent`
                ## Heading 2

                ##### Heading 5
            `,
			errors: [
				{
					messageId: "skippedHeading",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 16,
					data: {
						fromLevel: 2,
						toLevel: 5,
					},
				},
			],
		},
		{
			code: dedent`
                Heading 1
                =========

                ### Heading 3
            `,
			errors: [
				{
					messageId: "skippedHeading",
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				### Heading 3
				###### Heading 6
			`,
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 14,
				},
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 3,
						toLevel: 6,
					},
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				> ### Quoted heading
			`,
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 2,
					column: 3,
					endLine: 2,
					endColumn: 21,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				> > ### Double-quoted heading
			`,
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 30,
				},
			],
		},
		{
			code: dedent`
				# Heading 1
				- Item
				  item
				  > ### Quoted heading in list
			`,
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 5,
					endLine: 4,
					endColumn: 31,
				},
			],
		},
		{
			code: dedent`
				---
				---
				# Heading 1
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				title: My Title
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				title: "My Title"
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				"title": My Title
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				"title": "My Title"
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				"title" = "My Title"
				+++
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				{ "title": "My Title" }
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: '---\n   {    "title": "My Title" }\n---\n### Heading 3',
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
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
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				'title': My Title
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				'title': "My Title"
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				'title' = "My Title"
				+++
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				author: xbinaryx
				title: My Title
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				author = "xbinaryx"
				title = "My Title"
				+++
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				{
					"author": "xbinaryx",
					"title": "My Title"
				}
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				TITLE: My Title
				---
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				TITLE = "My Title"
				+++
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
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
				### Heading 3
			`,
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				heading: My Title
				---
				### Heading 3
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*:" }],
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				heading: "My Title"
				---
				### Heading 3
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*:" }],
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				heading = "My Title"
				+++
				### Heading 3
			`,
			options: [{ frontmatterTitle: "^\\s*heading\\s*=" }],
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 14,
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
				### Heading 3
			`,
			options: [{ frontmatterTitle: '^\\s*"heading"\\s*:' }],
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 6,
					column: 1,
					endLine: 6,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				title: My Title
				---
				# Heading 1
				### Heading 3
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				---
				title: "My Title"
				---
				# Heading 1
				### Heading 3
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "yaml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				+++
				title = "My Title"
				+++
				# Heading 1
				### Heading 3
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "toml",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 14,
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
				### Heading 3
			`,
			options: [{ frontmatterTitle: "" }],
			languageOptions: {
				frontmatter: "json",
			},
			errors: [
				{
					messageId: "skippedHeading",
					data: {
						fromLevel: 1,
						toLevel: 3,
					},
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 14,
				},
			],
		},
	],
});
