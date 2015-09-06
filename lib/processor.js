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
     * Tries to match an opening code fence on the current line.
     * @returns {object|boolean} Fence data or false if no match.
     */
    function matchOpeningCodeFence() {
        var captures;

        // Exit early if an opening fence is not expected.
        if (mode !== modes.NORMAL) {
            return false;
        }

        captures = match(/^( {0,3})(`{3,}|~{3,})\h*(?:js|javascript|node)\h*\r?\n/i);
        if (captures) {
            return {
                indent: captures[1],
                fence: captures[2]
            };
        }

        return false;
    }

    /**
     * Tries to match a closing code fence on the current line.
     * @returns {string[]|boolean} Match result or false if no match.
     */
    function matchClosingCodeFence() {
        var block, regexp;

        // Exit early if a closing fence is not expected.
        if (mode !== modes.CODE) {
            return false;
        }

        block = result[result.length - 1];
        regexp = [
            "^ {0,3}",
            block.fence[0],
            "{",
            block.fence.length,
            ",}\\h*(?:\\r?\\n|$)"
        ].join("");
        return match(new RegExp(regexp));
    }

    /**
     * Starts a new block and pushes it onto the result list.
     * @param {string} indent The indent used for this block.
     * @param {string} fence The backticks or tildes used to start the block.
     * @returns {void}
     */
    function startBlock(indent, fence) {
        result.push({
            range: [index],
            loc: {
                start: {
                    line: line,
                    column: indent.length
                }
            },
            indent: indent,
            fence: fence
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
        block.rawText = text.slice(block.range[0], block.range[1]);

        if (block.indent.length > 0) {
            block.text = block.rawText.replace(new RegExp("^ {1," + block.indent.length + "}", "gm"), "");
        } else {
            block.text = block.rawText;
        }

        mode = modes.NORMAL;
    }

    while (index < text.length) {

        // Newline
        if (match(/^\r?\n/)) {
            line += 1;
            column = 0;

        // Opening code fence
        } else if ((next = matchOpeningCodeFence())) {
            line += 1;
            column = 0;

            startBlock(next.indent, next.fence);

        // Closing code fence
        } else if ((next = matchClosingCodeFence())) {
            finishBlock(next[0].length);

            line += 1;
            column = 0;

        // Line content
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
     * @param {Message[]} msgs A flattened array of messages with mapped locations.
     * @returns {Message[]} An array of messages without expected messages.
     */
    function getUnexpectedMessages(msgs) {
        return msgs.filter(function(error) {
            if (!expectedErrors[error.line]) {
                return true;
            }
            return (expectedErrors[error.line].indexOf(error.message) === -1);
        });
    }

    /**
     * Translate a block's error messages to the correct locations in the
     * original Markdown source.
     * @param {object} block The fenced code block being tracked.
     * @param {Message} message The error message reported by ESLint.
     * @returns {Message} A copy of the message with translated location info.
     */
    function translate(block, message) {
        var line = block.rawText.split("\n")[message.line - 1],
            indent = new RegExp("^ {0," + block.indent.length + "}").exec(line);

        return assign({}, message, {
            line: message.line + block.loc.start.line,
            column: message.column + indent[0].length
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
