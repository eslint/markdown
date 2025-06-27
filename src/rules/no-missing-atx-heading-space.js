/**
 * @fileoverview Rule to ensure there is a space after hash on ATX style headings in Markdown.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ checkClosedHeadings?: boolean }]; }>}
 * NoMissingAtxHeadingSpaceRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const headingPattern = /^(#{1,6})(?:[^# \t]|$)/u;
const newLinePattern = /\r?\n/u;
const closedHeadingPattern = /^(.+?)\s*(#{1,6})\s*$/u;

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

		schema: [
			{
				type: "object",
				properties: {
					checkClosedHeadings: {
						type: "boolean",
						default: false,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			missingSpace: "Missing space after hash(es) on ATX style heading.",
			missingSpaceBeforeClosing:
				"Missing space before closing hash(es) on ATX style heading.",
		},
	},

	create(context) {
		const options = context.options[0] || {};
		const checkClosedHeadings = options.checkClosedHeadings || false;

		return {
			heading(node) {
				// Check for closed headings without space before closing hashes
				if (
					checkClosedHeadings &&
					node.children &&
					node.children.length > 0
				) {
					const textChild = node.children.find(
						child => child.type === "text",
					);
					if (!textChild) {
						return;
					}

					const text = context.sourceCode.getText(textChild);
					const lines = text.split(newLinePattern);

					lines.forEach((line, idx) => {
						const lineNum = textChild.position.start.line + idx;
						const closedMatch = closedHeadingPattern.exec(line);
						if (closedMatch) {
							const content = closedMatch[1];
							const closingHashes = closedMatch[2];

							// Check if there's no space before closing hashes
							if (!content.endsWith(" ")) {
								const startColumn =
									textChild.position.start.column;
								const contentStart = startColumn;
								const contentEnd =
									contentStart + content.length;

								context.report({
									loc: {
										start: {
											line: lineNum,
											column: contentEnd - 1,
										},
										end: {
											line: lineNum,
											column:
												contentEnd +
												closingHashes.length,
										},
									},
									messageId: "missingSpaceBeforeClosing",
									fix(fixer) {
										const offset =
											textChild.position.start.offset +
											lines.slice(0, idx).join("\n")
												.length +
											(idx > 0 ? 1 : 0) +
											content.length;

										return fixer.insertTextBeforeRange(
											[offset, offset],
											" ",
										);
									},
								});
							}
						}
					});
				}
			},

			paragraph(node) {
				if (node.children && node.children.length > 0) {
					const firstTextChild = node.children.find(
						child => child.type === "text",
					);
					if (!firstTextChild) {
						return;
					}

					const text = context.sourceCode.getText(firstTextChild);
					const lines = text.split(newLinePattern);

					lines.forEach((line, idx) => {
						const lineNum =
							firstTextChild.position.start.line + idx;

						const match = headingPattern.exec(line);
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
