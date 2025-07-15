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
	language: "markdown/gfm",
});

ruleTester.run("no-missing-link-fragments", rule, {
	valid: [
		// Basic heading match
		dedent`
		# Heading Name
		[Link](#heading-name)
		`,

		// Custom heading ID
		dedent`
		# Heading Name {#custom-name}
		[Link](#custom-name)
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
		// This test case is skipped for non-Node environments like Bun
		...(typeof process !== "undefined" &&
		process.release &&
		process.release.name === "node" &&
		(!process.versions || !process.versions.bun)
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
		// Basic invalid case
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
		// This test case is skipped for non-Node environments like Bun
		...(typeof process !== "undefined" &&
		process.release &&
		process.release.name === "node" &&
		(!process.versions || !process.versions.bun)
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
