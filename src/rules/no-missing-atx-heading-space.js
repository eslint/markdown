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

const HEADING_PATTERN = /^(#{1,6})(?:[^#\s]|$)/u;
const NEW_LINE_PATTERN = /\r?\n/u;

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
				if (node.children && node.children.length > 0) {
					const firstTextChild = node.children.find(
						child => child.type === "text",
					);
					if (!firstTextChild) {
						return;
					}

					const text = context.sourceCode.getText(firstTextChild);
					const lines = text.split(NEW_LINE_PATTERN);

					lines.forEach((line, idx) => {
						const lineNum =
							firstTextChild.position.start.line + idx;

						const match = HEADING_PATTERN.exec(line);
						if (!match) {
							return;
						}

						const hashes = match[1];

						const startColumn =
							firstTextChild.position.start.column;

						context.report({
							loc: {
								start: { line: lineNum, column: startColumn },
								end: {
									line: lineNum,
									column: startColumn + hashes.length + 1,
								},
							},
							messageId: "missingSpace",
							fix(fixer) {
								const offset =
									firstTextChild.position.start.offset +
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
				}
			},
		};
	},
};
