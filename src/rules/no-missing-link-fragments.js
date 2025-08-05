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
 * @import { Link } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"invalidFragment"} NoMissingLinkFragmentsMessageIds
 * @typedef {[{ ignoreCase?: boolean; allowPattern?: string }]} NoMissingLinkFragmentsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMissingLinkFragmentsOptions, MessageIds: NoMissingLinkFragmentsMessageIds }>} NoMissingLinkFragmentsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const githubLineReferencePattern = /^L\d+(?:C\d+)?(?:-L\d+(?:C\d+)?)?$/u;
const customHeadingIdPattern = /\{#([^}\s]+)\}\s*$/u;
const htmlIdNamePattern =
	/(?<!<)<(?:[^>]+)\s(?:id|name)\s*=\s*["']?([^"'\s>]+)["']?/giu;

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

		/** @type {Array<{node: Link, fragment: string}>} */
		const linkNodes = [];

		/** @type {string} */
		let headingText;

		/**
		 * Normalizes a text string based on the `ignoreCase` option.
		 * @param {string} text The text to normalize.
		 * @returns {string} The normalized text.
		 */
		function normalize(text) {
			return ignoreCase ? text.toLowerCase() : text;
		}

		return {
			heading() {
				headingText = "";
			},

			"heading *:not(html)"({ value }) {
				headingText += value ?? "";
			},

			"heading:exit"() {
				let baseId;
				const customIdMatch = headingText.match(customHeadingIdPattern);

				if (customIdMatch) {
					baseId = customIdMatch[1];
				} else {
					const tempSlugger = new GithubSlugger();
					baseId = tempSlugger.slug(headingText);
				}

				const finalId = slugger.slug(baseId);
				fragmentIds.add(normalize(finalId));
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
					fragmentIds.add(normalize(finalId));
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

					const normalizedFragment = normalize(decodedFragment);

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
