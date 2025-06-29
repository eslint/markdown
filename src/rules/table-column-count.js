/**
 * @fileoverview Rule to disallow data rows in a GitHub Flavored Markdown table from having more cells than the header row
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"inconsistentColumnCount" | "missingCells"} TableColumnCountMessageIds
 * @typedef {[{ checkMissingCells?: boolean }]} TableColumnCountOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: TableColumnCountOptions, MessageIds: TableColumnCountMessageIds }>} TableColumnCountRuleDefinition
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
				"Table column count mismatch (Expected: {{expectedCells}}, Actual: {{actualCells}}), extra data starting here will be ignored.",
			missingCells:
				"Table column count mismatch (Expected: {{expectedCells}}, Actual: {{actualCells}}), row might be missing data.",
		},

		schema: [
			{
				type: "object",
				properties: {
					checkMissingCells: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [{ checkMissingCells: false }],
	},

	create(context) {
		const [{ checkMissingCells }] = context.options;

		return {
			table(node) {
				if (node.children.length < 1) {
					return;
				}

				const headerRow = node.children[0];
				const expectedCellsLength = headerRow.children.length;

				for (let i = 1; i < node.children.length; i++) {
					const currentRow = node.children[i];
					const actualCellsLength = currentRow.children.length;

					if (actualCellsLength > expectedCellsLength) {
						const firstExtraCellNode =
							currentRow.children[expectedCellsLength];

						const lastActualCellNode =
							currentRow.children[actualCellsLength - 1];

						context.report({
							loc: {
								start: firstExtraCellNode.position.start,
								end: lastActualCellNode.position.end,
							},
							messageId: "inconsistentColumnCount",
							data: {
								actualCells: String(actualCellsLength),
								expectedCells: String(expectedCellsLength),
							},
						});
					} else if (
						checkMissingCells &&
						actualCellsLength < expectedCellsLength
					) {
						const lastCellNode =
							currentRow.children[actualCellsLength - 1];
						const rowEnd = currentRow.position.end;

						context.report({
							loc: {
								start: {
									column:
										lastCellNode.position.end.column - 1,
									line: lastCellNode.position.end.line,
								},
								end: rowEnd,
							},
							messageId: "missingCells",
							data: {
								actualCells: String(actualCellsLength),
								expectedCells: String(expectedCellsLength),
							},
						});
					}
				}
			},
		};
	},
};
