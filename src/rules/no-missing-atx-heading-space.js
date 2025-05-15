/**
 * @fileoverview Rule to ensure there is a space after hash on ATX style headings in Markdown.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoMissingAtxHeaderSpaceRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoMissingAtxHeaderSpaceRuleDefinition} */
export default {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow headings without a space after the hash characters",
			recommended: true,
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-atx-heading-space.md",
		},
		fixable: "whitespace",
		schema: [],
		messages: {
			missingSpace: "Missing space after hash(es) on ATX style heading.",
		},
	},

	create(context) {
		const headingPattern = /^(#{1,6})([^#\s])/u;

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
					const lines = text.split(/\r?\n/u);

					lines.forEach((line, idx) => {
						const lineNum =
							firstTextChild.position.start.line + idx;

						const match = headingPattern.exec(line);
						if (!match) {
							return;
						}

						const hashes = match[1];

						context.report({
							loc: {
								start: { line: lineNum, column: hashes.length },
								end: { line: lineNum, column: line.length },
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
