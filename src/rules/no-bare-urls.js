/**
 * @fileoverview Rule to prevent bare URLs in Markdown.
 * @author xbinaryx
 */

/*
 * Here's a note on how the approach (algorithm) works:
 *
 * - When entering an `Html` node that is a child of a `Heading`, `Paragraph` or `TableCell`,
 *   we check whether it is an opening or closing tag.
 *   If we encounter an opening tag, we store the tag name and set `lastTagName`.
 *   (`lastTagName` serves as a state to represent whether we're between opening and closing HTML tags.)
 *   If we encounter a closing tag, we reset the stored tag name and `tempLinkNodes`.
 *
 * - When entering a `Link` node that is a child of a `Heading`, `Paragraph` or `TableCell`,
 *   we check whether it is between opening and closing HTML tags.
 *   If it's between opening and closing HTML tags, we add it to `tempLinkNodes`.
 *   If it's not between opening and closing HTML tags, we add it to `linkNodes`.
 *
 * - When exiting a `Heading`, `Paragraph` or `TableCell`, we add all `tempLinkNodes` to `linkNodes`.
 *   If there are any remaining `tempLinkNodes`, it means they are not between opening and closing HTML tags. (ex. `<br> ... <br>`)
 *   If there are no remaining `tempLinkNodes`, it means they are between opening and closing HTML tags.
 *
 * - When exiting a `root` node, we report all `Link` nodes for bare URLs.
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

		/**
		 * This array is used to store all `Link` nodes for the final report.
		 * @type {Array<Link>}
		 */
		const linkNodes = [];

		/**
		 * This array is used to store `Link` nodes that are estimated to be between opening and closing HTML tags.
		 * @type {Array<Link>}
		 */
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
