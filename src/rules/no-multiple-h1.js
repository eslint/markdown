/**
 * @fileoverview Rule to enforce at most one h1 heading in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ frontmatterTitle?: string; }]; }>}
 * NoMultipleH1RuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMultipleH1RuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow multiple h1 headings in the same document",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-multiple-h1.md",
		},

		messages: {
			multipleH1: "More than one h1 heading found.",
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

		defaultOptions: [{ frontmatterTitle: "\\s*title\\s*[:=]" }],
	},

	create(context) {
		const [{ frontmatterTitle }] = context.options;
		const titlePattern =
			frontmatterTitle === "" ? null : new RegExp(frontmatterTitle, "iu");
		let h1Count = 0;

		return {
			yaml(node) {
				if (titlePattern?.test(node.value)) {
					h1Count++;
				}
			},

			toml(node) {
				if (titlePattern?.test(node.value)) {
					h1Count++;
				}
			},

			html(node) {
				if (/<h1[^>]*>.*?<\/h1>/iu.test(node.value)) {
					h1Count++;
					if (h1Count > 1) {
						context.report({
							loc: node.position,
							messageId: "multipleH1",
						});
					}
				}
			},

			heading(node) {
				if (node.depth === 1) {
					h1Count++;
					if (h1Count > 1) {
						context.report({
							loc: node.position,
							messageId: "multipleH1",
						});
					}
				}
			},
		};
	},
};
