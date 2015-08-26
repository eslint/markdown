/**
 * @fileoverview Processes Markdown files for consumption by ESLint.
 * @author Brandon Mills
 * @copyright 2015 Brandon Mills. All rights reserved.
 * @copyright 2015 Ian VanSchooten. All rights reserved.
 */

"use strict";

var assign = require("object-assign");

var blocks = [];
var expectedErrors;

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
        next,
        expErr;

    var EXP_ERR_REGEX = /\/\*\s*error\s+(.+?)\s*\*\//g;

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
        if (match(/^\r?\n/)) { // Newline
            line += 1;
            column = 0;
        } else if ( // Start of a fenced javascript or js code block
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

        // Capture expected errors
        while (
            mode === modes.CODE &&
            (expErr = EXP_ERR_REGEX.exec(text.slice(index).split("\n")[0])) !== null
        ) {
            expectedErrors[line + 1] = expectedErrors[line + 1] || [];
            expectedErrors[line + 1].push(expErr[1]);
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
    expectedErrors = {};
    blocks = parse(text);
    return blocks.map(function(block) {
        return block.text;
    });
}

/**
 * Transforms generated messages for output.
 * @param {Array<Message[]>} messages An array containing one array of messages
 *     for each code block returned from `preprocess`.
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
function postprocess(messages) {

    /**
     * Returns messages which are not in the list of expected errors
     * @param  {Message[]}  msgs A flattened array of messages with mapped locations.
     * @returns {Message[]}      An array of messages without expected messages.
     */
    function getUnexpectedMessages(msgs) {
        return msgs.filter(function (error) {
            if (!expectedErrors[error.line]) {
                return true;
            }
            return (expectedErrors[error.line].indexOf(error.message) === -1);
        });
    }

    function translate(block, message) {
        return assign({}, message, {
            line: message.line + block.loc.start.line,
            column: message.column + block.loc.start.column
        });
    }

    var mappedMessages = [].concat.apply([], messages.map(function(group, index) {
        return group.map(translate.bind(null, blocks[index]));
    }));

    return getUnexpectedMessages(mappedMessages);
}

module.exports = {
    preprocess: preprocess,
    postprocess: postprocess
};
