"use strict";

var assign = require("object-assign");

var blocks = [];

/**
 * Parses Markdown text for fenced code blocks containing JS.
 * @param {string} text Markdown text.
 * @returns {Block[]} List of parsed code blocks.
 */
function parse(text) {
	var modes = {
		NORMAL: "NORMAL",
		CODE: "CODE"
	};

	var result = [],
		index = 0,
		line = 0,
		column = 0,
		mode = modes.NORMAL,
		next;

	/**
	 * Attempts to match a regex and advances if successful.
	 * @param {RegExp} test Regular expression to try to match.
	 * @returns {string[]|boolean} Match result or false if no match.
	 */
	function match(test) {
		var captures = test.exec(text.slice(index));

		if (captures) {
			index += captures[0].length;
		}

		return captures || false;
	}

	/**
	 * Starts a new block and pushes it onto the result list.
	 * @param {string} indent The indent used for this block.
	 * @returns {void}
	 */
	function startBlock(indent) {
		result.push({
			range: [index],
			loc: {
				start: {
					line: line,
					column: indent.length
				}
			},
			indent: indent
		});

		mode = modes.CODE;
	}

	/**
	 * Finishes the most recent block.
	 * @param {number} backtrack How far behind `index` the block ends.
	 * @returns {void}
	 */
	function finishBlock(backtrack) {
		var block = result[result.length - 1];

		block.range[1] = index - backtrack;
		block.loc.end = {
			line: line,
			column: column || block.indent.length
		};
		block.text = text
			.slice(block.range[0], block.range[1])
			.replace(new RegExp("^" + block.indent, "gm"), "");

		mode = modes.NORMAL;
	}

	while (index < text.length) {
		if (match(/^\r?\n/)) {
			line += 1;
			column = 0;
		} else if (
			mode === modes.NORMAL &&
			(next = match(/^((?: {4}|\t)*)```j(?:s|avascript)\r?\n/i))
		) {
			line += 1;
			column = 0;

			startBlock(next[1]);
		} else if ( // Closing fence at end of file
			mode === modes.CODE &&
			(next = match(new RegExp(
				"^" + result[result.length - 1].indent + "(```)$"
			)))
		) {
			finishBlock(next[1].length);
		} else if ( // Closing fence before newline
			mode === modes.CODE &&
			(next = match(new RegExp(
				"^" + result[result.length - 1].indent + "(```\r?\n)"
			)))
		) {
			finishBlock(next[1].length);

			line += 1;
			column = 0;
		} else {
			next = match(/[^\r\n]*/);
			column += next[0].length;
		}
	}

	// Finish an unclosed code fence
	if (mode === modes.CODE) {
		finishBlock(0);
	}

	return result;
}

/**
 * Extracts code fences from Markdown text.
 * @param {string} text The text of the file.
 * @returns {[string]} Code blocks to lint.
 */
function preprocess(text) {
	blocks = parse(text);
	return blocks.map(function(block) {
		return block.text;
	});
}

/**
 * Transforms generated messages for output.
 * @param {Message[][]} messages An array containing one array of messages for
 *     each code block returned from `preprocess`.
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
function postprocess(messages) {
	function translate(block, message) {
		return assign({}, message, {
			line: message.line + block.loc.start.line,
			column: message.column + block.loc.start.column
		});
	}

	return [].concat.apply([], messages.map(function(group, index) {
		return group.map(translate.bind(null, blocks[index]));
	}));
}

module.exports = {
	preprocess: preprocess,
	postprocess: postprocess
};
