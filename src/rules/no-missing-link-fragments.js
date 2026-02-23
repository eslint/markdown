/**
 * @fileoverview Rule to ensure link fragments (URLs that start with #) reference valid headings
 * @author Sweta Tanwar (@SwetaTanwar)
 */

/*
 * TODO:
 * - `<h1 name="abcd">heading 1</h1>`: `name` and `h1` tag combination.
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import GithubSlugger from "github-slugger";
import { stripHtmlComments } from "../util.js";

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
const htmlTagPattern =
	/<(?:\/\s*)?[a-z0-9]+(?:-[a-z0-9]+)*(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?(?:\/\s*)?>/giu;
const htmlHeadingPattern =
	/<h[1-6][^>]*>(?<children>[\s\S]*?)<\/\s*h[1-6]\s*>/giu;
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
		const [{ allowPattern, ignoreCase }] = context.options;
		const allowPatternOrNull = allowPattern
			? new RegExp(allowPattern, "u")
			: null;

		const fragmentIds = new Set(["top"]);
		const slugger = new GithubSlugger();

		/** @type {Array<Definition | Link>} */
		const relevantNodes = [];
		/** @type {string} */
		let headingText;

		return {
			heading() {
				headingText = "";
			},

			"heading *:not(html)"({ value }) {
				headingText += value ?? "";
			},

			"heading:exit"() {
				const customIdMatch = headingText.match(customHeadingIdPattern);
				const id = customIdMatch
					? customIdMatch.groups.id
					: headingText;

				fragmentIds.add(slugger.slug(id));
			},

			html(node) {
				// 1. Remove all comments
				const htmlTextWithoutComments = stripHtmlComments(node.value);

				// 2. Then look for IDs in the remaining text
				for (const match of htmlTextWithoutComments.matchAll(
					htmlIdNamePattern,
				)) {
					const { id } = match.groups;

					fragmentIds.add(slugger.slug(id));
				}

				// 3. Finally, look for headings in the HTML
				for (const match of htmlTextWithoutComments.matchAll(
					htmlHeadingPattern,
				)) {
					const { children } = match.groups;

					// Remove any HTML tags within the heading content to get plain text
					const id = children.replace(htmlTagPattern, "");

					fragmentIds.add(slugger.slug(id));
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
					let decodedFragment = fragment;

					// Decode URI component to handle encoded characters such as `%20`.
					try {
						decodedFragment = decodeURIComponent(fragment);
					} catch {
						// If decoding fails due to an invalid URI sequence, use the original fragment.
					}

					if (
						allowPatternOrNull?.test(decodedFragment) ||
						githubLineReferencePattern.test(decodedFragment)
					) {
						continue;
					}

					const normalizedFragment = ignoreCase
						? decodedFragment.toLowerCase()
						: decodedFragment;

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
