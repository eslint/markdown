/**
 * @fileoverview Rule to ensure there is a space after hash on ATX style headings in Markdown.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ checkClosedHeadings?: boolean; }]; }>}
 * NoMissingAtxHeadingSpaceRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const atxHeadingPattern = /^(#{1,6})(?:[^# \t]|$)/u;
const atxHeadingClosedPattern = /([ \t]*)(?<!\\)(#+)([ \t]*)$/u;
const newLinePattern = /\r?\n/u;

/**
 * Returns info for missing space before closing hashes in ATX headings, or null if not found.
 * @param {string} text The input text to check.
 * @returns {{ closingHashIdx: number, beforeHashIdx: number, endIdx: number, closingSequenceLength: number } | null} Info for reporting or null
 */
function getMissingSpaceBeforeClosingInfo(text) {
	const match = atxHeadingClosedPattern.exec(text);

	if (match) {
		const [, closingSequenceSpaces, closingSequence, trailingSpaces] =
			match;

		if (!closingSequenceSpaces.length) {
			const closingHashIdx =
				text.length - (trailingSpaces.length + closingSequence.length);
			const beforeHashIdx = closingHashIdx - 1;
			const endIdx = closingHashIdx + closingSequence.length;
			return {
				closingHashIdx,
				beforeHashIdx,
				endIdx,
				closingSequenceLength: closingSequence.length,
			};
		}
	}

	return null;
}

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
			missingSpace:
				"Missing space {{position}} hash(es) on ATX style heading.",
		},

		schema: [
			{
				type: "object",
				properties: {
					checkClosedHeadings: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [{ checkClosedHeadings: false }],
	},

	create(context) {
		const [{ checkClosedHeadings }] = context.options;

		return {
			heading(node) {
				if (!checkClosedHeadings) {
					return;
				}

				const text = context.sourceCode.getText(node);
				const lineNum = node.position.start.line;
				const startColumn = node.position.start.column;

				const info = getMissingSpaceBeforeClosingInfo(text);
				if (info) {
					context.report({
						loc: {
							start: {
								line: lineNum,
								column: startColumn + info.beforeHashIdx,
							},
							end: {
								line: lineNum,
								column: startColumn + info.endIdx,
							},
						},
						messageId: "missingSpace",
						data: { position: "before" },
						fix(fixer) {
							return fixer.insertTextBeforeRange(
								[
									node.position.start.offset +
										info.closingHashIdx,
									node.position.start.offset +
										info.closingHashIdx +
										1,
								],
								" ",
							);
						},
					});
				}
			},

			paragraph(node) {
				const text = context.sourceCode.getText(node);
				const lines = text.split(newLinePattern);
				let offset = node.position.start.offset;

				lines.forEach((line, idx) => {
					const match = atxHeadingPattern.exec(line);
					const lineNum = node.position.start.line + idx;
					const startColumn = node.position.start.column;

					if (match) {
						const hashes = match[1];

						context.report({
							loc: {
								start: { line: lineNum, column: startColumn },
								end: {
									line: lineNum,
									column: startColumn + hashes.length + 1,
								},
							},
							messageId: "missingSpace",
							data: { position: "after" },
							fix(fixer) {
								return fixer.insertTextAfterRange(
									[
										offset + hashes.length - 1,
										offset + hashes.length,
									],
									" ",
								);
							},
						});

						if (checkClosedHeadings) {
							const info = getMissingSpaceBeforeClosingInfo(line);
							if (info) {
								context.report({
									loc: {
										start: {
											line: lineNum,
											column:
												startColumn +
												info.beforeHashIdx,
										},
										end: {
											line: lineNum,
											column: startColumn + info.endIdx,
										},
									},
									messageId: "missingSpace",
									data: { position: "before" },
									fix(fixer) {
										return fixer.insertTextBeforeRange(
											[
												offset + info.closingHashIdx,
												offset +
													info.closingHashIdx +
													1,
											],
											" ",
										);
									},
								});
							}
						}
					}

					offset += line.length + 1;
				});
			},
		};
	},
};
