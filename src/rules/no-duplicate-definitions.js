/**
 * @fileoverview Rule to prevent duplicate definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { normalizeIdentifier } from "micromark-util-normalize-identifier";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Definition, FootnoteDefinition } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"duplicateDefinition" | "duplicateFootnoteDefinition"} NoDuplicateDefinitionsMessageIds
 * @typedef {[{ allowDefinitions?: string[], allowFootnoteDefinitions?: string[], checkFootnoteDefinitions?: boolean }]} NoDuplicateDefinitionsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoDuplicateDefinitionsOptions, MessageIds: NoDuplicateDefinitionsMessageIds }>} NoDuplicateDefinitionsRuleDefinition
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
			duplicateDefinition:
				"Unexpected duplicate definition `{{ identifier }}` (label: `{{ label }}`) found. First defined at line {{ firstLine }} (label: `{{ firstLabel }}`).",
			duplicateFootnoteDefinition:
				"Unexpected duplicate footnote definition `{{ identifier }}` (label: `{{ label }}`) found. First defined at line {{ firstLine }} (label: `{{ firstLabel }}`).",
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
					checkFootnoteDefinitions: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowDefinitions: ["//"],
				allowFootnoteDefinitions: [],
				checkFootnoteDefinitions: true,
			},
		],
	},

	create(context) {
		const allowDefinitions = new Set(
			context.options[0].allowDefinitions.map(identifier =>
				normalizeIdentifier(identifier).toLowerCase(),
			),
		);
		const allowFootnoteDefinitions = new Set(
			context.options[0].allowFootnoteDefinitions.map(identifier =>
				normalizeIdentifier(identifier).toLowerCase(),
			),
		);
		const [{ checkFootnoteDefinitions }] = context.options;

		/** @type {Map<string, Definition>} */
		const definitions = new Map();

		/** @type {Map<string, FootnoteDefinition>} */
		const footnoteDefinitions = new Map();

		return {
			definition(node) {
				if (allowDefinitions.has(node.identifier)) {
					return;
				}

				if (definitions.has(node.identifier)) {
					const firstDefinitionNode = definitions.get(
						node.identifier,
					);
					context.report({
						node,
						messageId: "duplicateDefinition",
						data: {
							identifier: node.identifier,
							label: node.label.trim(),
							firstLine:
								firstDefinitionNode.position.start.line.toString(),
							firstLabel: firstDefinitionNode.label.trim(),
						},
					});
				} else {
					definitions.set(node.identifier, node);
				}
			},

			footnoteDefinition(node) {
				if (!checkFootnoteDefinitions) {
					return;
				}

				if (allowFootnoteDefinitions.has(node.identifier)) {
					return;
				}

				if (footnoteDefinitions.has(node.identifier)) {
					const firstFootnoteDefinitionNode = footnoteDefinitions.get(
						node.identifier,
					);
					context.report({
						node,
						messageId: "duplicateFootnoteDefinition",
						data: {
							identifier: node.identifier,
							label: node.label,
							firstLine:
								firstFootnoteDefinitionNode.position.start.line.toString(),
							firstLabel: firstFootnoteDefinitionNode.label,
						},
					});
				} else {
					footnoteDefinitions.set(node.identifier, node);
				}
			},
		};
	},
};
