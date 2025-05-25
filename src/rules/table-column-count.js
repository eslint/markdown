/**
 * @fileoverview Rule to disallow data rows in a GitHub Flavored Markdown table from having more cells than the header row
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>} TableColumnCountRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {TableColumnCountRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow data rows in a GitHub Flavored Markdown table from having more cells than the header row",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/table-column-count.md",
		},

		messages: {
			inconsistentColumnCount:
				"Table column count mismatch (Expected: {{expectedCells}}, Actual: {{actualCells}}), extra data will be ignored.",
		},
	},

	create(context) {
		return {
			table(node) {
				if (!node.children || node.children.length < 1) {
					return;
				}

				const headerRow = node.children[0];
				const expectedCells = headerRow.children.length;

				for (let i = 1; i < node.children.length; i++) {
					const currentRow = node.children[i];
					const actualCells = currentRow.children.length;

					if (actualCells > expectedCells) {
						context.report({
							node: currentRow,
							messageId: "inconsistentColumnCount",
							data: {
								actualCells: String(actualCells),
								expectedCells: String(expectedCells),
							},
						});
					}
				}
			},
		};
	},
};
