/**
 * @fileoverview Rule to ensure there is a space after hash on ATX style headings in Markdown.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoMissingAtxHeadingSpaceRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const headingPattern = /^(#{1,6})(?:[^#\s]|$)/u;
const newLinePattern = /\r?\n/u;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMissingAtxHeadingSpaceRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description:
				"Disallow headings without a space after the hash characters",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-atx-heading-space.md",
		},

		fixable: "whitespace",

		messages: {
			missingSpace: "Missing space after hash(es) on ATX style heading.",
		},
	},

	create(context) {
		return {
			paragraph(node) {
				const text = context.sourceCode.getText(node);
				const lines = text.split(newLinePattern);

				lines.forEach((line, idx) => {
					const match = headingPattern.exec(line);
					if (!match) {
						return;
					}

					const hashes = match[1];
					const lineNum = node.position.start.line + idx;
					const startColumn = node.position.start.column;

					context.report({
						loc: {
							start: { line: lineNum, column: startColumn },
							end: {
								line: lineNum,
								column: startColumn + line.length,
							},
						},
						messageId: "missingSpace",
						fix(fixer) {
							const offset =
								node.position.start.offset +
								lines.slice(0, idx).join("\n").length +
								(idx > 0 ? 1 : 0);

							return fixer.insertTextAfterRange(
								[
									offset + hashes.length - 1,
									offset + hashes.length,
								],
								" ",
							);
						},
					});
				});
			},
		};
	},
};
