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
 * @import { Image, Link } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"referenceLikeUrl"} NoReferenceLikeUrlsMessageIds
 * @typedef {[]} NoReferenceLikeUrlsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoReferenceLikeUrlsOptions, MessageIds: NoReferenceLikeUrlsMessageIds }>} NoReferenceLikeUrlsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/** Pattern to match both inline links: `[text](url)` and images: `![alt](url)`, with optional title */
const linkOrImagePattern =
	/\[(?<label>(?:\\.|[^()\\]|\([\s\S]*\))*?)\]\((?<destination>[ \t]*\r?\n?(?<![ \t])[ \t]*(?:<[^>]*>|[^ \t()]+))(?:[ \t]*\r?\n?(?<![ \t])[ \t]*(?:"[^"]*"|'[^']*'|\([^)]*\)))?[ \t]*\r?\n?(?<![ \t])[ \t]*\)$/u;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoReferenceLikeUrlsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow URLs that match defined reference identifiers",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-reference-like-urls.md",
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
		/** @type {Array<Image | Link>} */
		const relevantNodes = [];

		return {
			definition(node) {
				definitionIdentifiers.add(node.identifier);
			},

			"image, link"(/** @type {Image | Link} */ node) {
				relevantNodes.push(node);
			},

			"root:exit"() {
				for (const node of relevantNodes) {
					const text = sourceCode.getText(node);

					const match = linkOrImagePattern.exec(text);
					if (match !== null) {
						const { label, destination } = match.groups;
						const { type, title } = node;
						const prefix = type === "image" ? "!" : "";
						const url =
							normalizeIdentifier(destination).toLowerCase();

						if (definitionIdentifiers.has(url)) {
							context.report({
								loc: node.position,
								messageId: "referenceLikeUrl",
								data: {
									type,
									prefix,
								},
								fix(fixer) {
									// The AST treats both missing and empty titles as null, so it's safe to auto-fix in both cases.
									if (title) {
										return null;
									}

									return fixer.replaceText(
										node,
										`${prefix}[${label}][${destination}]`,
									);
								},
							});
						}
					}
				}
			},
		};
	},
};
