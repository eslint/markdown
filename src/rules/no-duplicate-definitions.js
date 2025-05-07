/**
 * @fileoverview Rule to prevent duplicate definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ ignores: string[]; }]; }>}
 * NoDuplicateDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoDuplicateDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow duplicate definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-definitions.md",
		},

		messages: {
			duplicateDefinition: "Unexpected duplicate definition found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					ignores: {
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
				ignores: ["//"],
			},
		],
	},

	create(context) {
		const [{ ignores }] = context.options;
		const definitions = new Map();

		return {
			definition(node) {
				definitions.set(
					node.identifier,
					definitions.has(node.identifier)
						? [...definitions.get(node.identifier), node]
						: [node],
				);
			},

			"root:exit"() {
				definitions.forEach((nodes, identifier) => {
					if (nodes.length <= 1 || ignores.includes(identifier)) {
						return;
					}

					nodes.forEach(node => {
						context.report({
							node,
							messageId: "duplicateDefinition",
						});
					});
				});
			},
		};
	},
};
