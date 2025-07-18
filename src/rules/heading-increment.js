/**
 * @fileoverview Rule to enforce heading levels increment by one.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { frontmatterHasTitle } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"skippedHeading"} HeadingIncrementMessageIds
 * @typedef {[{ frontmatterTitle?: string }]} HeadingIncrementOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: HeadingIncrementOptions, MessageIds: HeadingIncrementMessageIds }>}
 * HeadingIncrementRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {HeadingIncrementRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Enforce heading levels increment by one",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/heading-increment.md",
		},

		messages: {
			skippedHeading:
				"Heading level skipped from {{fromLevel}} to {{toLevel}}.",
		},

		schema: [
			{
				type: "object",
				properties: {
					frontmatterTitle: {
						type: "string",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				frontmatterTitle:
					"^(?!\\s*['\"]title[:=]['\"])\\s*\\{?\\s*['\"]?title['\"]?\\s*[:=]",
			},
		],
	},

	create(context) {
		const [{ frontmatterTitle }] = context.options;
		const titlePattern =
			frontmatterTitle === "" ? null : new RegExp(frontmatterTitle, "iu");
		let lastHeadingDepth = 0;

		return {
			yaml(node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					lastHeadingDepth = 1;
				}
			},

			toml(node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					lastHeadingDepth = 1;
				}
			},

			json(node) {
				if (frontmatterHasTitle(node.value, titlePattern)) {
					lastHeadingDepth = 1;
				}
			},

			heading(node) {
				if (lastHeadingDepth > 0 && node.depth > lastHeadingDepth + 1) {
					context.report({
						loc: node.position,
						messageId: "skippedHeading",
						data: {
							fromLevel: lastHeadingDepth.toString(),
							toLevel: node.depth.toString(),
						},
					});
				}

				lastHeadingDepth = node.depth;
			},
		};
	},
};
