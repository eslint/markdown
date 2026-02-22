/**
 * @fileoverview Tests for no-missing-link-fragments rule.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-missing-link-fragments.js";
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
	language: "markdown/gfm",
});

ruleTester.run("no-missing-link-fragments", rule, {
	valid: [
		// Basic heading match with `Link` node
		dedent`
		# Heading Name
		[Link](#heading-name)
		`,

		// Basic heading match with `Definition` node
		dedent`
		# Heading Name
		[Link][reference]

		[reference]: #heading-name
		`,

		// Custom heading ID
		dedent`
		# Heading Name {#custom-name}
		[Link](#custom-name)
		`,

		// HTML `h1` tags
		dedent`
		<h1>heading 1</h1>

		[Link](#heading-1)
		`,

		dedent`
		<H1>heading 1</H1>

		[Link](#heading-1)
		`,

		dedent`
		<h1>HEADING 1</h1>

		[Link](#heading-1)
		`,

		dedent`
		<h1>HeAdInG 1</h1>

		[Link](#heading-1)
		`,

		dedent`
		<h1>{ } scss-to-css</h1>
		
		[Link](#--scss-to-css)
		`, // https://github.com/eslint/markdown/issues/582

		dedent`
		<h1>👍 scss-to-css</h1>

		[Link](#-scss-to-css)
		`, // https://github.com/eslint/markdown/issues/582

		dedent`
		<h1>scss-to-css</h1>
		
		[Link](#scss-to-css)
		`, // https://github.com/eslint/markdown/issues/582

		// HTML `h1` tags with children
		dedent`
		<h1>heading <strong>1</strong></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <strong><em>1</em></strong></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading  <strong><em>1</em></strong></h1>
		
		[Link](#heading--1)
		`,

		dedent`
		<h1>heading  <strong><em> 1 </em></strong></h1>

		[Link](#heading---1-)
		`,

		dedent`
		<h1>heading <em>1</em></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <EM>1</EM></h1>

		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em data-test="test">1</em></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em data-test="test >">1</em></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em data-test="test <>">1</em></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em>1</em data-test="test"></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em>1</em data-test="test >"></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em>1</em data-test="test <>"></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em data-test="test">1</em data-test="test"></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em data-test="test >">1</em data-test="test >"></h1>
		
		[Link](#heading-1)
		`,

		dedent`
		<h1>heading <em data-test="test <>">1</em data-test="test <>"></h1>
		
		[Link](#heading-1)
		`,

		// HTML `h2` tags
		dedent`
		<h2>heading 2</h2>

		[Link](#heading-2)
		`,

		dedent`
		<H2>heading 2</H2>

		[Link](#heading-2)
		`,

		// HTML `h3` tags
		dedent`
		<h3>heading 3</h3>

		[Link](#heading-3)
		`,

		dedent`
		<H3>heading 3</H3>

		[Link](#heading-3)
		`,

		// HTML `h4` tags
		dedent`
		<h4>heading 4</h4>

		[Link](#heading-4)
		`,

		dedent`
		<H4>heading 4</H4>

		[Link](#heading-4)
		`,

		// HTML `h5` tags
		dedent`
		<h5>heading 5</h5>

		[Link](#heading-5)
		`,

		dedent`
		<H5>heading 5</H5>

		[Link](#heading-5)
		`,

		// HTML `h6` tags
		dedent`
		<h6>heading 6</h6>

		[Link](#heading-6)
		`,

		dedent`
		<H6>heading 6</H6>

		[Link](#heading-6)
		`,

		// HTML anchor tags
		dedent`
		<a id="bookmark"></a>
		[Link](#bookmark)
		`,

		// HTML anchor tags case-insensitive
		dedent`
		<a ID="bookmark"></a>
		[Link](#bookmark)
		`,

		// HTML anchor tags case-insensitive
		dedent`
		<a Id="bookmark"></a>
		[Link](#bookmark)
		`,

		// HTML name attribute
		dedent`
		<a name="old-style"></a>
		[Link](#old-style)
		`,

		// HTML name attribute case-insensitive
		dedent`
		<a NAME="old-style"></a>
		[Link](#old-style)
		`,

		// HTML name attribute case-insensitive
		dedent`
		<a NaMe="old-style"></a>
		[Link](#old-style)
		`,

		dedent`
		<h1 id="bookmark">Bookmark</h1>
		<h1 name="old-style">Old Style</h1>
		<h2 id="bookmark-2">Bookmark 2</h2>
		<h2 name="old-style-2">Old Style 2</h2>
		<h3 id="bookmark-3">Bookmark 3</h3>
		<h3 name="old-style-3">Old Style 3</h3>
		<h4 id="bookmark-4">Bookmark 4</h4>
		<h4 name="old-style-4">Old Style 4</h4>
		<h5 id="bookmark-5">Bookmark 5</h5>
		<h5 name="old-style-5">Old Style 5</h5>
		<h6 id="bookmark-6">Bookmark 6</h6>
		<h6 name="old-style-6">Old Style 6</h6>
		
		[Link](#bookmark)
		[Link](#old-style)
		[Link](#bookmark-2)
		[Link](#old-style-2)
		[Link](#bookmark-3)
		[Link](#old-style-3)
		[Link](#bookmark-4)
		[Link](#old-style-4)
		[Link](#bookmark-5)
		[Link](#old-style-5)
		[Link](#bookmark-6)
		[Link](#old-style-6)
		`,

		// HTML id/name attributes using unquoted values and spaces around equals sign
		dedent`
		<h1 id=bookmark>Bookmark</h1>
		<h1 name=old-style>Old Style</h1>
		<h2 id = bookmark-2>Bookmark 2</h2>
		<h2 name = old-style-2>Old Style 2</h2>
		<h3 id= bookmark-3>Bookmark 3</h3>
		<h3 name= old-style-3>Old Style 3</h3>
		<h4 id =bookmark-4>Bookmark 4</h4>
		<h4 name =old-style-4>Old Style 4</h4>
		<h5 id='bookmark-5'>Bookmark 5</h5>
		<h5 name='old-style-5'>Old Style 5</h5>
		<h6 id = 'bookmark-6'>Bookmark 6</h6>
		<h6 name = 'old-style-6'>Old Style 6</h6>
		<h6 id= 'bookmark-7'>Bookmark 7</h6>
		<h6 name= 'old-style-7'>Old Style 7</h6>
		<h6 id ='bookmark-8'>Bookmark 8</h6>
		<h6 name ='old-style-8'>Old Style 8</h6>
		<h6 id="bookmark-9">Bookmark 9</h6>
		<h6 name="old-style-9">Old Style 9</h6>
		<h6 id = "bookmark-10">Bookmark 10</h6>
		<h6 name = "old-style-10">Old Style 10</h6>
		<h6 id= "bookmark-11">Bookmark 11</h6>
		<h6 name= "old-style-11">Old Style 11</h6>
		<h6 id ="bookmark-12">Bookmark 12</h6>
		<h6 name ="old-style-12">Old Style 12</h6>
		
		[Link](#bookmark)
		[Link](#old-style)
		[Link](#bookmark-2)
		[Link](#old-style-2)
		[Link](#bookmark-3)
		[Link](#old-style-3)
		[Link](#bookmark-4)
		[Link](#old-style-4)
		[Link](#bookmark-5)
		[Link](#old-style-5)
		[Link](#bookmark-6)
		[Link](#old-style-6)
		[Link](#bookmark-7)
		[Link](#old-style-7)
		[Link](#bookmark-8)
		[Link](#old-style-8)
		[Link](#bookmark-9)
		[Link](#old-style-9)
		[Link](#bookmark-10)
		[Link](#old-style-10)
		[Link](#bookmark-11)
		[Link](#old-style-11)
		[Link](#bookmark-12)
		[Link](#old-style-12)
		`,

		dedent`
		# foo bar baz
		# foo-bar-baz

		[Link](#foo-bar-baz)
		[Link](#foo-bar-baz-1)
		`,

		// Special #top link
		"[Link](#top)",

		// GitHub line references with actual content
		dedent`
		# Sample Code Section
		
		\`\`\`js
		// Line 1: Function declaration
		function add(a, b) {
			// Line 2: Add numbers
			return a + b;
		}
		
		// Line 3: Function call
		const result = add(1, 2);
		
		// Line 4: Log result
		console.log(result);
		\`\`\`
		
		[Reference Line 2](#L6)
		[Reference Lines 2-4](#L6-L12)
		[Reference Line with Column](#L6C13)
		[Reference Line Range with Columns](#L6C13-L8C1)
		`,

		// Case-insensitive matching
		dedent`
		# Heading Name
		[Link](#HEADING-NAME)
		`,
		dedent`
		# Heading Name
		[Link](#HeAdInG-nAmE)
		`,
		dedent`
		# Heading Name
		[Link](#Heading-Name)
		`,

		// Ignored pattern (with option)
		{
			code: dedent`
			[Link](#figure-1)
			[Link](#figure-2)
			`,
			options: [{ allowPattern: "^figure-" }],
		},

		// Multiple identical headings
		dedent`
		# Duplicate
		[Link](#duplicate)
		# Duplicate
		[Link to second Duplicate](#duplicate-1)
		# Duplicate {#custom-dup}
		[Link to custom Duplicate](#custom-dup)
		# Duplicate
		[Link to third Duplicate](#duplicate-2)
		`,

		// Special characters in heading
		dedent`
		# Special & < > Characters!
		[Link](#special----characters)
		`,

		// Non-fragment links
		"[External](https://example.com)",
		"[Root](/)",
		"[Empty]()",

		// Empty fragment (handled by no-empty-links rule)
		"[Link](#)",

		// Multiple headings and links
		dedent`
		# First Heading
		## Second Heading
		### Third Heading
		
		[Link 1](#first-heading)
		[Link 2](#second-heading)
		[Link 3](#third-heading)
		`,

		// HTML elements with IDs
		dedent`
		<div id="section1">Content</div>
		[Link](#section1)
		`,

		// Headings with inline Markdown formatting
		dedent`
		# Heading with \`inline code\`
		[Link](#heading-with-inline-code)

		# Heading with *italic text*
		[Link](#heading-with-italic-text)

		# Heading with _italic too_
		[Link](#heading-with-italic-too)

		# Heading with **bold text**
		[Link](#heading-with-bold-text)

		# Heading with __bold too__
		[Link](#heading-with-bold-too)

		# Heading with ~strikethrough~
		[Link](#heading-with-strikethrough)
		`,

		// Headings with emojis and accented characters
		// This test case is skipped when running on Bun
		...(!process.versions.bun
			? [
					dedent`
					# Heading with 🚀 emoji
					[Link](#heading-with--emoji)

					# Héading with àccènt chàrâctérs
					[Link](#héading-with-àccènt-chàrâctérs)

					# Mix: _Héading_ with 🚀 & \`code\`
					[Link](#mix-héading-with---code)
					`,
					dedent`
					# Hèading
					[Link](#h%C3%A8ading)

					# Hèading with \`inline code\`
					[Link](#h%C3%A8ading-with-inline-code)

					# Héading with _italic_
					[Link](#h%C3%A9ading-with-italic)

					# Héading with **bold**
					[Link](#h%C3%A9ading-with-bold)

					# Heading Name {#custom-namé}
					[Link](#custom-nam%C3%A9)

					<div id="réal-id"></div>

					[Link](#r%C3%A9al-id)
					`,
					{
						code: dedent`
						# Héading Name
						[Link](#H%C3%89ADING-NAME)
						`,
						options: [{ ignoreCase: true }],
					},
					{
						code: dedent`
						[Link](#figur%C3%A9-1)
						[Link](#figur%C3%A9-2)
						`,
						options: [{ allowPattern: "^figuré-" }],
					},
				]
			: []),

		{
			code: '<div id="HtmlCaseCheck"></div>\n[Link](#htmlcasecheck)',
			options: [{ ignoreCase: true }],
		},

		// Valid: HTML ID inside comment is ignored, link to valid ID still works
		dedent`
		<!-- <div id="commented-out"></div> -->
		<div id="real-id"></div>
		[Link](#real-id)
		`,

		dedent`
		# Heading with _italic_
		[Link](#heading-with-italic)

		# Heading with **bold**
		[Link](#heading-with-bold)

		# foo_
		[Link](#foo_)
		`,
		dedent`
		# <picture></picture> Heading Name
		[Link](#-heading-name)
		`,
		dedent`
		# Heading Name <picture></picture>
		[Link](#heading-name-)
		`,
		dedent`
		# Heading <picture></picture> Name
		[Link](#heading--name)
		`,
		dedent`
		# <span>Text</span> Heading Name
		[Link](#text-heading-name)
		`,
		dedent`
		# ![alt text](img.png) Heading Name
		[Link](#-heading-name)
		`,
		dedent`
		# Heading Name ![alt text](img.png)
		[Link](#heading-name-)
		`,
		{
			code: dedent`
			# <picture></picture> Heading Name
			[Link](#-HEADING-NAME)
			`,
			options: [{ ignoreCase: true }],
		},
	],

	invalid: [
		// Basic invalid case with `Link` node
		{
			code: dedent`
			[Invalid](#non-existent)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "non-existent" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 25,
				},
			],
		},

		// Basic invalid case with `Definition` node
		{
			code: dedent`
			[Invalid][reference]

			[reference]: #non-existent
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "non-existent" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 27,
				},
			],
		},

		// Basic invalid case with HTML tags
		{
			code: dedent`
			<h1>heading 1</h1>

			[Invalid](#non-existent)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "non-existent" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 25,
				},
			],
		},
		{
			code: dedent`
			<h7>heading 1</h7>

			[Invalid](#heading-1)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "heading-1" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
			<h8>heading 1</h8>

			[Invalid](#heading-1)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "heading-1" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 22,
				},
			],
		},

		// Case-sensitive mismatch (with ignoreCase false option)
		{
			code: dedent`
			# Heading Name
			[Invalid](#HEADING-NAME)
			`,
			options: [{ ignoreCase: false }],
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "HEADING-NAME" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 25,
				},
			],
		},

		// Invalid with existing headings
		{
			code: dedent`
			# Heading
			[Invalid](#wrong-heading)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "wrong-heading" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 26,
				},
			],
		},

		// Multiple invalid links
		{
			code: dedent`
			# Heading
			[Invalid 1](#wrong1)
			[Invalid 2](#wrong2)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "wrong1" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 21,
				},
				{
					messageId: "invalidFragment",
					data: { fragment: "wrong2" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 21,
				},
			],
		},

		// Invalid custom ID format
		{
			code: dedent`
			# Heading {#Invalid-ID-With-Caps}
			[Link](#Invalid-ID-With-Caps)
			`,
			options: [{ ignoreCase: false }],
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "Invalid-ID-With-Caps" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 30,
				},
			],
		},

		// Special characters in fragment
		{
			code: dedent`
			# Heading
			[Invalid](#heading@#$%)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "heading@#$%" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 24,
				},
			],
		},

		// Invalid GitHub line reference format
		{
			code: dedent`
			\`\`\`js
			// Some code
			\`\`\`
			[Invalid Format](#L2O)  // Using O instead of 0
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "L2O" },
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 23,
				},
			],
		},
		{
			code: dedent`
			[Invalid Format](#l20)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "l20" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: dedent`
			[Invalid Format](#l20-l30)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "l20-l30" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 27,
				},
			],
		},

		// Invalid link to suffixed heading that shouldn't exist
		{
			code: dedent`
			# Only One Like This
			[Invalid Link](#only-one-like-this-1)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "only-one-like-this-1" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 38,
				},
			],
		},
		// Invalid: Link to an ID that only exists inside an HTML comment
		{
			code: dedent`
			<!-- <div id="only-in-comment"></div> -->
			[Link](#only-in-comment)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "only-in-comment" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 25,
				},
			],
		},

		// Invalid: Link to non-existent ID with unquoted attributes
		{
			code: dedent`
			<h1 id=bookmark>Bookmark</h1>

			[Link](#notfound)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "notfound" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
			],
		},

		// Invalid: Link to non-existent ID with spaced attributes
		{
			code: dedent`
			<h2 id = bookmark-2>Bookmark 2</h2>

			[Link](#notfound)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "notfound" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
			],
		},

		// Invalid: Link to non-existent name attribute
		{
			code: dedent`
			<h3 name=old-style-3>Old Style 3</h3>

			[Link](#notfound)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "notfound" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
			],
		},

		// Invalid: Link to non-existent ID with quoted attributes
		{
			code: dedent`
			<h4 id="bookmark-4">Bookmark 4</h4>

			[Link](#notfound)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "notfound" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
			],
		},

		// Invalid: Link to non-existent ID with spaced quoted attributes
		{
			code: dedent`
			<h5 id = "bookmark-5">Bookmark 5</h5>

			[Link](#notfound)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "notfound" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
			<h1 id="one"> 
			<!-- comment <h1 id="two"> </h1> -->
			</h1>

			[Link](#two)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "two" },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
			# foo

			## foo

			[Link](#foo)

			[Link](#foo-1)

			[Link](#foo-2)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "foo-2" },
					line: 9,
					column: 1,
					endLine: 9,
					endColumn: 15,
				},
			],
		},
		{
			code: dedent`
			# foo

			## foo-1

			### foo-1

			[Link](#foo)

			[Link](#foo-1)

			[Link](#foo-1-1)

			[Link](#foo-2)

			[Link](#foo-1-2)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "foo-2" },
					line: 13,
					column: 1,
					endLine: 13,
					endColumn: 15,
				},
				{
					messageId: "invalidFragment",
					data: { fragment: "foo-1-2" },
					line: 15,
					column: 1,
					endLine: 15,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`
			# Heading With Space
			[Invalid](#heading%20with%20space)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "heading%20with%20space" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 35,
				},
			],
		},
		// Headings with accented characters
		// This test case is skipped when running on Bun
		...(!process.versions.bun
			? [
					{
						code: dedent`
						# fóo
			
						## fóo
			
						[Link](#f%C3%B3o)
			
						[Link](#f%C3%B3o-1)
			
						[Link](#f%C3%B3o-2)
						`,
						errors: [
							{
								messageId: "invalidFragment",
								data: { fragment: "f%C3%B3o-2" },
								line: 9,
								column: 1,
								endLine: 9,
								endColumn: 20,
							},
						],
					},
				]
			: []),
		{
			code: dedent`
			# <picture></picture> Heading Name
			[Link](#heading-name)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "heading-name" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
			# ![alt text](img.png) Heading Name
			[Link](#heading-name)
			`,
			errors: [
				{
					messageId: "invalidFragment",
					data: { fragment: "heading-name" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 22,
				},
			],
		},
	],
});

// https://github.com/eslint/markdown/pull/463
it("`no-missing-link-fragments` should not timeout for large inputs", () => {
	const inputs = [
		`<div>${"<".repeat(500_000)}x</div>`,
		`<div><${" ".repeat(500_000)}x</div>`,
	];

	const linter = new Linter();
	for (const input of inputs) {
		linter.verify(input, {
			language: "markdown/commonmark",
			plugins: { markdown },
			rules: { "markdown/no-missing-link-fragments": "error" },
		});
	}
});
