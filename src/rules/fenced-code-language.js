/**
 * @fileoverview Rule to enforce languages for fenced code.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ required?: string[]; }]; }>}
 * FencedCodeLanguageRuleDefinition
 */

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
	},

	create(context) {
		const required = new Set(context.options[0]?.required);
		const { sourceCode } = context;

		return {
			code(node) {
				if (!node.lang) {
					// only check fenced code blocks
					if (sourceCode.text[node.position.start.offset] !== "`") {
						return;
					}

					context.report({
						loc: node.position,
						messageId: "missingLanguage",
					});

					return;
				}

				if (required.size && !required.has(node.lang)) {
					context.report({
						loc: node.position,
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
