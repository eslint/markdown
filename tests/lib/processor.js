/**
 * @fileoverview Tests for the Markdown processor.
 * @author Brandon Mills
 */

"use strict";

var assert = require("chai").assert,
    processor = require("../../lib/processor");

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

        it("should ignore 4-space-indented code fences", function() {
            var code = [
                "Hello, world!",
                "    ```js",
                "    var answer = 6 * 7;",
                "    ```",
                "Goodbye"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 0);
        });

        it("should ignore 4-space-indented fence ends", function() {
            var code = [
                "Hello, world!",
                "```js",
                "var answer = 6 * 7;",
                "    ```",
                "Goodbye"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], "var answer = 6 * 7;\n    ```\nGoodbye\n");
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

        it("should terminate blocks at EOF", function() {
            var code = [
                "Hello, world!",
                "```js",
                "var answer = 6 * 7;"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], "var answer = 6 * 7;\n");
        });

        it("should allow backticks or tildes", function() {
            var code = [
                "```js",
                "backticks",
                "```",
                "~~~javascript",
                "tildes",
                "~~~"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 2);
            assert.equal(blocks[0], "backticks\n");
            assert.equal(blocks[1], "tildes\n");
        });

        it("should allow more than three fence characters", function() {
            var code = [
                "````js",
                "four",
                "````"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], "four\n");
        });

        it("should require end fences at least as long as the starting fence", function() {
            var code = [
                "````js",
                "four",
                "```",
                "````",
                "`````js",
                "five",
                "`````",
                "``````js",
                "six",
                "```````"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 3);
            assert.equal(blocks[0], "four\n```\n");
            assert.equal(blocks[1], "five\n");
            assert.equal(blocks[2], "six\n");
        });

        it("should not allow other content on ending fence line", function() {
            var code = [
                "```js",
                "test();",
                "``` end",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], "test();\n``` end\n");
        });

        it("should allow empty blocks", function() {
            var code = [
                "```js",
                "",
                "````"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], "\n");
        });

        it("should allow whitespace-only blocks", function() {
            var code = [
                "  ```js",
                "",
                " ",
                "  ",
                "   ",
                "    ",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], "\n\n \n  \n");
        });

        it("should ignore code fences with unspecified info string", function() {
            var code = [
                "```",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 0);
        });

        it("should find code fences with js info string", function() {
            var code = [
                "```js",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences with javascript info string", function() {
            var code = [
                "```javascript",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences with node info string", function() {
            var code = [
                "```node",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences with jsx info string", function() {
            var code = [
                "```jsx",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences ignoring info string case", function() {
            var code = [
                "```JavaScript",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should ignore anything after the first word of the info string", function() {
            var code = [
                "```js more words are ignored",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
        });

        it("should find code fences not surrounded by blank lines", function() {
            var code = [
                "<!-- eslint-disable -->",
                "```js",
                "var answer = 6 * 7;",
                "```",
                "Paragraph text",
                "```js",
                "var answer = 6 * 7;",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 2);
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

            assert.equal(blocks[0], "var answer = 6 * 7;\nconsole.log(answer);\n");
        });

        it("should unindent space-indented code fences", function() {
            var code = [
                "  ```js",
                "  var answer = 6 * 7;",
                "    console.log(answer);",
                " // Fin.",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks[0], "var answer = 6 * 7;\n  console.log(answer);\n// Fin.\n");
        });

        it("should find multiple code fences", function() {
            var code = [
                "Hello, world!",
                "",
                "```js",
                "var answer = 6 * 7;",
                "```",
                "",
                "```javascript",
                "console.log(answer);",
                "```",
                "",
                "Goodbye"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 2);
            assert.equal(blocks[0], "var answer = 6 * 7;\n");
            assert.equal(blocks[1], "console.log(answer);\n");
        });

        it("should insert leading configuration comments", function() {
            var code = [
                "<!-- eslint-env browser -->",
                "<!--",
                "    eslint quotes: [",
                "        \"error\",",
                "        \"single\"",
                "    ]",
                "-->",
                "",
                "```js",
                "alert('Hello, world!');",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], [
                "/* eslint-env browser */",
                "/*",
                "    eslint quotes: [",
                "        \"error\",",
                "        \"single\"",
                "    ]",
                "*/",
                "alert('Hello, world!');",
                ""
            ].join("\n"));
        });

        it("should insert global comments", function() {
            var code = [
                "<!-- global foo -->",
                "<!-- global bar:false, baz:true -->",
                "",
                "```js",
                "alert(foo, bar, baz);",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], [
                "/* global foo */",
                "/* global bar:false, baz:true */",
                "alert(foo, bar, baz);",
                ""
            ].join("\n"));
        });

        it("should ignore non-eslint comments", function() {
            var code = [
                "<!-- eslint-env browser -->",
                "<!-- not an eslint comment -->",
                "",
                "```js",
                "alert('Hello, world!');",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], [
                "alert('Hello, world!');",
                ""
            ].join("\n"));
        });

        it("should ignore non-comment html", function() {
            var code = [
                "<!-- eslint-env browser -->",
                "<p>For example:</p>",
                "",
                "```js",
                "alert('Hello, world!');",
                "```"
            ].join("\n");
            var blocks = processor.preprocess(code);

            assert.equal(blocks.length, 1);
            assert.equal(blocks[0], [
                "alert('Hello, world!');",
                ""
            ].join("\n"));
        });

        describe("eslint-skip", function() {

            it("should skip the next block", function() {
                var code = [
                    "<!-- eslint-skip -->",
                    "",
                    "```js",
                    "alert('Hello, world!');",
                    "```"
                ].join("\n");
                var blocks = processor.preprocess(code);

                assert.equal(blocks.length, 0);
            });

            it("should skip only one block", function() {
                var code = [
                    "<!-- eslint-skip -->",
                    "",
                    "```js",
                    "alert('Hello, world!');",
                    "```",
                    "",
                    "```js",
                    "var answer = 6 * 7;",
                    "```"
                ].join("\n");
                var blocks = processor.preprocess(code);

                assert.equal(blocks.length, 1);
                assert.equal(blocks[0], "var answer = 6 * 7;\n");
            });

            it("should still work surrounded by other comments", function() {
                var code = [
                    "<!-- eslint-disable no-console -->",
                    "<!-- eslint-skip -->",
                    "<!-- eslint-disable quotes -->",
                    "",
                    "```js",
                    "alert('Hello, world!');",
                    "```",
                    "",
                    "```js",
                    "var answer = 6 * 7;",
                    "```"
                ].join("\n");
                var blocks = processor.preprocess(code);

                assert.equal(blocks.length, 1);
                assert.equal(blocks[0], "var answer = 6 * 7;\n");
            });

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
            "   ```JavaScript",
            "   var arr = [",
            "       1,",
            "       2",
            "   ];",
            "   ```",
            "",
            "1. Second item",
            "",
            "  ```JS",
            "  function boolean(arg) {",
            "  \treturn",
            "  \t!!arg;",
            "};",
            "  ```"
        ].join("\n");
        var messages = [
            [
                { line: 1, endLine: 1, column: 1, message: "Use the global form of \"use strict\".", ruleId: "strict" },
                { line: 3, endLine: 3, column: 5, message: "Unexpected console statement.", ruleId: "no-console" }
            ], [
                { line: 3, endLine: 3, column: 6, message: "Missing trailing comma.", ruleId: "comma-dangle", fix: { range: [24, 24], text: "," } }
            ], [
                { line: 3, endLine: 6, column: 2, message: "Unreachable code after return.", ruleId: "no-unreachable" },
                { line: 4, endLine: 4, column: 2, message: "Unnecessary semicolon.", ruleId: "no-extra-semi", fix: { range: [38, 39], text: "" } }
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

        it("should translate endLine numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[0].endLine, 4);
            assert.equal(result[1].endLine, 6);
            assert.equal(result[2].endLine, 17);
            assert.equal(result[3].endLine, 29);
            assert.equal(result[4].endLine, 27);
        });

        it("should translate column numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[0].column, 1);
            assert.equal(result[1].column, 5);
        });

        it("should translate indented column numbers", function() {
            var result = processor.postprocess(messages);

            assert.equal(result[2].column, 9);
            assert.equal(result[3].column, 2);
            assert.equal(result[4].column, 2);
        });

        it("should adjust fix range properties", function() {
            var result = processor.postprocess(messages);

            assert(result[2].fix.range, [185, 185]);
            assert(result[4].fix.range, [264, 265]);
        });

        describe("should exclude messages from unsatisfiable rules", function() {

            it("eol-last", function() {
                var result = processor.postprocess([
                    [
                        { line: 4, column: 3, message: "Newline required at end of file but not found.", ruleId: "eol-last" }
                    ]
                ]);

                assert.equal(result.length, 0);
            });

            it("unicode-bom", function() {
                var result = processor.postprocess([
                    [
                        { line: 1, column: 1, message: "Expected Unicode BOM (Byte Order Mark).", ruleId: "unicode-bom" }
                    ]
                ]);

                assert.equal(result.length, 0);
            });

        });

    });

    describe("supportsAutofix", function() {
        it("should equal true", function() {
            assert.equal(processor.supportsAutofix, true);
        });
    });

});
