/**
 * @fileoverview Rule to ensure link fragments (URLs that start with #) reference valid headings
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const githubLineReferencePattern = /^L\d+(?:C\d+)?(?:-L\d+(?:C\d+)?)?$/u;
const customHeadingIdPattern = /\{#([a-z0-9_-]+)\}\s*$/u;
const htmlIdNamePattern = /<(?:[^>]+)\s+(?:id|name)="([^"]+)"/gu;
const headingPrefixPattern = /^#{1,6}\s+/u;

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
				"Link fragment '#{{fragment}}' does not reference a heading or anchor in this document.",
		},

		defaultOptions: [
			{
				ignoreCase: false,
				allowPattern: "",
			},
		],
	},

	create(context) {
		const { allowPattern: allowPatternString, ignoreCase } =
			context.options[0];
		const allowPattern = allowPatternString
			? new RegExp(allowPatternString, "u")
			: null;

		const fragmentIds = new Set(["top"]);
		const slugger = new GithubSlugger();
		const linkNodes = [];

		return {
			heading(node) {
				const rawHeadingTextWithPrefix =
					context.sourceCode.getText(node);
				const rawHeadingText = rawHeadingTextWithPrefix
					.replace(headingPrefixPattern, "")
					.trim();

				let baseId;
				const customIdMatch = rawHeadingText.match(
					customHeadingIdPattern,
				);

				if (customIdMatch) {
					baseId = customIdMatch[1];
				} else {
					const tempSlugger = new GithubSlugger();
					baseId = tempSlugger.slug(rawHeadingText);
				}

				const finalId = slugger.slug(baseId);
				fragmentIds.add(ignoreCase ? finalId.toLowerCase() : finalId);
			},

			html(node) {
				const htmlText = node.value.trim();
				if (htmlText.startsWith("<!--") && htmlText.endsWith("-->")) {
					return;
				}

				for (const match of htmlText.matchAll(htmlIdNamePattern)) {
					const extractedId = match[1];
					const finalId = slugger.slug(extractedId);
					fragmentIds.add(
						ignoreCase ? finalId.toLowerCase() : finalId,
					);
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

				linkNodes.push({ node, fragment });
			},

			"root:exit"() {
				for (const { node, fragment } of linkNodes) {
					if (allowPattern?.test(fragment)) {
						continue;
					}

					if (isGitHubLineReference(fragment)) {
						continue;
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
				}
			},
		};
	},
};
