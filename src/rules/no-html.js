/**
 * @fileoverview Rule to disallow HTML inside of content.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { lineEndingPattern, stripHtmlComments } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"disallowedElement"} NoHtmlMessageIds
 * @typedef {[{ allowed?: string[], allowedIgnoreCase?: boolean }]} NoHtmlOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoHtmlOptions, MessageIds: NoHtmlMessageIds }>} NoHtmlRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const htmlTagPattern =
	/<(?<tagName>[a-z0-9]+(?:-[a-z0-9]+)*)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?\/?>/giu; // TODO

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoHtmlRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow HTML tags",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-html.md",
		},

		messages: {
			disallowedElement: 'HTML element "{{name}}" is not allowed.',
		},

		schema: [
			{
				type: "object",
				properties: {
					allowed: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					allowedIgnoreCase: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowed: [],
				allowedIgnoreCase: false,
			},
		],
	},

	create(context) {
		const { sourceCode } = context;
		const [{ allowed, allowedIgnoreCase }] = context.options;

		/**
		 * Normalize a tag name based on the `allowedIgnoreCase` option.
		 * @param {string} tagName The tag name to normalize.
		 * @returns {string} The normalized tag name.
		 */
		function normalizeTagName(tagName) {
			return allowedIgnoreCase ? tagName.toLowerCase() : tagName;
		}

		const allowedElements = new Set(allowed.map(normalizeTagName));

		return {
			html(node) {
				const text = stripHtmlComments(sourceCode.getText(node));

				/** @type {RegExpExecArray | null} */
				let match;

				while ((match = htmlTagPattern.exec(text)) !== null) {
					const fullMatch = match[0];
					const { tagName } = match.groups;
					const firstNewlineIndex =
						fullMatch.search(lineEndingPattern);

					const startOffset = // Adjust `htmlTagPattern` match index to the full source code.
						match.index + node.position.start.offset;
					const endOffset =
						startOffset +
						(firstNewlineIndex === -1
							? fullMatch.length
							: firstNewlineIndex);

					if (!allowedElements.has(normalizeTagName(tagName))) {
						context.report({
							loc: {
								start: sourceCode.getLocFromIndex(startOffset),
								end: sourceCode.getLocFromIndex(endOffset),
							},
							messageId: "disallowedElement",
							data: {
								name: tagName,
							},
						});
					}
				}
			},
		};
	},
};
