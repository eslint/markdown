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
import { lineEndingPattern } from "../util.js";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/**
 * @import { Position } from "unist";
 * @import { Parent, Root, Node, Html, Text } from "mdast";
 * @import { TraversalStep, FileProblem, DirectiveType, RulesConfig } from "@eslint/core";
 * @import { MarkdownLanguageOptions } from "../types.js";
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const commentParser = new ConfigCommentParser();
const configCommentStart =
	/<!--\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|-->)/u;
const htmlComment = /<!--(.*?)-->/gsu;

/**
 * Represents an inline config comment in the source code.
 */
export class InlineConfigComment {
	/**
	 * The comment text.
	 * @type {string}
	 */
	value;

	/**
	 * The position of the comment in the source code.
	 * @type {Position}
	 */
	position;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.value The comment text.
	 * @param {Position} options.position The position of the comment in the source code.
	 */
	constructor({ value, position }) {
		this.value = value.trim();
		this.position = position;
	}
}

/**
 * Creates a unist Position object from start and end character offsets.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @param {number} startOffset The start character offset.
 * @param {number} endOffset The end character offset.
 * @returns {Position} The unist Position object.
 */
function createPositionFromOffsets(sourceCode, startOffset, endOffset) {
	return {
		start: {
			...sourceCode.getLocFromIndex(startOffset),
			offset: startOffset,
		},
		end: {
			...sourceCode.getLocFromIndex(endOffset),
			offset: endOffset,
		},
	};
}

/**
 * Populates missing `position` properties on a parent's direct children.
 * Some remark/mdast transforms (such as GFM autolink literals) split a text
 * node into replacement nodes without setting `position` on them.
 * @param {Parent} parentNode The parent node whose children should be checked.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {void}
 */
function populateMissingChildPositions(parentNode, sourceCode) {
	const { children } = parentNode;

	if (!children.some(child => !child.position)) {
		return;
	}

	const text = sourceCode.text;
	const parentStart = parentNode.position?.start.offset ?? 0;
	const parentEnd = parentNode.position?.end.offset ?? text.length;

	let index = 0;

	while (index < children.length) {
		if (children[index].position) {
			index++;
			continue;
		}

		const runStart = index;

		while (index < children.length && !children[index].position) {
			index++;
		}

		const runEnd = index - 1;
		const regionStart =
			runStart > 0 &&
			children[runStart - 1].position?.end.offset !== undefined
				? children[runStart - 1].position.end.offset
				: parentStart;
		const regionEnd =
			runEnd + 1 < children.length &&
			children[runEnd + 1].position?.start.offset !== undefined
				? children[runEnd + 1].position.start.offset
				: parentEnd;

		/** @type {Map<number, {start: number, end: number}>} */
		const locatedLinks = new Map();
		let searchCursor = regionStart;

		for (let i = runStart; i <= runEnd; i++) {
			const child = children[i];

			if (
				child.type === "link" &&
				"children" in child &&
				child.children.length === 1 &&
				child.children[0].type === "text"
			) {
				const linkText = /** @type {Text} */ (child.children[0]).value;
				const matchIndex = text.indexOf(linkText, searchCursor);

				if (
					matchIndex !== -1 &&
					matchIndex + linkText.length <= regionEnd
				) {
					const matchEnd = matchIndex + linkText.length;

					locatedLinks.set(i, { start: matchIndex, end: matchEnd });
					searchCursor = matchEnd;
				}
			}
		}

		let cursor = regionStart;

		for (let i = runStart; i <= runEnd; i++) {
			const child = children[i];
			const located = locatedLinks.get(i);

			if (located) {
				child.position = createPositionFromOffsets(
					sourceCode,
					located.start,
					located.end,
				);
				cursor = located.end;
				continue;
			}

			let nextEnd = regionEnd;

			for (let j = i + 1; j <= runEnd; j++) {
				const nextLocated = locatedLinks.get(j);

				if (nextLocated) {
					nextEnd = nextLocated.start;
					break;
				}
			}

			let start = cursor;
			let end = nextEnd;

			if (child.type === "text") {
				const { value } = /** @type {Text} */ (child);
				const hasFollowingSibling =
					i < runEnd && !locatedLinks.has(i + 1);

				if (
					i === 0 &&
					start === parentStart &&
					!hasFollowingSibling &&
					end - value.length >= start &&
					text.endsWith(value, end)
				) {
					start = end - value.length;
				} else if (
					(hasFollowingSibling ||
						(i === children.length - 1 && end === parentEnd)) &&
					start + value.length <= end &&
					text.startsWith(value, start)
				) {
					end = start + value.length;
				}
			}

			child.position = createPositionFromOffsets(sourceCode, start, end);
			cursor = end;
		}
	}
}

