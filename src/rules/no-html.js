/**
 * @fileoverview Rule to disallow HTML inside of content.
 * @author Nicholas C. Zakas
 */

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
	/<(?<tagName>[a-z0-9]+(?:-[a-z0-9]+)*)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>/giu;
const lineEndingPattern = /\r\n?|\n/u;

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
		const allowedElements = new Set(
			allowedIgnoreCase ? allowed.map(tag => tag.toLowerCase()) : allowed,
		);

		return {
			html(node) {
				/** @type {RegExpExecArray} */
				let match;

				while ((match = htmlTagPattern.exec(node.value)) !== null) {
					const fullMatch = match[0];
					const { tagName } = match.groups;
					const startOffset =
						node.position.start.offset + match.index;

					const firstNewlineIndex =
						fullMatch.search(lineEndingPattern);

					const endOffset =
						firstNewlineIndex === -1
							? startOffset + fullMatch.length
							: startOffset + firstNewlineIndex;

					const tagToCheck = allowedIgnoreCase
						? tagName.toLowerCase()
						: tagName;

					if (!allowedElements.has(tagToCheck)) {
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
