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

/** @typedef {import("eslint").Rule.RuleModule} RuleModule */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const htmlTagPattern = /<([a-z0-9]+(?:-[a-z0-9]+)*)/giu;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow HTML tags",
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
				},
				additionalProperties: false,
			},
		],
	},

	create(context) {
		const allowed = new Set(context.options[0]?.allowed);

		return {
			html(node) {
				let match;

				while ((match = htmlTagPattern.exec(node.value)) !== null) {
					const tagName = match[1];
					const { lineOffset, columnOffset } = findOffsets(
						node.value,
						match.index,
					);
					const start = {
						line: node.position.start.line + lineOffset,
						column: node.position.start.column + columnOffset,
					};
					const end = {
						line: start.line,
						column: start.column + match[0].length + 1,
					};

					if (allowed.size === 0 || !allowed.has(tagName)) {
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
