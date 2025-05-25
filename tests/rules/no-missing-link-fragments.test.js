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
	language: "markdown/commonmark",
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

		// HTML name attribute
		dedent`
            <a name="old-style"></a>
            [Link](#old-style)
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

		// Case-insensitive matching (with option)
		{
			code: dedent`
                # Heading Name
                [Link](#HEADING-NAME)
            `,
			options: [{ ignoreCase: true }],
		},

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

		// Case-sensitive mismatch (without ignoreCase option)
		{
			code: dedent`
                # Heading Name
                [Invalid](#HEADING-NAME)
            `,
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
	],
});
