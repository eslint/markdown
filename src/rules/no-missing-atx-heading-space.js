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
				if (!checkClosedHeadings) {
					return;
				}

				const lastChild = node.children.at(-1);

				if (lastChild.type !== "text") {
					return;
				}

				// Case 1: Single child, the heading is closed with hashes
				// Example: ### Heading 3###, # Heading 1#
				if (lastChild.value.endsWith("#")) {
					if (node.children.length === 1) {
						const indexOfHash = lastChild.value.indexOf("#");
						const content = lastChild.value.slice(0, indexOfHash);
						const closingHashes =
							lastChild.value.slice(indexOfHash);

						context.report({
							loc: {
								start: {
									line: lastChild.position.start.line,
									column:
										lastChild.position.start.column +
										indexOfHash -
										1,
								},
								end: {
									line: lastChild.position.end.line,
									column: lastChild.position.end.column,
								},
							},
							messageId: "missingSpaceBeforeClosing",
							fix(fixer) {
								return fixer.replaceText(
									lastChild,
									`${content} ${closingHashes}`,
								);
							},
						});
					}

					// Case 2: Multiple children, in that case we need to check if the last child is a text node and if it ends with a hash
					// Example: # Heading **bold**#, # Heading [link](url)#, # Heading <span></span>#
					if (node.children.length > 1) {
						context.report({
							loc: {
								start: {
									line: lastChild.position.start.line,
									column: lastChild.position.start.column - 1,
								},
								end: {
									line: lastChild.position.end.line,
									column: lastChild.position.end.column,
								},
							},
							messageId: "missingSpaceBeforeClosing",
							fix(fixer) {
								return fixer.insertTextBefore(lastChild, " ");
							},
						});
					}
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
