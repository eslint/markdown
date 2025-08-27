/**
 * @fileoverview Rule to ensure there is a space after hash on ATX style headings in Markdown.
 * @author Sweta Tanwar (@SwetaTanwar)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"missingSpace"} NoMissingAtxHeadingSpaceMessageIds
 * @typedef {[{ checkClosedHeadings?: boolean }]} NoMissingAtxHeadingSpaceOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoMissingAtxHeadingSpaceOptions, MessageIds: NoMissingAtxHeadingSpaceMessageIds }>} NoMissingAtxHeadingSpaceRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const leadingAtxHeadingHashPattern = /^(#{1,6})(?:[^# \t]|$)/u;
const trailingAtxHeadingHashPattern =
	/(?<![ \t])([ \t]*)(?<!(?<!\\)\\)(#+)([ \t]*)$/u;
const newLinePattern = /\r?\n/u;

/**
 * Finds missing space before the closing hashes in an ATX heading.
 * @param {string} text The input text to check.
 * @returns {{ closingHashIdx: number, beforeHashIdx: number, endIdx: number } | null} The positions of the closing hashes in the heading, or null if no missing space is found.
 */
function findMissingSpaceBeforeClosingHash(text) {
	const match = trailingAtxHeadingHashPattern.exec(text);

	if (match) {
		const [, closingSequenceSpaces, closingSequence, trailingSpaces] =
			match;

		if (closingSequenceSpaces.length === 0) {
			const closingHashIdx =
				text.length - (trailingSpaces.length + closingSequence.length);
			const beforeHashIdx = closingHashIdx - 1;
			const endIdx = closingHashIdx + closingSequence.length;
			return {
				closingHashIdx,
				beforeHashIdx,
				endIdx,
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

				const missingSpace = findMissingSpaceBeforeClosingHash(text);
				if (missingSpace) {
					context.report({
						loc: {
							start: {
								line: lineNum,
								column:
									startColumn + missingSpace.beforeHashIdx,
							},
							end: {
								line: lineNum,
								column: startColumn + missingSpace.endIdx,
							},
						},
						messageId: "missingSpace",
						data: { position: "before" },
						fix(fixer) {
							return fixer.insertTextBeforeRange(
								[
									node.position.start.offset +
										missingSpace.closingHashIdx,
									node.position.start.offset +
										missingSpace.closingHashIdx +
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
				const startColumn = node.position.start.column;
				let offset = node.position.start.offset;

				lines.forEach((line, idx) => {
					const match = leadingAtxHeadingHashPattern.exec(line);
					const lineNum = node.position.start.line + idx;

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
					}

					offset += line.length + 1;
				});
			},
		};
	},
};
