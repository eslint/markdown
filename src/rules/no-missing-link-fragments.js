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
 *     allowPattern?: string;
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

const githubLineReferencePattern = /^L\d+(?:C\d+)?(?:-L\d+(?:C\d+)?)?$/u;
const customHeadingIdPattern = /\{#([a-z0-9_-]+)\}\s*$/u;
const markdownInlineFormattingPattern = /[*_~`]/gu;
const htmlIdNamePattern = /<(?:[^>]+)\s+(?:id|name)="([^"]+)"/gu;
const headingPrefixPattern = /^#+\s*/u;

/**
 * Checks if the fragment is a valid GitHub line reference
 * @param {string} fragment The fragment to check
 * @returns {boolean} Whether the fragment is a valid GitHub line reference
 */
function isGitHubLineReference(fragment) {
	return githubLineReferencePattern.test(fragment);
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
					allowPattern: {
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
		const allowPattern = options.allowPattern
			? new RegExp(options.allowPattern, "u")
			: null;

		const slugger = new GithubSlugger();
		const fragmentIds = new Set();

		fragmentIds.add("top");

		/**
		 * Generates a heading ID using the shared slugger instance.
		 * Handles custom IDs and plain text slugging.
		 * @param {string} headingText The heading text.
		 * @returns {string} The normalized heading ID.
		 */
		function getHeadingId(headingText) {
			const customIdMatch = headingText.match(customHeadingIdPattern);
			if (customIdMatch) {
				return customIdMatch[1];
			}
			const plainText = headingText
				.replace(markdownInlineFormattingPattern, "")
				.trim();
			return slugger.slug(plainText);
		}

		return {
			heading(node) {
				const headingText = context.sourceCode
					.getText(node)
					.replace(headingPrefixPattern, "")
					.trim();
				const id = getHeadingId(headingText);
				fragmentIds.add(ignoreCase ? id.toLowerCase() : id);
			},

			html(node) {
				if (node.value) {
					const htmlText = node.value.trim();
					if (
						htmlText.startsWith("<!--") &&
						htmlText.endsWith("-->")
					) {
						return;
					}

					const idMatches = htmlText.matchAll(htmlIdNamePattern);
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
					return;
				}

				if (allowPattern && allowPattern.test(fragment)) {
					return;
				}

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
