"use strict";

/**
 * Extracts code fences from Markdown text.
 * @param {string} text The text of the file.
 * @param {string} filename The name of the file.
 * @returns {[string]} Code blocks to lint.
 */
function preprocess(text, filename) {

	return [];
}

/**
 * Transforms generated messages for output.
 * @param {Message[][]} messages An array containing one array of messages for
 *     each code block returned from `preprocess`.
 * @param {string} filename The name of the file.
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
function postprocess(messages, filename) {
	return [];
}

module.exports = {
	preprocess: preprocess,
	postprocess: postprocess
};
