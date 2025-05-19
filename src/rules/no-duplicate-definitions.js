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
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: [{ allowDefinitions: string[], allowFootnoteDefinitions: string[]; }]; }>}
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
	if (!map.has(node.identifier)) {
		map.set(node.identifier, [node]);
	} else {
		map.get(node.identifier).push(node);
	}
}

/**
 * Finds duplicate nodes in a map if they exceed one occurrence.
 * @param {Map<string, Array<Definition | FootnoteDefinition>>} map The map of nodes to check.
 * @returns {Array<Definition | FootnoteDefinition>} The array of duplicate nodes.
 */
function findDuplicates(map) {
	/** @type {Array<Definition | FootnoteDefinition>} */
	const duplicates = [];

	map.forEach(nodes => {
		if (nodes.length <= 1) {
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
					allowDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					allowFootnoteDefinitions: {
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
				allowDefinitions: ["//"],
				allowFootnoteDefinitions: [],
			},
		],
	},

	create(context) {
		const [{ allowDefinitions, allowFootnoteDefinitions }] =
			context.options;

		const definitions = new Map();
		const footnoteDefinitions = new Map();

		return {
			definition(node) {
				if (allowDefinitions.includes(node.identifier)) {
					return;
				}

				appendNodeToMap(definitions, node);
			},

			footnoteDefinition(node) {
				if (allowFootnoteDefinitions.includes(node.identifier)) {
					return;
				}

				appendNodeToMap(footnoteDefinitions, node);
			},

			"root:exit"() {
				findDuplicates(definitions, allowDefinitions)
					.slice(1)
					.forEach(node => {
						context.report({
							node,
							messageId: "duplicateDefinition",
						});
					});

				findDuplicates(footnoteDefinitions, allowFootnoteDefinitions)
					.slice(1)
					.forEach(node => {
						context.report({
							node,
							messageId: "duplicateFootnoteDefinition",
						});
					});
			},
		};
	},
};
