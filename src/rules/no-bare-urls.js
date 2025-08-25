/**
 * @fileoverview Rule to prevent bare URLs in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Link, Html } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"bareUrl"} NoBareUrlsMessageIds
 * @typedef {[]} NoBareUrlsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoBareUrlsOptions, MessageIds: NoBareUrlsMessageIds }>} NoBareUrlsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const htmlTagNamePattern = /^<(?<tagName>[^!>][^/\s>]*)/u;

/**
 * Parses an HTML tag to extract its name and closing status
 * @param {string} tagText The HTML tag text to parse
 * @returns {{ name: string, isClosing: boolean } | null} Object containing tag name and closing status, or null if not a valid tag
 */
function parseHtmlTag(tagText) {
	const match = tagText.match(htmlTagNamePattern);
	if (match) {
		const tagName = match.groups.tagName.toLowerCase();
		const isClosing = tagName.startsWith("/");

		return {
			name: isClosing ? tagName.slice(1) : tagName,
			isClosing,
		};
	}

	return null;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoBareUrlsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow bare URLs",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-bare-urls.md",
		},

		fixable: "code",

		messages: {
			bareUrl:
				"Unexpected bare URL. Use autolink (<URL>) or link ([text](URL)) instead.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		/** @type {Array<Link>} */
		const linkNodes = [];
		/** @type {Array<Link>} */
		const tempLinkNodes = [];

		/** @type {string | null} */
		let lastTagName = null;

		/**
		 * Resets `tempLinkNodes` and `lastTagName`
		 * @returns {void}
		 */
		function reset() {
			tempLinkNodes.length = 0;
			lastTagName = null;
		}

		return {
			":matches(heading, paragraph, tableCell) html"(
				/** @type {Html} */ node,
			) {
				const tagInfo = parseHtmlTag(node.value);

				if (!tagInfo) {
					return;
				}

				if (!tagInfo.isClosing && lastTagName === null) {
					lastTagName = tagInfo.name;
				}

				if (tagInfo.isClosing && lastTagName === tagInfo.name) {
					reset();
				}
			},

			":matches(heading, paragraph, tableCell) link"(
				/** @type {Link} */ node,
			) {
				if (lastTagName !== null) {
					tempLinkNodes.push(node);
				} else {
					linkNodes.push(node);
				}
			},

			"heading:exit"() {
				linkNodes.push(...tempLinkNodes);
				reset();
			},

			"paragraph:exit"() {
				linkNodes.push(...tempLinkNodes);
				reset();
			},

			"tableCell:exit"() {
				linkNodes.push(...tempLinkNodes);
				reset();
			},

			"root:exit"() {
				for (const linkNode of linkNodes) {
					const text = sourceCode.getText(linkNode);
					const { url } = linkNode;

					if (
						url === text ||
						url === `http://${text}` ||
						url === `mailto:${text}`
					) {
						context.report({
							node: linkNode,
							messageId: "bareUrl",
							fix(fixer) {
								return fixer.replaceText(linkNode, `<${text}>`);
							},
						});
					}
				}
			},
		};
	},
};
