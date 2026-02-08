/**
 * @fileoverview Rule to prevent unused definitions in Markdown.
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
 * @typedef {"unusedDefinition" | "unusedFootnoteDefinition"} NoUnusedDefinitionsMessageIds
 * @typedef {[{ allowDefinitions?: string[], allowFootnoteDefinitions?: string[], checkFootnoteDefinitions?: boolean }]} NoUnusedDefinitionsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoUnusedDefinitionsOptions, MessageIds: NoUnusedDefinitionsMessageIds }>} NoUnusedDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoUnusedDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow unused definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-unused-definitions.md",
		},

		messages: {
			unusedDefinition:
				"Unexpected unused definition `{{ identifier }}` (label: `{{ label }}`) found.",
			unusedFootnoteDefinition:
				"Unexpected unused footnote definition `{{ identifier }}` (label: `{{ label }}`) found.",
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

		/** @type {Set<string>} Set to track used identifiers */
		const usedIdentifiers = new Set();
		/** @type {Set<string>} Set to track used footnote identifiers */
		const usedFootnoteIdentifiers = new Set();
		/** @type {Set<Definition>} */
		const definitions = new Set();
		/** @type {Set<FootnoteDefinition>} */
		const footnoteDefinitions = new Set();

		return {
			imageReference(node) {
				usedIdentifiers.add(node.identifier);
			},

			linkReference(node) {
				usedIdentifiers.add(node.identifier);
			},

			footnoteReference(node) {
				usedFootnoteIdentifiers.add(node.identifier);
			},

			definition(node) {
				if (allowDefinitions.has(node.identifier)) {
					return;
				}

				definitions.add(node);
			},

			footnoteDefinition(node) {
				if (
					!checkFootnoteDefinitions ||
					allowFootnoteDefinitions.has(node.identifier)
				) {
					return;
				}

				footnoteDefinitions.add(node);
			},

			"root:exit"() {
				for (const definition of definitions) {
					if (!usedIdentifiers.has(definition.identifier)) {
						context.report({
							node: definition,
							messageId: "unusedDefinition",
							data: {
								identifier: definition.identifier,
								label: definition.label.trim(),
							},
						});
					}
				}

				for (const footnoteDefinition of footnoteDefinitions) {
					if (
						!usedFootnoteIdentifiers.has(
							footnoteDefinition.identifier,
						)
					) {
						context.report({
							node: footnoteDefinition,
							messageId: "unusedFootnoteDefinition",
							data: {
								identifier: footnoteDefinition.identifier,
								label: footnoteDefinition.label,
							},
						});
					}
				}
			},
		};
	},
};
