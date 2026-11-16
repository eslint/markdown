/**
 * @fileoverview Processes Markdown files for consumption by ESLint.
 * @author Brandon Mills
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { fromMarkdown } from "mdast-util-from-markdown";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { LintMessage, RuleTextEdit, SourceRange } from "@eslint/core";
 * @import { Node, Parent, Code, Html } from "mdast";
 * @import { Position } from "unist";
 * @import { Block, RangeMap } from "./types.js";
 * @typedef { Block['comments'][number] } Comment
 * @typedef { Pick<RangeMap, "js" | "md"> } OffsetMapping
 * @typedef {{ comment: Comment, jsOffset: number, rangeMap: OffsetMapping[] }} CommentMapping
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const UNSATISFIABLE_RULES = new Set([
	"eol-last", // The Markdown parser strips trailing newlines in code fences
	"unicode-bom", // Code blocks will begin in the middle of Markdown files
]);
const SUPPORTS_AUTOFIX = true;

const BOM = "\uFEFF";

const HTML_COMMENT_START = "<!--";
const HTML_COMMENT_END = "-->";
const JS_COMMENT_START = "/*";
const JS_COMMENT_END = "*/";

const unusedDirectiveMessagePattern =
	/^Unused eslint-(?:disable|enable) directive/u;

/**
 * @type {Map<string, { text: string, blocks: Block[] }>}
 */
const blocksCache = new Map();

/**
 * Performs a depth-first traversal of the Markdown AST.
 * @param {Node} node A Markdown AST node.
 * @param {{[key: string]: (() => void) | ((node: Code) => void) | ((node: Html) => void)}} callbacks A map of node types to callbacks.
 * @returns {void}
 */
function traverse(node, callbacks) {
	if (callbacks[node.type]) {
		/** @type {(node: Node) => void} */ (callbacks[node.type])(node);
	} else {
		/** @type {() => void} */ (callbacks["*"])();
	}

	const parent = /** @type {Parent} */ (node);

	if (typeof parent.children !== "undefined") {
		for (let i = 0; i < parent.children.length; i++) {
			traverse(parent.children[i], callbacks);
		}
	}
}

/**
 * Extracts `eslint-*` or `global` comments from HTML comments if present.
 * @param {string} html The text content of an HTML AST node.
 * @returns {string} The comment's text without the opening and closing tags or
 *     an empty string if the text is not an ESLint HTML comment.
 */
function getComment(html) {
	const regex = /^(?:eslint\b|global\s)/u;

	if (
		html.slice(0, HTML_COMMENT_START.length) !== HTML_COMMENT_START ||
		html.slice(-HTML_COMMENT_END.length) !== HTML_COMMENT_END
	) {
		return "";
	}

	const comment = html.slice(
		HTML_COMMENT_START.length,
		html.indexOf(HTML_COMMENT_END, HTML_COMMENT_START.length),
	);

	if (!regex.test(comment.trim())) {
		return "";
	}

	return comment;
}

/**
 * Gets the position of an `eslint-*` or `global` comment at the beginning of an
 * HTML node. The node may contain other HTML after the comment, such as
 * `<!-- eslint-disable no-console -->text<!-- another comment -->`, in which
 * case the comment ends before the node does.
 * @param {Html} node An HTML AST node.
 * @param {string} comment The comment's text without the opening and closing
 *     tags.
 * @returns {Position} The position of the HTML comment in the Markdown source.
 */
function getCommentPosition(node, comment) {
	const { start, end } = node.position;
	const trailingLength =
		node.value.length -
		(HTML_COMMENT_START.length + comment.length + HTML_COMMENT_END.length);

	return {
		start,
		end: {
			line: end.line,
			column: end.column - trailingLength,
			offset: end.offset - trailingLength,
		},
	};
}

// Before a code block, blockquote characters (`>`) are also considered
// "whitespace".
const leadingWhitespaceRegex = /^[>\s]*/u;

/**
 * Gets the offset for the first column of the node's first line in the
 * original source text.
 * @param {Code} node A Markdown code block AST node.
 * @returns {number} The offset for the first column of the node's first line.
 */