/**
 * Extracts inline configuration comments from an HTML node.
 * @param {Html} node The HTML node to extract comments from.
 * @param {MarkdownSourceCode} sourceCode The Markdown source code object.
 * @returns {Array<InlineConfigComment>} The inline configuration comments found in the node.
 */
function extractInlineConfigCommentsFromHTML(node, sourceCode) {
	if (!configCommentStart.test(node.value)) {
		return [];
	}

	/** @type {Array<InlineConfigComment>} */
	const comments = [];

	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = htmlComment.exec(node.value))) {
		if (configCommentStart.test(match[0])) {
			// calculate offset of the comment inside the node
			const startOffset = match.index + node.position.start.offset;
			const endOffset = startOffset + match[0].length;

			comments.push(
				new InlineConfigComment({
					value: match[1].trim(),
					position: {
						start: {
							...sourceCode.getLocFromIndex(startOffset),
							offset: startOffset,
						},
						end: {
							...sourceCode.getLocFromIndex(endOffset),
							offset: endOffset,
						},
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
 * @extends {TextSourceCodeBase<{LangOptions: MarkdownLanguageOptions, RootNode: Root, SyntaxElementWithLoc: Node, ConfigNode: { value: string; position: Position }}>}
 */
export class MarkdownSourceCode extends TextSourceCodeBase {
	/**
	 * Cached traversal steps.
	 * @type {Array<VisitNodeStep>|undefined}
	 */
	#steps;

	/**
	 * Cache of parent nodes.
	 * @type {WeakMap<Node, Parent|undefined>}
	 */
	#parents = new WeakMap();

	/**
	 * Collection of HTML nodes. Used to find directive comments.
	 * @type {Array<Html>}
	 */
	#htmlNodes = [];

	/**
	 * Collection of inline configuration comments.
	 * @type {Array<InlineConfigComment>}
	 */
	#inlineConfigComments;

	/**
	 * The AST of the source code.
	 * @type {Root}
	 */
	ast = undefined;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.text The source code text.
	 * @param {Root} options.ast The root AST node.
	 */
	constructor({ text, ast }) {
		super({ ast, text, lineEndingPattern });
		this.ast = ast;

		// need to traverse the source code to get the inline config nodes
		this.traverse();
	}

	/**
	 * Returns the parent of the given node.
	 * @param {Node} node The node to get the parent of.
	 * @returns {Parent|undefined} The parent of the node.
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
			this.#inlineConfigComments = this.#htmlNodes.flatMap(htmlNode =>
				extractInlineConfigCommentsFromHTML(htmlNode, this),
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
		/** @type {Array<FileProblem>} */
		const problems = [];
		/** @type {Array<Directive>} */
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
	 * Returns inline rule configurations along with any problems
	 * encountered while parsing the configurations.
	 * @returns {{problems:Array<FileProblem>,configs:Array<{config:{rules:RulesConfig},loc:Position}>}} Information
	 *      that ESLint needs to further process the rule configurations.
	 */
	applyInlineConfig() {
		/** @type {Array<FileProblem>} */
		const problems = [];
		/** @type {Array<{config:{rules:RulesConfig},loc:Position}>} */
		const configs = [];

		this.getInlineConfigNodes().forEach(comment => {
			const { label, value } = commentParser.parseDirective(
				comment.value,
			);

			if (label === "eslint") {
				const parseResult = commentParser.parseJSONLikeConfig(value);

				if (parseResult.ok) {
					configs.push({
						config: {
							rules: parseResult.config,
						},
						loc: comment.position,
					});
				} else {
					problems.push({
						ruleId: null,
						message:
							/** @type {{ok: false, error: { message: string }}} */ (
								parseResult
							).error.message,
						loc: comment.position,
					});
				}
			}
		});

		return {
			configs,
			problems,
		};
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

		/**
		 * Recursively visits a node and its children.
		 * @param {Node} node The node to visit.
		 * @param {Parent} [parent] The parent of the node.
		 * @returns {void}
		 */
		const visit = (node, parent) => {
			// ensure every node has a position
			if (!node.position) {
				node.position =
					parent?.position ??
					createPositionFromOffsets(this, 0, this.text.length);
			}

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
				this.#htmlNodes.push(/** @type {Html} */ (node));
			}

			// then visit the children
			if ("children" in node) {
				const parentNode = /** @type {Parent} */ (node);

				populateMissingChildPositions(parentNode, this);

				parentNode.children.forEach(child => {
					visit(child, parentNode);
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
