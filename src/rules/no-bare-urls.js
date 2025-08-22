/**
 * @fileoverview Rule to prevent bare URLs in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SourceRange } from "@eslint/core"
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

/**
 * Checks if a match is within any skip range
 * @param {number} matchIndex The index of the match
 * @param {Array<SourceRange>} skipRanges The skip ranges
 * @returns {boolean} True if the match is within a skip range
 */
function isInSkipRange(matchIndex, skipRanges) {
	return skipRanges.some(
		range => range[0] <= matchIndex && matchIndex < range[1],
	);
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

		/** @type {string} */
		let lastTagname = "";

		/** @type {Array<SourceRange>} */
		const skipRanges = [];

		/** @type {[number|null,number|null]} */
		const sourceRange = [null, null];

		/** @type {Array<Link>} */
		const linkNodes = [];

		/**
		 * TODO
		 * @param {Html} node TODO
		 * @returns {void}
		 */
		function findHtmlSkipRange(node) {
			const tagInfo = parseHtmlTag(sourceCode.getText(node));

			if (!tagInfo?.isClosing) {
				sourceRange[0] = node.position.start.offset;
				lastTagname = tagInfo.name;
			}

			if (tagInfo?.name === lastTagname && tagInfo?.isClosing) {
				sourceRange[1] = node.position.end.offset;
				skipRanges.push([...sourceRange]);

				lastTagname = "";
				sourceRange[0] = null;
				sourceRange[1] = null;
			}
		}

		/**
		 * TODO
		 * @returns {void}
		 */
		function report() {
			for (const node of linkNodes) {
				const text = sourceCode.getText(node);
				const { url } = node;

				if (isInSkipRange(node.position.start.offset, skipRanges)) {
					continue;
				}

				if (
					text === url ||
					url === `http://${text}` ||
					url === `mailto:${text}`
				) {
					context.report({
						node,
						messageId: "bareUrl",
						fix(fixer) {
							return fixer.replaceText(node, `<${text}>`);
						},
					});
				}
			}

			linkNodes.length = 0;
		}

		return {
			"heading html"(/** @type {Html} */ node) {
				findHtmlSkipRange(node);
			},

			"heading link"(/** @type {Link} */ node) {
				linkNodes.push(node);
			},

			"heading:exit"() {
				report();
			},

			"paragraph html"(/** @type {Html} */ node) {
				findHtmlSkipRange(node);
			},

			"paragraph link"(/** @type {Link} */ node) {
				linkNodes.push(node);
			},

			"paragraph:exit"() {
				report();
			},

			"tableCell html"(/** @type {Html} */ node) {
				findHtmlSkipRange(node);
			},

			"tableCell link"(/** @type {Link} */ node) {
				linkNodes.push(node);
			},

			"tableCell:exit"() {
				report();
			},
		};
	},
};
