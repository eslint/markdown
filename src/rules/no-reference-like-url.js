/**
 * @fileoverview Rule to enforce reference-style links when URL matches a defined identifier.
 * @author TKDev7
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { normalizeIdentifier } from "micromark-util-normalize-identifier";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Link, Image } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"referenceLikeUrl"} NoReferenceLikeUrlMessageIds
 * @typedef {[]} NoReferenceLikeUrlOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoReferenceLikeUrlOptions, MessageIds: NoReferenceLikeUrlMessageIds }>} NoReferenceLikeUrlRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoReferenceLikeUrlRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow URLs that match defined reference identifiers",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-reference-like-url.md",
		},

		fixable: "code",

		messages: {
			referenceLikeUrl:
				"Unexpected resource {{type}} ('{{prefix}}[text](url)') with URL that matches a definition identifier. Use '[text][id]' syntax instead.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		/** @type {Set<string>} */
		const definitionIdentifiers = new Set();
		/** @type {Array<Link|Image>} */
		const resources = [];

		return {
			"root:exit"() {
				for (const node of resources) {
					const url = normalizeIdentifier(node.url).toLowerCase();

					if (definitionIdentifiers.has(url)) {
						context.report({
							node,
							messageId: "referenceLikeUrl",
							data: {
								type: node.type,
								prefix: node.type === "image" ? "!" : "",
							},
							fix(fixer) {
								if (node.title !== null) {
									return null;
								}

								const text = sourceCode.getText(node);

								const bracketParenIndex = text.indexOf("](");
								const closeParenIndex = text.lastIndexOf(")");

								const startOffset =
									node.position.start.offset +
									bracketParenIndex +
									1;
								const endOffset =
									node.position.start.offset +
									closeParenIndex +
									1;

								return fixer.replaceTextRange(
									[startOffset, endOffset],
									`[${node.url}]`,
								);
							},
						});
					}
				}
			},

			definition(node) {
				definitionIdentifiers.add(node.identifier);
			},

			link(node) {
				if (sourceCode.getText(node).startsWith("[")) {
					resources.push(node);
				}
			},

			image(node) {
				resources.push(node);
			},
		};
	},
};
