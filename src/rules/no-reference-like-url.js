/**
 * @fileoverview Rule to enforce reference-style links when URL matches a defined identifier.
 * @author TKDev7
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Node} Node */
/** @typedef {import("mdast").Link} LinkNode */
/** @typedef {import("mdast").Image} ImageNode */
/** @typedef {import("mdast").Definition} DefinitionNode */
/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoReferenceLikeUrlRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoReferenceLikeUrlRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description:
				"Disallow URLs that match defined reference identifiers",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-reference-like-url.md",
		},

		fixable: "code",

		messages: {
			referenceLikeUrl:
				"Unexpected resource {{type}} with URL that matches a definition identifier. Use [text][id] syntax instead.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		/** @type {Set<string>} */
		const definitionIdentifiers = new Set();
		/** @type {Array<LinkNode|ImageNode>} */
		const resources = [];

		return {
			"root:exit"() {
				for (const node of resources) {
					const url = node.url.toLowerCase();

					if (definitionIdentifiers.has(url)) {
						context.report({
							node,
							messageId: "referenceLikeUrl",
							data: {
								type: node.type,
							},
							fix(fixer) {
								const text = sourceCode.getText(node);

								const bracketParenIndex = text.indexOf("](");
								const closeParenIndex = text.lastIndexOf(")");

								const startOffset =
									node.position.start.offset +
									bracketParenIndex +
									1;
								const endOffset =
									node.position.start.offset +
									closeParenIndex +
									1;

								return fixer.replaceTextRange(
									[startOffset, endOffset],
									`[${node.url}]`,
								);
							},
						});
					}
				}
			},

			definition(node) {
				definitionIdentifiers.add(node.identifier.toLowerCase());
			},

			link(node) {
				resources.push(node);
			},

			image(node) {
				resources.push(node);
			},
		};
	},
};
