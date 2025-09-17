/**
 * @fileoverview Rule to require or disallow metadata for fenced code blocks.
 * @author TKDev7
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"missingMetadata" | "disallowedMetadata"} FencedCodeMetaMessageIds
 * @typedef {["always" | "never"]} FencedCodeMetaOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: FencedCodeMetaOptions, MessageIds: FencedCodeMetaMessageIds }>} FencedCodeMetaRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {FencedCodeMetaRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: false,
			description: "Require or disallow metadata for fenced code blocks",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/fenced-code-meta.md",
		},

		messages: {
			missingMetadata: "Missing code block metadata.",
			disallowedMetadata: "Code block metadata is not allowed.",
		},

		schema: [
			{
				enum: ["always", "never"],
			},
		],

		defaultOptions: ["always"],
	},

	create(context) {
		const [mode] = context.options;
		const { sourceCode } = context;

		return {
			code(node) {
				const lineText = sourceCode.lines[node.position.start.line - 1];

				if (mode === "always") {
					if (node.lang && !node.meta) {
						const langStart = lineText.indexOf(node.lang);

						context.report({
							loc: {
								start: node.position.start,
								end: {
									line: node.position.start.line,
									column:
										node.position.start.column +
										langStart +
										node.lang.trim().length,
								},
							},
							messageId: "missingMetadata",
						});
					}

					return;
				}

				if (node.meta) {
					const metaStart = lineText.lastIndexOf(node.meta);

					context.report({
						loc: {
							start: {
								line: node.position.start.line,
								column: node.position.start.column + metaStart,
							},
							end: {
								line: node.position.start.line,
								column:
									node.position.start.column +
									metaStart +
									node.meta.trim().length,
							},
						},
						messageId: "disallowedMetadata",
					});
				}
			},
		};
	},
};
