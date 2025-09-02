/**
 * @fileoverview Rule to disallow HTML inside of content.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets } from "../util.js";

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
	/<([a-z0-9]+(?:-[a-z0-9]+)*)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>/giu;
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
		const [{ allowed, allowedIgnoreCase }] = context.options;
		const allowedElements = new Set(
			allowedIgnoreCase ? allowed.map(tag => tag.toLowerCase()) : allowed,
		);

		return {
			html(node) {
				let match;

				while ((match = htmlTagPattern.exec(node.value)) !== null) {
					const fullMatch = match[0];
					const tagName = match[1];
					const { lineOffset, columnOffset } = findOffsets(
						node.value,
						match.index,
					);
					const start = {
						line: node.position.start.line + lineOffset,
						column: node.position.start.column + columnOffset,
					};

					const firstNewlineIndex =
						fullMatch.search(lineEndingPattern);
					const endColumn =
						firstNewlineIndex === -1
							? start.column + fullMatch.length
							: start.column + firstNewlineIndex;

					const end = {
						line: start.line,
						column: endColumn,
					};

					const tagToCheck = allowedIgnoreCase
						? tagName.toLowerCase()
						: tagName;
					if (
						allowedElements.size === 0 ||
						!allowedElements.has(tagToCheck)
					) {
						context.report({
							loc: { start, end },
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
