/**
 * @fileoverview Tests for the Markdown processor.
 * @author Brandon Mills
 * @copyright 2015 Brandon Mills. All rights reserved.
 */

"use strict";

var assert = require("chai").assert,
    processor = require("../lib/processor");

describe("processor", function() {

    describe("preprocess", function() {

        it("should not crash", function() {
            processor.preprocess("Hello, world!");
        });

        it("should not crash on an empty string", function() {
            processor.preprocess("");
        });

        it("should return an array", function() {
            assert.isArray(processor.preprocess("Hello, world!"));
        });

        it("should ignore normal text", function() {
            var blocks = processor.preprocess("Hello, world!");

            assert.equal(blocks.length, 0);
        });

        it("should ignore inline code", function() {
            var blocks = processor.preprocess("Hello, `{{name}}!");

            assert.equal(blocks.length, 0);
        });

        it("should ignore space-indented code blocks", function() {
            var code = [
                "Hello, world!",
                "    ",
                "    var answer = 6 * 7;",
                "    ",
                "Goodbye"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 0);
        });

        it("should ignore tab-indented code blocks", function() {
            var code = [
                "Hello, world!",
                "\t",
                "\tvar answer = 6 * 7;",
                "\t",
                "Goodbye"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 0);
        });

        it("should ignore code fences with ambiguous syntax", function() {
            var code = [
                "```",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 0);
        });

        it("should find code fences with js syntax", function() {
            var code = [
                "```js",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences with javascript syntax", function() {
            var code = [
                "```javascript",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences ignoring syntax case", function() {
            var code = [
                "```JavaScript",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should return the source code in the block", function() {
            var code = [
                "```js",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks[0], "var answer = 6 * 7;\n");
        });

        it("should allow multi-line source code", function() {
            var code = [
                "```js",
                "var answer = 6 * 7;",
                "console.log(answer);",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks[0], "var answer = 6 * 7;\nconsole.log(answer);\n");
        });

        it("should preserve original line endings", function() {
            var code = [
                "```js",
                "var answer = 6 * 7;",
                "console.log(answer);",
                "```"
            ].join("\r\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks[0], "var answer = 6 * 7;\r\nconsole.log(answer);\r\n");
        });

        it("should unindent space-indented code fences", function() {
            var code = [
                "    ```js",
                "    var answer = 6 * 7;",
                "    ```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks[0], "var answer = 6 * 7;\n");
        });

        it("should unindent tab-indented code fences", function() {
            var code = [
                "\t```js",
                "\tvar answer = 6 * 7;",
                "\t```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks[0], "var answer = 6 * 7;\n");
        });

        it("should find multiple code fences", function() {
            var code = [
                "Hello, world!",
                "",
                "```js",
                "var answer = 6 * 7;",
                "```",
                "",
                "    ```javascript",
                "    console.log(answer);",
                "    ```",
                "",
                "Goodbye"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 2);
            assert.equal(blocks[0], "var answer = 6 * 7;\n");
            assert.equal(blocks[1], "console.log(answer);\n");
        });

    });

    describe("postprocess", function() {
        var code = [
            "Hello, world!",
            "",
            "```js",
            "var answer = 6 * 7;",
            "if (answer === 42) {",
            "    console.log(answer);",
            "}",
            "```",
            "",
            "Let's make a list.",
            "",
            "1. First item",
            "",
            "    ```JavaScript",
            "    var arr = [",
            "        1,",
            "        2",
            "    ];",
            "    ```",
            "",
            "1. Second item",
            "",
            "\t```JS",
            "\tfunction boolean(arg) {",
            "\t\treturn",
            "\t\t!!arg;",
            "\t};",
            "\t```"
        ].join("\n");
        var messages = [
            [
                { line: 1, column: 0, message: "Use the global form of \"use strict\"." },
                { line: 3, column: 4, message: "Unexpected console statement." }
            ], [
                { line: 3, column: 5, message: "Missing trailing comma." }
            ], [
                { line: 3, column: 1, message: "Unreachable code after return." },
                { line: 4, column: 1, message: "Unnecessary semicolon." }
            ]
        ];

        beforeEach(function() {
            processor.preprocess(code);
        });

        it("should allow for no messages", function() {
            var result = processor.postprocess([[], [], []]);

            assert.equal(result.length, 0);
        });

        it("should flatten messages", function() {
            var result = processor.postprocess(messages);

            assert.equal(result.length, 5);
            assert.equal(result[0].message, "Use the global form of \"use strict\".");
            assert.equal(result[1].message, "Unexpected console statement.");
            assert.equal(result[2].message, "Missing trailing comma.");
            assert.equal(result[3].message, "Unreachable code after return.");
            assert.equal(result[4].message, "Unnecessary semicolon.");
        });

        it("should translate line numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[0].line, 4);
            assert.equal(result[1].line, 6);
            assert.equal(result[2].line, 17);
            assert.equal(result[3].line, 26);
            assert.equal(result[4].line, 27);
        });

        it("should translate column numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[0].column, 0);
            assert.equal(result[1].column, 4);
        });

        it("should translate space-indented column numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[2].column, 9);
        });

        it("should translate tab-indented column numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[3].column, 2);
            assert.equal(result[3].column, 2);
        });
    });

    describe("expected error messages", function () {
        var code,
            messages;

        it("should prevent a message from being reported", function() {
            code = [
                "Here's some code:",
                "",
                "```js",
                "foo = 2; /*error \"foo\" is not defined.*/",
                "```"
            ].join("\n");
            messages = [
                [
                    { line: 1, column: 0, message: "\"foo\" is not defined." }
                ]
            ];

            processor.preprocess(code);
            var result = processor.postprocess(messages);

            assert.equal(result.length, 0);
        });

        it("should work correctly with leading spaces", function() {
            code = [
                "Here's some code:",
                "",
                "```js",
                "foo = 2; /*  error \"foo\" is not defined.*/",
                "```"
            ].join("\n");
            messages = [
                [
                    { line: 1, column: 0, message: "\"foo\" is not defined." }
                ]
            ];

            processor.preprocess(code);
            var result = processor.postprocess(messages);

            assert.equal(result.length, 0);
        });

        it("should work correctly with trailing spaces", function() {
            code = [
                "Here's some code:",
                "",
                "```js",
                "foo = 2; /*error \"foo\" is not defined.  */",
                "```"
            ].join("\n");
            messages = [
                [
                    { line: 1, column: 0, message: "\"foo\" is not defined." }
                ]
            ];

            processor.preprocess(code);
            var result = processor.postprocess(messages);

            assert.equal(result.length, 0);
        });

        it("should only prevent reports with the same message", function() {
            code = [
                "Here's some code:",
                "",
                "```js",
                "foo = 2; /*error not a real error message  */",
                "```"
            ].join("\n");
            messages = [
                [
                    { line: 1, column: 0, message: "\"foo\" is not defined." }
                ]
            ];

            processor.preprocess(code);
            var result = processor.postprocess(messages);

            assert.equal(result.length, 1);
            assert.equal(result[0].message, "\"foo\" is not defined.");
        });

        it("should only prevent messages on the same line", function() {
            code = [
                "Here's some code:",
                "",
                "```js",
                "foo = 2;",
                "var bar; /*error \"foo\" is not defined.*/",
                "```"
            ].join("\n");
            messages = [
                [
                    { line: 1, column: 0, message: "\"foo\" is not defined." }
                ]
            ];

            processor.preprocess(code);
            var result = processor.postprocess(messages);

            assert.equal(result.length, 1);
            assert.equal(result[0].message, "\"foo\" is not defined.");
        });

        it("should work with more than one on the same line", function() {
            code = [
                "Here's some code:",
                "",
                "```js",
                "foo = 2;; /*error \"foo\" is not defined.*/ /*error Unnecessary semicolon.*/",
                "```"
            ].join("\n");
            messages = [
                [
                    { line: 1, column: 0, message: "\"foo\" is not defined." },
                    { line: 1, column: 0, message: "Unnecessary semicolon." }
                ]
            ];

            processor.preprocess(code);
            var result = processor.postprocess(messages);

            assert.equal(result.length, 0);
        });

    });

});