function getBeginningOfLineOffset(node) {
	return node.position.start.offset - node.position.start.column + 1;
}

/**
 * Gets the leading text, typically whitespace with possible blockquote chars,
 * used to indent a code block.
 * @param {string} text The text of the file.
 * @param {Code} node A Markdown code block AST node.
 * @returns {string} The text from the start of the first line to the opening
 *     fence of the code block.
 */
function getIndentText(text, node) {
	return leadingWhitespaceRegex.exec(
		text.slice(getBeginningOfLineOffset(node)),
	)[0];
}

/**
 * When applying fixes, the postprocess step needs to know how to map fix ranges
 * from their location in the linted JS to the original offset in the Markdown.
 * Configuration comments and indentation trimming both complicate this process.
 *
 * Configuration comments appear in the linted JS but not in the Markdown code
 * block. Fixes to configuration comments would cause undefined behavior and
 * should be ignored during postprocessing. Fixes to actual code after
 * configuration comments need to be mapped back to the code block after
 * removing any offset due to configuration comments.
 *
 * Fenced code blocks can be indented by up to three spaces at the opening
 * fence. Inside of a list, for example, this indent can be in addition to the
 * indent already required for list item children. Leading whitespace inside
 * indented code blocks is trimmed up to the level of the opening fence and does
 * not appear in the linted code. Further, lines can have less leading
 * whitespace than the opening fence, so not all lines are guaranteed to have
 * the same column offset as the opening fence.
 *
 * The source code of a non-configuration-comment line in the linted JS is a
 * suffix of the corresponding line in the Markdown code block. There are no
 * differences within the line, so the mapping need only provide the offset
 * delta at the beginning of each line.
 * @param {string} text The text of the file.
 * @param {Code} node A Markdown code block AST node.
 * @param {Comment[]} comments List of configuration comment objects that will be
 *     inserted at the beginning of the code block.
 * @returns {RangeMap[]} A list of offset-based adjustments, where lookups are
 *     done based on the `js` key, which represents the range in the linted JS,
 *     and the `md` key is the offset delta that, when added to the JS range,
 *     returns the corresponding location in the original Markdown source.
 */
function getBlockRangeMap(text, node, comments) {
	/*
	 * The parser sets the fenced code block's start offset to wherever content
	 * should normally begin (typically the first column of the line, but more
	 * inside a list item, for example). The code block's opening fence may be
	 * further indented by up to three characters. If the code block has
	 * additional indenting, the opening fence's first backtick may be up to
	 * three whitespace characters after the start offset.
	 */
	const startOffset = getBeginningOfLineOffset(node);

	/*
	 * Extract the Markdown source to determine the leading whitespace for each
	 * line.
	 */
	const code = text.slice(startOffset, node.position.end.offset);
	const lines = code.split("\n");

	/*
	 * The parser trims leading whitespace from each line of code within the
	 * fenced code block up to the opening fence's first backtick. The first
	 * backtick's column is the AST node's starting column plus any additional
	 * indentation.
	 */
	const baseIndent = getIndentText(text, node).length;

	/*
	 * Track the length of any inserted configuration comments at the beginning
	 * of the linted JS and start the JS offset lookup keys at this index.
	 */
	const commentLength = comments.reduce(
		(len, comment) => len + comment.text.length + 1,
		0,
	);

	/*
	 * In case there are configuration comments, initialize the map so that the
	 * first lookup index is always 0. If there are no configuration comments,
	 * the lookup index will also be 0, and the lookup should always go to the
	 * last range that matches, skipping this initialization entry.
	 */
	const rangeMap = [
		{
			indent: baseIndent,
			js: 0,
			md: 0,
		},
	];

	// Start the JS offset after any configuration comments.
	let jsOffset = commentLength;

	/*
	 * Start the Markdown offset at the beginning of the block's first line of
	 * actual code. The first line of the block is always the opening fence, so
	 * the code begins on the second line.
	 */
	let mdOffset = startOffset + lines[0].length + 1;

	/*
	 * For each line, determine how much leading whitespace was trimmed due to
	 * indentation. Increase the JS lookup offset by the length of the line
	 * post-trimming and the Markdown offset by the total line length.
	 */
	for (let i = 0; i + 1 < lines.length; i++) {
		const line = lines[i + 1];
		const leadingWhitespaceLength =
			leadingWhitespaceRegex.exec(line)[0].length;

		// The parser trims leading whitespace up to the level of the opening
		// fence, so keep any additional indentation beyond that.
		const trimLength = Math.min(baseIndent, leadingWhitespaceLength);

		rangeMap.push({
			indent: trimLength,
			js: jsOffset,

			// Advance `trimLength` character from the beginning of the Markdown
			// line to the beginning of the equivalent JS line, then compute the
			// delta.
			md: mdOffset + trimLength - jsOffset,
		});

		// Accumulate the current line in the offsets, and don't forget the
		// newline.
		mdOffset += line.length + 1;
		jsOffset += line.length - trimLength + 1;
	}

	return rangeMap;
}

