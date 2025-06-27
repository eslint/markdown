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

/** @typedef {import("mdast").Node} Node */
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
const customHeadingIdPattern = /\{#([^}\s]+)\}\s*$/u;
const htmlCommentPattern = /<!--[\s\S]*?-->/gu;
const htmlIdNamePattern = /<(?:[^>]+)\s+(?:id|name)=["']([^"']+)["']/gu;

/**
 * Checks if the fragment is a valid GitHub line reference
 * @param {string} fragment The fragment to check
 * @returns {boolean} Whether the fragment is a valid GitHub line reference
 */
function isGitHubLineReference(fragment) {
	return githubLineReferencePattern.test(fragment);
}

/**
 * Extracts the text recursively from a node
 * @param {Node} node The node from which to recursively extract text
 * @returns {string} The extracted text
 */
function extractText(node) {
	if (node.type === "html") {
		return "";
	}
	if ("value" in node) {
		return /** @type {string} */ (node.value);
	}
	if ("children" in node) {
		return /** @type {Node[]} */ (node.children).map(extractText).join("");
	}
	return "";
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
				const rawHeadingText = extractText(node);
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

				// First remove all comments
				const textWithoutComments = htmlText.replace(
					htmlCommentPattern,
					"",
				);

				// Then look for IDs in the remaining text
				for (const match of textWithoutComments.matchAll(
					htmlIdNamePattern,
				)) {
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
