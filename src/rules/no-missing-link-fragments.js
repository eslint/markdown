/**
 * @fileoverview Rule to prevent links with fragment identifiers that don't exist.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

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
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMissingLinkFragmentsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow link fragments that don't exist in the document",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md",
		},

		defaultOptions: [
			{
				ignoreCase: false,
				allowPattern: "",
			},
		],

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
			missingFragment:
				"Link fragment '#{{fragment}}' does not exist in the document.",
		},
	},

	create(context) {
		const options = context.options[0] || {};
		const ignoreCase = options.ignoreCase;
		const allowPattern = options.allowPattern;

		const allowedRegex = allowPattern
			? new RegExp(allowPattern, "u")
			: null;

		const headingIds = new Set();
		const lowercaseHeadingIds = new Set();

		/**
		 * Normalizes heading text to ID format
		 * @param {string} text The heading text to normalize
		 * @returns {string} The normalized heading ID
		 */
		function normalizeHeadingId(text) {
			return text
				.toLowerCase()
				.replace(/[^\w\s-]/gu, "") // Remove non-word chars except spaces and hyphens
				.replace(/\s+/gu, "-") // Replace spaces with hyphens
				.replace(/-+/gu, "-") // Replace multiple hyphens with a single hyphen
				.trim();
		}

		return {
			heading(node) {
				if (node.children && node.children.length > 0) {
					const headingText = node.children
						.filter(child => child.type === "text")
						.map(child => child.value)
						.join("");

					const headingId = normalizeHeadingId(headingText);
					headingIds.add(headingId);
					lowercaseHeadingIds.add(headingId.toLowerCase());
				}
			},

			link(node) {
				if (
					node.url &&
					node.url.startsWith("#") &&
					node.url.length > 1
				) {
					const fragment = node.url.slice(1);

					if (allowedRegex && allowedRegex.test(fragment)) {
						return;
					}

					let fragmentExists;
					if (ignoreCase) {
						const normalizedFragment = fragment.toLowerCase();
						fragmentExists =
							lowercaseHeadingIds.has(normalizedFragment);
					} else {
						fragmentExists = headingIds.has(fragment);
					}

					if (!fragmentExists) {
						context.report({
							loc: node.position,
							messageId: "missingFragment",
							data: {
								fragment,
							},
						});
					}
				}
			},
		};
	},
};
