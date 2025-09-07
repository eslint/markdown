/**
 * @fileoverview Rule to enforce languages for fenced code.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"missingLanguage" | "disallowedLanguage"} FencedCodeLanguageMessageIds
 * @typedef {[{ required?: string[] }]} FencedCodeLanguageOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: FencedCodeLanguageOptions, MessageIds: FencedCodeLanguageMessageIds }>} FencedCodeLanguageRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const fencedCodeCharacters = new Set(["`", "~"]);

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {FencedCodeLanguageRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Require languages for fenced code blocks",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/fenced-code-language.md",
		},

		messages: {
			missingLanguage: "Missing code block language.",
			disallowedLanguage:
				'Code block language "{{lang}}" is not allowed.',
		},

		schema: [
			{
				type: "object",
				properties: {
					required: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				required: [],
			},
		],
	},

	create(context) {
		const required = new Set(context.options[0].required);
		const { sourceCode } = context;

		return {
			code(node) {
				if (!node.lang) {
					// only check fenced code blocks
					if (
						!fencedCodeCharacters.has(
							sourceCode.text[node.position.start.offset],
						)
					) {
						return;
					}

					/** @type {number} */
					let offset;

					for (
						offset = node.position.start.offset;
						fencedCodeCharacters.has(sourceCode.text[offset]);
						offset++
					) {
						// Find the end offset of the opening fence.
					}

					context.report({
						loc: {
							start: node.position.start,
							end: {
								line: node.position.start.line,
								column:
									node.position.start.column +
									(offset - node.position.start.offset),
							},
						},
						messageId: "missingLanguage",
					});

					return;
				}

				if (required.size && !required.has(node.lang)) {
					const lineText =
						sourceCode.lines[node.position.start.line - 1];
					const langIndex = lineText.indexOf(node.lang);

					context.report({
						loc: {
							start: node.position.start,
							end: {
								line: node.position.start.line,
								column:
									node.position.start.column +
									langIndex +
									node.lang.length,
							},
						},
						messageId: "disallowedLanguage",
						data: {
							lang: node.lang,
						},
					});
				}
			},
		};
	},
};
