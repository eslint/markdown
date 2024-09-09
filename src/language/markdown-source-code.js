/**
 * @fileoverview The MarkdownSourceCode class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { VisitNodeStep, TextSourceCodeBase } from "@eslint/plugin-kit";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Root} RootNode */
/** @typedef {import("mdast").Node} MarkdownNode */
/** @typedef {import("@eslint/core").Language} Language */
/** @typedef {import("@eslint/core").File} File */
/** @typedef {import("@eslint/core").TraversalStep} TraversalStep */
/** @typedef {import("@eslint/core").VisitTraversalStep} VisitTraversalStep */
/** @typedef {import("@eslint/core").TextSourceCode} TextSourceCode */
/** @typedef {import("@eslint/core").ParseResult<RootNode>} ParseResult */
/** @typedef {import("@eslint/core").SourceLocation} SourceLocation */
/** @typedef {import("@eslint/core").SourceRange} SourceRange */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Markdown Source Code Object
 */
export class MarkdownSourceCode extends TextSourceCodeBase {
	/**
	 * Cached traversal steps.
	 * @type {Array<VisitNodeStep>|undefined}
	 */
	#steps;

	/**
	 * Cache of parent nodes.
	 * @type {WeakMap<MarkdownNode, MarkdownNode>}
	 */
	#parents = new WeakMap();

	/**
	 * The AST of the source code.
	 * @type {RootNode}
	 */
	ast = undefined;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.text The source code text.
	 * @param {RootNode} options.ast The root AST node.
	 */
	constructor({ text, ast }) {
		super({ ast, text });
		this.ast = ast;
	}

	/**
	 * Returns the parent of the given node.
	 * @param {MarkdownNode} node The node to get the parent of.
	 * @returns {MarkdownNode|undefined} The parent of the node.
	 */
	getParent(node) {
		return this.#parents.get(node);
	}

	/**
	 * Traverse the source code and return the steps that were taken.
	 * @returns {Iterable<TraversalStep>} The steps that were taken while traversing the source code.
	 */
	traverse() {
		// Because the AST doesn't mutate, we can cache the steps
		if (this.#steps) {
			return this.#steps.values();
		}

		/** @type {Array<VisitNodeStep>} */
		const steps = (this.#steps = []);

		const visit = (node, parent) => {
			// first set the parent
			this.#parents.set(node, parent);

			// then add the step
			steps.push(
				new VisitNodeStep({
					target: node,
					phase: 1,
					args: [node, parent],
				}),
			);

			// then visit the children
			if (node.children) {
				node.children.forEach(child => {
					visit(child, node);
				});
			}

			// then add the exit step
			steps.push(
				new VisitNodeStep({
					target: node,
					phase: 2,
					args: [node, parent],
				}),
			);
		};

		visit(this.ast);

		return steps.values();
	}
}
