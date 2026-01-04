/**
 * @fileoverview Rule to ensure link fragments (URLs that start with #) reference valid headings
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import GithubSlugger from "github-slugger";
import { htmlCommentPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Definition, Link } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"invalidFragment"} NoMissingLinkFragmentsMessageIds
 * @typedef {[{ ignoreCase?: boolean; allowPattern?: string }]} NoMissingLinkFragmentsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMissingLinkFragmentsOptions, MessageIds: NoMissingLinkFragmentsMessageIds }>} NoMissingLinkFragmentsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const githubLineReferencePattern = /^L\d+(?:C\d+)?(?:-L\d+(?:C\d+)?)?$/u;
const customHeadingIdPattern = /\{#(?<id>[^}\s]+)\}\s*$/u;
const htmlIdNamePattern =
	/(?<!<)<[^>]+\s(?:id|name)\s*=\s*["']?(?<id>[^"'\s>]+)["']?/giu;

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
					},
					allowPattern: {
						type: "string",
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
				ignoreCase: true,
				allowPattern: "",
			},
		],
	},

	create(context) {
		const [{ allowPattern: allowPatternString, ignoreCase }] =
			context.options;
		const allowPattern = allowPatternString
			? new RegExp(allowPatternString, "u")
			: null;

		const fragmentIds = new Set(["top"]);
		const slugger = new GithubSlugger();

		/** @type {Array<Definition | Link>} */
		const relevantNodes = [];
		/** @type {string} */
		let headingText;

		/**
		 * Normalize a fragment based on the `ignoreCase` option.
		 * @param {string} fragment The fragment to normalize.
		 * @returns {string} The normalized fragment.
		 */
		function normalizeFragment(fragment) {
			return ignoreCase ? fragment.toLowerCase() : fragment;
		}

		return {
			heading() {
				headingText = "";
			},

			"heading *:not(html)"({ value }) {
				headingText += value ?? "";
			},

			"heading:exit"() {
				const customIdMatch = headingText.match(customHeadingIdPattern);
				const baseId = customIdMatch
					? customIdMatch.groups.id
					: headingText;
				const finalId = slugger.slug(baseId);
				fragmentIds.add(normalizeFragment(finalId));
			},

			html(node) {
				// 1. Remove all comments
				const htmlTextWithoutComments = node.value
					.trim()
					.replace(htmlCommentPattern, "");

				// 2. Then look for IDs in the remaining text
				for (const match of htmlTextWithoutComments.matchAll(
					htmlIdNamePattern,
				)) {
					const extractedId = match.groups.id;
					const finalId = slugger.slug(extractedId);
					fragmentIds.add(normalizeFragment(finalId));
				}
			},

			"definition, link"(/** @type {Definition | Link} */ node) {
				const { url } = node;

				// If `url` is empty, `"#"`, or does not start with `"#"`, skip it.
				if (url === "" || url === "#" || !url.startsWith("#")) {
					return;
				}

				relevantNodes.push(node);
			},

			"root:exit"() {
				for (const node of relevantNodes) {
					const fragment = node.url.slice(1);
					/** @type {string} */
					let decodedFragment;

					try {
						decodedFragment = decodeURIComponent(fragment);
					} catch {
						// fallback if not valid encoding
						decodedFragment = fragment;
					}

					if (
						allowPattern?.test(decodedFragment) ||
						githubLineReferencePattern.test(decodedFragment)
					) {
						continue;
					}

					const normalizedFragment =
						normalizeFragment(decodedFragment);

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
