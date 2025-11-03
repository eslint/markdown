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

const leadingAtxHeadingHashPattern =
	/(?:^|(?<=[\r\n]))(?<hashes>#{1,6})(?:[^# \t]|$)/gu;
const trailingAtxHeadingHashPattern =
	/(?<![ \t])(?<spaces>[ \t]*)(?<=(?<!\\)(?:\\{2})*)(?<hashes>#+)[ \t]*$/u;

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
		const { sourceCode } = context;
		const [{ checkClosedHeadings }] = context.options;

		return {
			heading(node) {
				if (!checkClosedHeadings) {
					return;
				}

				const text = sourceCode.getText(node);
				const match = trailingAtxHeadingHashPattern.exec(text);

				if (match === null) {
					return;
				}

				const { spaces, hashes } = match.groups;

				if (spaces.length > 0) {
					return;
				}

				const startOffset = node.position.start.offset + match.index;
				const endOffset = startOffset + hashes.length;

				context.report({
					loc: {
						start: sourceCode.getLocFromIndex(startOffset - 1),
						end: sourceCode.getLocFromIndex(endOffset),
					},
					messageId: "missingSpace",
					data: { position: "before" },
					fix(fixer) {
						return fixer.insertTextBeforeRange(
							[startOffset, startOffset + 1],
							" ",
						);
					},
				});
			},

			paragraph(node) {
				const text = sourceCode.getText(node);

				/** @type {RegExpExecArray | null} */
				let match;

				while (
					(match = leadingAtxHeadingHashPattern.exec(text)) !== null
				) {
					const { hashes } = match.groups;
					const startOffset =
						node.position.start.offset + match.index;
					const endOffset = startOffset + hashes.length;

					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(startOffset),
							end: sourceCode.getLocFromIndex(endOffset + 1),
						},
						messageId: "missingSpace",
						data: { position: "after" },
						fix(fixer) {
							return fixer.insertTextAfterRange(
								[endOffset - 1, endOffset],
								" ",
							);
						},
					});
				}
			},
		};
	},
};