/**
 * Builds a range map for a configuration comment so that fixes inside it can be
 * mapped from the linted JS back to the HTML comment in the Markdown.
 *
 * The comment's text starts after `/*` in the JS but after `<!--` in the
 * Markdown. The Markdown parser also strips container prefixes, such as
 * blockquote markers (`>`) and list item indentation, from every line after the
 * first, and each stripped prefix shifts the rest of the comment by its length.
 * @param {string} text The text of the file.
 * @param {Comment} comment A configuration comment inserted into the linted JS.
 * @param {number} jsOffset The offset of the comment in the linted JS.
 * @returns {OffsetMapping[]} One entry per line of the comment, where `js` is
 *     the offset at which the line's text starts in the linted JS and `md` is
 *     the delta that maps offsets on that line to the Markdown.
 */
function getCommentRangeMap(text, comment, jsOffset) {
	const { start, end } = comment.position;
	const jsLines = comment.text
		.slice(JS_COMMENT_START.length, -JS_COMMENT_END.length)
		.split("\n");
	const mdLines = text
		.slice(
			start.offset + HTML_COMMENT_START.length,
			end.offset - HTML_COMMENT_END.length,
		)
		.split("\n");

	let jsLineStart = jsOffset + JS_COMMENT_START.length;
	let mdDelta = start.offset + HTML_COMMENT_START.length - jsLineStart;

	const rangeMap = [{ js: jsLineStart, md: mdDelta }];

	for (let i = 1; i < jsLines.length; i++) {
		jsLineStart += jsLines[i - 1].length + 1;
		mdDelta += mdLines[i].length - jsLines[i].length;

		rangeMap.push({ js: jsLineStart, md: mdDelta });
	}

	return rangeMap;
}

/**
 * Maps an offset in the linted JS to the corresponding offset in the original
 * Markdown by applying the delta of the last range that starts at or before it.
 * @param {OffsetMapping[]} rangeMap A list of offset-based adjustments, sorted
 *     by their `js` keys.
 * @param {number} offset An offset in the linted JS.
 * @returns {number} The corresponding offset in the Markdown source.
 */
function mapOffset(rangeMap, offset) {
	// Advance through the range map to find the last matching range by finding
	// the first range too far and then going back one.
	let i = 1;

	while (i < rangeMap.length && rangeMap[i].js <= offset) {
		i++;
	}

	// Apply the mapping delta for this range.
	return offset + rangeMap[i - 1].md;
}

/**
 * Determines whether a message reports an unused directive.
 * @param {LintMessage} message The message to check.
 * @returns {boolean} True if the message reports an unused directive.
 */
function isUnusedDirectiveMessage(message) {
	return (
		message.ruleId === null &&
		unusedDirectiveMessagePattern.test(message.message)
	);
}

/**
 * Adjusts an unused directive message in an inserted JS comment.
 * @param {LintMessage} message The message to adjust.
 * @param {Map<number, CommentMapping>} commentMappings Precomputed comment mappings, keyed by generated line.
 * @returns {LintMessage} The adjusted message, if it can be mapped.
 */
