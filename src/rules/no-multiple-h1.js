/**
 * @fileoverview Rule to enforce at most one H1 heading in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { frontmatterHasTitle, stripHtmlComments } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Yaml } from "mdast";
 * @import { MarkdownRuleDefinition, Toml, Json } from "../types.js";
 * @typedef {"multipleH1"} NoMultipleH1MessageIds
 * @typedef {[{ frontmatterTitle?: string }]} NoMultipleH1Options
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMultipleH1Options, MessageIds: NoMultipleH1MessageIds }>} NoMultipleH1RuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const h1TagPattern = /<h1[^>]*>[\s\S]*?<\/\s*h1\s*>/giu; // TODO

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMultipleH1RuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow multiple H1 headings in the same document",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-multiple-h1.md",
		},

		messages: {
			multipleH1: "Unexpected additional H1 heading found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					frontmatterTitle: {
						type: "string",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				frontmatterTitle:
					"^(?!\\s*['\"]title[:=]['\"])\\s*\\{?\\s*['\"]?title['\"]?\\s*[:=]",
			},
		],
	},

	create(context) {
		const { sourceCode } = context;
		const [{ frontmatterTitle }] = context.options;
		const titlePattern =
			frontmatterTitle === "" ? null : new RegExp(frontmatterTitle, "iu");
		let h1Count = 0;

		return {
			"yaml, toml, json"(/** @type {Yaml | Toml | Json} */ node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					h1Count++;
				}
			},

			html(node) {
				const text = stripHtmlComments(node.value);

				/** @type {RegExpExecArray | null} */
				let match;

				while ((match = h1TagPattern.exec(text)) !== null) {
					h1Count++;
					if (h1Count > 1) {
						const startOffset = // Adjust `h1TagPattern` match index to the full source code.
							match.index + node.position.start.offset;
						const endOffset = startOffset + match[0].length;

						context.report({
							loc: {
								start: sourceCode.getLocFromIndex(startOffset),
								end: sourceCode.getLocFromIndex(endOffset),
							},
							messageId: "multipleH1",
						});
					}
				}
			},

			heading(node) {
				if (node.depth === 1) {
					h1Count++;
					if (h1Count > 1) {
						context.report({
							loc: node.position,
							messageId: "multipleH1",
						});
					}
				}
			},
		};
	},
};
