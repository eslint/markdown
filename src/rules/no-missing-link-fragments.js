/**
 * @fileoverview Rule to ensure link fragments (URLs that start with #) reference valid headings
 * @author Sweta Tanwar (@SwetaTanwar)
 */

import GithubSlugger from "github-slugger";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{
 *   RuleOptions: [{
 *     ignoreCase?: boolean;
 *     ignoredPattern?: string;
 *   }];
 * }>} NoMissingLinkFragmentsRuleDefinition
 */

/**
 * @typedef {import("mdast").Node & {
 *   children?: Array<import("mdast").Node>;
 *   value?: string;
 * }} NodeWithChildren
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Checks if the fragment is a valid GitHub line reference
 * @param {string} fragment The fragment to check
 * @returns {boolean} Whether the fragment is a valid GitHub line reference
 */
function isGitHubLineReference(fragment) {
	// Match patterns like L20 or L19C5-L21C11
	return /^L\d+(?:C\d+)?(?:-L\d+(?:C\d+)?)?$/u.test(fragment);
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMissingLinkFragmentsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow link fragments that do not reference valid headings",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md",
		},

		schema: [
			{
				type: "object",
				properties: {
					ignoreCase: {
						type: "boolean",
						default: false,
					},
					ignoredPattern: {
						type: "string",
						default: "",
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			invalidFragment:
				"Link fragment '{{fragment}}' does not reference a valid heading or anchor.",
		},
	},

	create(context) {
		const options = context.options[0] || {};
		const ignoreCase = options.ignoreCase || false;
		const ignoredPattern = options.ignoredPattern
			? new RegExp(options.ignoredPattern, "u")
			: null;

		const slugger = new GithubSlugger();
		const fragmentIds = new Set();

		fragmentIds.add(ignoreCase ? "top".toLowerCase() : "top");

		/**
		 * Generates a heading ID using the shared slugger instance.
		 * Handles custom IDs and plain text slugging.
		 * @param {string} headingText The heading text.
		 * @returns {string} The normalized heading ID.
		 */
		function getHeadingId(headingText) {
			const customIdMatch = headingText.match(/\{#([a-z0-9_-]+)\}\s*$/u);
			if (customIdMatch) {
				return customIdMatch[1];
			}
			const plainText = headingText.replace(/[*_~`]/gu, "").trim();
			return slugger.slug(plainText);
		}

		return {
			heading(node) {
				const headingText = context.sourceCode
					.getText(node)
					.replace(/^#+\s*/u, "")
					.trim();
				const id = getHeadingId(headingText);
				fragmentIds.add(ignoreCase ? id.toLowerCase() : id);
			},
			html(node) {
				if (node.value) {
					const htmlText = node.value.trim(); // Trim to handle potential whitespace around comment block
					if (
						htmlText.startsWith("<!--") &&
						htmlText.endsWith("-->")
					) {
						return;
					}

					const idMatches = htmlText.matchAll(
						/<(?:[^>]+)\s+(?:id|name)="([^"]+)"/gu,
					);
					for (const match of idMatches) {
						const extractedId = match[1];
						fragmentIds.add(
							ignoreCase
								? extractedId.toLowerCase()
								: extractedId,
						);
					}
				}
			},
			link(node) {
				const url = node.url;
				if (!url || !url.startsWith("#")) {
					return;
				}

				const fragment = url.slice(1);
				if (!fragment) {
					return; // Empty fragments are handled by no-empty-links rule or similar
				}

				// Skip if fragment matches ignored pattern
				if (ignoredPattern && ignoredPattern.test(fragment)) {
					return;
				}

				// Handle GitHub line references
				if (isGitHubLineReference(fragment)) {
					return;
				}

				const normalizedFragment = ignoreCase
					? fragment.toLowerCase()
					: fragment;

				if (!fragmentIds.has(normalizedFragment)) {
					context.report({
						loc: node.position,
						messageId: "invalidFragment",
						data: { fragment },
					});
				}
			},
		};
	},
};
