/**
 * @fileoverview The MarkdownSourceCode class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	VisitNodeStep,
	TextSourceCodeBase,
	ConfigCommentParser,
	Directive,
} from "@eslint/plugin-kit";
import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Root} RootNode */
/** @typedef {import("mdast").Node} MarkdownNode */
/** @typedef {import("mdast").Html} HTMLNode */
/** @typedef {import("@eslint/core").Language} Language */
/** @typedef {import("@eslint/core").File} File */
/** @typedef {import("@eslint/core").TraversalStep} TraversalStep */
/** @typedef {import("@eslint/core").VisitTraversalStep} VisitTraversalStep */
/** @typedef {import("@eslint/core").TextSourceCode} TextSourceCode */
/** @typedef {import("@eslint/core").ParseResult<RootNode>} ParseResult */
/** @typedef {import("@eslint/core").SourceLocation} SourceLocation */
/** @typedef {import("@eslint/core").SourceRange} SourceRange */
/** @typedef {import("@eslint/core").FileProblem} FileProblem */
/** @typedef {import("@eslint/core").DirectiveType} DirectiveType */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const commentParser = new ConfigCommentParser();
const configCommentStart =
	/<!--\s*(eslint(?:-enable|-disable(?:(?:-next)?-line)?))(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

/**
 * Represents an inline config comment in the source code.
 */
class InlineConfigComment {
	/**
	 * The comment text.
	 * @type {string}
	 */
	value;

	/**
	 * The position of the comment in the source code.
	 * @type {SourceLocation}
	 */
	position;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.value The comment text.
	 * @param {SourceLocation} options.position The position of the comment in the source code.
	 */
	constructor({ value, position }) {
		this.value = value.trim();
		this.position = position;
	}
}

/**
 * Extracts inline configuration comments from an HTML node.
 * @param {HTMLNode} node The HTML node to extract comments from.
 * @returns {Array<InlineConfigComment>} The inline configuration comments found in the node.
 */
function extractInlineConfigCommentsFromHTML(node) {
	if (!configCommentStart.test(node.value)) {
		return [];
	}
	const comments = [];

	let match;

	while ((match = htmlComment.exec(node.value))) {
		if (configCommentStart.test(match[0])) {
			const comment = match[0];

			// calculate location of the comment inside the node
			const start = {
				...node.position.start,
			};

			const end = {
				...node.position.start,
			};

			const {
				lineOffset: startLineOffset,
				columnOffset: startColumnOffset,
			} = findOffsets(node.value, match.index);

			start.line += startLineOffset;
			start.column += startColumnOffset;
			start.offset += match.index;

			const commentLineCount = comment.split("\n").length - 1;

			end.line = start.line + commentLineCount;
			end.column =
				commentLineCount === 0
					? start.column + comment.length
					: comment.length - comment.lastIndexOf("\n");
			end.offset = start.offset + comment.length;

			comments.push(
				new InlineConfigComment({
					value: match[1].trim(),
					position: {
						start,
						end,
					},
				}),
			);
		}
	}

	return comments;
}

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
	 * Collection of HTML nodes. Used to find directive comments.
	 * @type {Array<HTMLNode>}
	 */
	#htmlNodes = [];

	/**
	 * Collection of inline configuration comments.
	 * @type {Array<InlineConfigComment>}
	 */
	#inlineConfigComments;

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

		// need to traverse the source code to get the inline config nodes
		this.traverse();
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
	 * Returns an array of all inline configuration nodes found in the
	 * source code.
	 * @returns {Array<InlineConfigComment>} An array of all inline configuration nodes.
	 */
	getInlineConfigNodes() {
		if (!this.#inlineConfigComments) {
			this.#inlineConfigComments = this.#htmlNodes.flatMap(
				extractInlineConfigCommentsFromHTML,
			);
		}

		return this.#inlineConfigComments;
	}

	/**
	 * Returns an all directive nodes that enable or disable rules along with any problems
	 * encountered while parsing the directives.
	 * @returns {{problems:Array<FileProblem>,directives:Array<Directive>}} Information
	 *      that ESLint needs to further process the directives.
	 */
	getDisableDirectives() {
		const problems = [];
		const directives = [];

		this.getInlineConfigNodes().forEach(comment => {
			// Step 1: Parse the directive
			const {
				label,
				value,
				justification: justificationPart,
			} = commentParser.parseDirective(comment.value);

			// Step 2: Validate the directive does not span multiple lines
			if (
				label === "eslint-disable-line" &&
				comment.position.start.line !== comment.position.end.line
			) {
				const message = `${label} comment should not span multiple lines.`;

				problems.push({
					ruleId: null,
					message,
					loc: comment.position,
				});
				return;
			}

			// Step 3: Extract the directive value and create the Directive object
			switch (label) {
				case "eslint-disable":
				case "eslint-enable":
				case "eslint-disable-next-line":
				case "eslint-disable-line": {
					const directiveType = label.slice("eslint-".length);

					directives.push(
						new Directive({
							type: /** @type {DirectiveType} */ (directiveType),
							node: comment,
							value,
							justification: justificationPart,
						}),
					);
				}

				// no default
			}
		});

		return { problems, directives };
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

			// save HTML nodes
			if (node.type === "html") {
				this.#htmlNodes.push(node);
			}

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