function adjustCommentMessage(message, commentMappings) {
	const mapping = commentMappings.get(message.line);

	if (!mapping) {
		return message;
	}

	const { comment: foundComment, jsOffset, rangeMap } = mapping;
	const { start, end } = foundComment.position;
	const { fix, ...messageWithoutFix } = message;

	const adjustedMessage = /** @type {LintMessage} */ ({
		...messageWithoutFix,
		line: start.line,
		column: start.column,
		endLine: end.line,
		endColumn: end.column,
	});

	if (fix) {
		const isFullRemoval =
			fix.range[0] <= jsOffset &&
			fix.range[1] >= jsOffset + foundComment.text.length;

		if (isFullRemoval) {
			adjustedMessage.fix = {
				range: [start.offset, end.offset],
				text: fix.text,
			};
		} else {
			adjustedMessage.fix = {
				range: /** @type {SourceRange} */ (
					fix.range.map(range => mapOffset(rangeMap, range))
				),
				text: fix.text,
			};
		}
	}

	return adjustedMessage;
}

const codeBlockFileNameRegex = /filename=(?<quote>["'])(?<filename>.*?)\1/u;

/**
 * Parses the file name from a block meta, if available.
 * @param {Block} block A code block.
 * @returns {string | null | undefined} The filename, if parsed from block meta.
 */
function fileNameFromMeta(block) {
	return block.meta
		?.match(codeBlockFileNameRegex)
		?.groups.filename.replaceAll(/\s+/gu, "_");
}

const languageToFileExtension = {
	javascript: "js",
	ecmascript: "js",
	typescript: "ts",
	markdown: "md",
};

/**
 * Extracts lintable code blocks from Markdown text.
 * @param {string} sourceText The text of the file.
 * @param {string} filename The filename of the file.
 * @returns {Array<{ filename: string, text: string }>} Source code blocks to lint.
 */
function preprocess(sourceText, filename) {
	const text = sourceText.startsWith(BOM) ? sourceText.slice(1) : sourceText;
	const ast = fromMarkdown(text);

	/** @type {Block[]} */
	const blocks = [];

	blocksCache.set(filename, { text, blocks });

	/**
	 * During the depth-first traversal, keep track of any sequences of HTML
	 * comment nodes containing `eslint-*` or `global` comments. If a code
	 * block immediately follows such a sequence, insert the comments at the
	 * top of the code block. Any non-ESLint comment or other node type breaks
	 * and empties the sequence.
	 * @type {Comment[]}
	 */
	let htmlComments = [];

	traverse(ast, {
		"*"() {
			htmlComments = [];
		},

		/**
		 * Visit a code node.
		 * @param {Code} node The visited node.
		 * @returns {void}
		 */
		code(node) {
			if (node.lang) {
				/** @type {Comment[]} */
				const comments = [];

				for (const comment of htmlComments) {
					if (comment.text.trim() === "eslint-skip") {
						htmlComments = [];
						return;
					}

					comments.push({
						text: `${JS_COMMENT_START}${comment.text}${JS_COMMENT_END}`,
						position: comment.position,
					});
				}

				htmlComments = [];

				blocks.push({
					...node,
					baseIndentText: getIndentText(text, node),
					comments,
					rangeMap: getBlockRangeMap(text, node, comments),
				});
			}
		},

		/**
		 * Visit an HTML node.
		 * @param {Html} node The visited node.
		 * @returns {void}
		 */
		html(node) {
			const comment = getComment(node.value);

			if (comment) {
				htmlComments.push({
					text: comment,
					position: getCommentPosition(node, comment),
				});
			} else {
				htmlComments = [];
			}
		},
	});

	return blocks.map((block, index) => {
		const [language] = block.lang.trim().split(" ");
		const fileExtension = Object.hasOwn(languageToFileExtension, language)
			? languageToFileExtension[
					/** @type {keyof typeof languageToFileExtension} */ (
						language
					)
				]
			: language;

		return {
			filename: fileNameFromMeta(block) ?? `${index}.${fileExtension}`,
			text: [...block.comments.map(c => c.text), block.value, ""].join(
				"\n",
			),
		};
	});
}

/**
 * Adjusts a fix in a code block.
 * @param {Block} block A code block.
 * @param {RuleTextEdit} fix A fix to adjust.
 * @returns {RuleTextEdit} The fix with adjusted ranges.
 */
function adjustFix(block, fix) {
	return {
		range: /** @type {SourceRange} */ (
			fix.range.map(range => mapOffset(block.rangeMap, range))
		),
		text: fix.text.replace(/\n/gu, `\n${block.baseIndentText}`),
	};
}

/**
 * Creates a map function that adjusts messages in a code block.
 * @param {Block} block A code block.
 * @param {string} text The text of the file.
 * @returns {(message: LintMessage) => LintMessage | null} A function that adjusts messages in a code block.
 */
function adjustBlock(block, text) {
	/** @type {Map<number, CommentMapping>} */
	const commentMappings = new Map();
	let currentLine = 1;
	let jsOffset = 0;

	for (const comment of block.comments) {
		const commentLines = comment.text.split("\n").length;
		const mapping = {
			comment,
			jsOffset,
			rangeMap: getCommentRangeMap(text, comment, jsOffset),
		};

		for (let i = 0; i < commentLines; i++) {
			commentMappings.set(currentLine + i, mapping);
		}

		currentLine += commentLines;
		jsOffset += comment.text.length + 1;
	}

	const leadingCommentLines = currentLine - 1;

	const blockStart = block.position.start.line;

	/**
	 * Adjusts ESLint messages to point to the correct location in the Markdown.
	 * @param {LintMessage} message A message from ESLint.
	 * @returns {LintMessage} The same message, but adjusted to the correct location.
	 */
	return function adjustMessage(message) {
		if (!Number.isInteger(message.line)) {
			return {
				...message,
				line: blockStart,
				column: block.position.start.column,
			};
		}

		const lineInCode = message.line - leadingCommentLines;

		if (lineInCode < 1 || lineInCode >= block.rangeMap.length) {
			return isUnusedDirectiveMessage(message)
				? adjustCommentMessage(message, commentMappings)
				: null;
		}

		/** @type {Pick<LintMessage, "line" | "column" | "endLine" | "endColumn" | "suggestions">} */
		const out = {
			line: lineInCode + blockStart,
			column: message.column + block.rangeMap[lineInCode].indent,
		};

		if (Number.isInteger(message.endLine)) {
			const endLineInCode = message.endLine - leadingCommentLines;

			out.endLine = endLineInCode + blockStart;

			if (
				Number.isInteger(message.endColumn) &&
				endLineInCode < block.rangeMap.length
			) {
				out.endColumn =
					message.endColumn + block.rangeMap[endLineInCode].indent;
			}
		}

		if (Array.isArray(message.suggestions)) {
			out.suggestions = message.suggestions.map(suggestion => ({
				...suggestion,
				fix: adjustFix(block, suggestion.fix),
			}));
		}

		const adjustedFix = {};

		if (message.fix) {
			adjustedFix.fix = adjustFix(block, message.fix);
		}

		return { ...message, ...out, ...adjustedFix };
	};
}

/**
 * Excludes unsatisfiable rules from the list of messages.
 * @param {LintMessage} message A message from the linter.
 * @returns {boolean} True if the message should be included in output.
 */
function excludeUnsatisfiableRules(message) {
	return message && !UNSATISFIABLE_RULES.has(message.ruleId);
}

/**
 * Transforms generated messages for output.
 * @param {Array<LintMessage[]>} messages An array containing one array of messages
 *     for each code block returned from `preprocess`.
 * @param {string} filename The filename of the file
 * @returns {LintMessage[]} A flattened array of messages with mapped locations.
 */
function postprocess(messages, filename) {
	const { text, blocks } = blocksCache.get(filename);

	blocksCache.delete(filename);

	return messages.flatMap((group, i) => {
		const adjust = adjustBlock(blocks[i], text);

		return group.map(adjust).filter(excludeUnsatisfiableRules);
	});
}

export const processor = {
	meta: {
		name: "@eslint/markdown/markdown",
		version: "8.0.3", // x-release-please-version
	},
	preprocess,
	postprocess,
	supportsAutofix: SUPPORTS_AUTOFIX,
};
