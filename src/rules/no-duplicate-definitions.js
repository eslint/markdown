/**
 * @fileoverview Rule to prevent duplicate definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Definition} Definition */
/** @typedef {import("mdast").FootnoteDefinition} FootnoteDefinition */
/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ ignoreDefinition: string[], ignoreFootnoteDefinition: string[]; }]; }>}
 * NoDuplicateDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Appends a node to a map, grouping by identifier.
 * Creates a new array if the identifier doesn't exist,
 * or appends to the existing array if it does.
 * @param {Map<string, Array<Definition | FootnoteDefinition>>} map The map to store nodes in.
 * @param {Definition | FootnoteDefinition} node The node to add to the map.
 * @returns {void}
 */
function appendNodeToMap(map, node) {
	map.set(
		node.identifier,
		map.has(node.identifier) ? [...map.get(node.identifier), node] : [node],
	);
}

/**
 * Finds duplicate nodes in a map if they exceed one occurrence and are not ignored.
 * @param {Map<string, Array<Definition | FootnoteDefinition>>} map The map of nodes to check.
 * @param {string[]} ignoreList The list of identifiers to ignore.
 * @returns {Array<Definition | FootnoteDefinition>} The array of duplicate nodes.
 */
function findDuplicates(map, ignoreList) {
	/** @type {Array<Definition | FootnoteDefinition>} */
	const duplicates = [];

	map.forEach((nodes, identifier) => {
		if (nodes.length <= 1 || ignoreList.includes(identifier)) {
			return;
		}

		duplicates.push(...nodes);
	});

	return duplicates;
}

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
			duplicateFootnoteDefinition:
				"Unexpected duplicate footnote definition found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					ignoreDefinition: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					ignoreFootnoteDefinition: {
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
				ignoreDefinition: ["//"],
				ignoreFootnoteDefinition: [],
			},
		],
	},

	create(context) {
		const [{ ignoreDefinition, ignoreFootnoteDefinition }] =
			context.options;

		const definitions = new Map();
		const footnoteDefinitions = new Map();

		return {
			definition(node) {
				appendNodeToMap(definitions, node);
			},

			footnoteDefinition(node) {
				appendNodeToMap(footnoteDefinitions, node);
			},

			"root:exit"() {
				findDuplicates(definitions, ignoreDefinition).forEach(node => {
					context.report({
						node,
						messageId: "duplicateDefinition",
					});
				});

				findDuplicates(
					footnoteDefinitions,
					ignoreFootnoteDefinition,
				).forEach(node => {
					context.report({
						node,
						messageId: "duplicateFootnoteDefinition",
					});
				});
			},
		};
	},
};
