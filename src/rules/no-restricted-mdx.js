/**
 * @fileoverview Rule to disallow parts of MDX syntax.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("eslint").Rule.RuleModule} RuleModule */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {RuleModule} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow MDX syntax",
		},

		messages: {
			disallowedExpression: "MDX expressions are not allowed.",
			disallowedJSX: "MDX JSX elements are not allowed.",
			disallowedESMImport: "MDX ESM import syntax is not allowed.",
			disallowedESMExport: "MDX ESM export syntax is not allowed.",
		},

		schema: [
			{
				type: "object",
				properties: {
					disallowExpressions: {
						type: "boolean",
					},
					disallowJSX: {
						type: "boolean",
					},
					disallowESMImports: {
						type: "boolean",
					},
					disallowESMExports: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				disallowExpressions: false,
				disallowJSX: false,
				disallowESMImports: false,
				disallowESMExports: false,
			},
		],
	},

	create(context) {
		const {
			disallowExpressions,
			disallowJSX,
			disallowESMImports,
			disallowESMExports,
		} = context.options[0];

		return {
			ImportDeclaration(node) {
				if (disallowESMImports) {
					context.report({
						loc: node.position,
						messageId: "disallowedESMImport",
					});
				}
			},

			"ExportNamedDeclaration, ExportDefaultDeclaration"(node) {
				if (disallowESMExports) {
					context.report({
						loc: node.position,
						messageId: "disallowedESMExport",
					});
				}
			},

			"mdxFlowExpression, mdxTextExpression"(node) {
				if (disallowExpressions) {
					context.report({
						loc: node.position,
						messageId: "disallowedExpression",
					});
				}
			},

			"mdxJsxFlowElement, mdxJsxTextElement"(node) {
				if (disallowJSX) {
					context.report({
						loc: node.position,
						messageId: "disallowedJSX",
					});
				}
			},
		};
	},
};
