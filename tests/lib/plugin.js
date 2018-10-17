/**
 * @fileoverview Tests for the preprocessor plugin.
 * @author Brandon Mills
 */

"use strict";

var assert = require("chai").assert,
    CLIEngine = require("eslint").CLIEngine,
    path = require("path"),
    plugin = require("../..");

/**
 * Helper function which creates CLIEngine instance with enabled/disabled autofix feature.
 * @param {boolean} [isAutofixEnabled=false] Whether to enable autofix feature.
 * @returns {CLIEngine} CLIEngine instance to execute in tests.
 */
function initCLI(isAutofixEnabled) {
    var fix = isAutofixEnabled || false;
    var cli = new CLIEngine({
        envs: ["browser"],
        extensions: ["md", "mkdn", "mdown", "markdown"],
        fix: fix,
        ignore: false,
        rules: {
            "eol-last": 2,
            "no-console": 2,
            "no-undef": 2,
            "quotes": 2,
            "spaced-comment": 2
        },
        useEslintrc: false
    });
    cli.addPlugin("markdown", plugin);
    return cli;
}

describe("plugin", function() {

    var cli;
    var shortText = [
        "```js",
        "console.log(42);",
        "```"
    ].join("\n");

    before(function() {
        cli = initCLI();
    });

    it("should run on .md files", function() {
        var report = cli.executeOnText(shortText, "test.md");

        assert.equal(report.results.length, 1);
        assert.equal(report.results[0].messages.length, 1);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 2);
    });

    it("should emit correct line numbers", function() {
        var code = [
            "# Hello, world!",
            "",
            "",
            "```js",
            "var bar = baz",
            "",
            "",
            "var foo = blah",
            "```"
        ].join("\n");
        var report = cli.executeOnText(code, "test.md");
        assert.equal(report.results[0].messages[0].message, "'baz' is not defined.");
        assert.equal(report.results[0].messages[0].line, 5);
        assert.equal(report.results[0].messages[0].endLine, 5);
        assert.equal(report.results[0].messages[1].message, "'blah' is not defined.");
        assert.equal(report.results[0].messages[1].line, 8);
        assert.equal(report.results[0].messages[1].endLine, 8);
    });

    it("should emit correct line numbers with leading comments", function() {
        var code = [
            "# Hello, world!",
            "",
            "<!-- eslint-disable quotes -->",
            "<!-- eslint-disable semi -->",
            "",
            "```js",
            "var bar = baz",
            "",
            "var str = 'single quotes'",
            "",
            "var foo = blah",
            "```"
        ].join("\n");
        var report = cli.executeOnText(code, "test.md");
        assert.equal(report.results[0].messages[0].message, "'baz' is not defined.");
        assert.equal(report.results[0].messages[0].line, 7);
        assert.equal(report.results[0].messages[0].endLine, 7);
        assert.equal(report.results[0].messages[1].message, "'blah' is not defined.");
        assert.equal(report.results[0].messages[1].line, 11);
        assert.equal(report.results[0].messages[1].endLine, 11);
    });

    it("should run on .mkdn files", function() {
        var report = cli.executeOnText(shortText, "test.mkdn");

        assert.equal(report.results.length, 1);
        assert.equal(report.results[0].messages.length, 1);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 2);
    });

    it("should run on .mdown files", function() {
        var report = cli.executeOnText(shortText, "test.mdown");

        assert.equal(report.results.length, 1);
        assert.equal(report.results[0].messages.length, 1);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 2);
    });

    it("should run on .markdown files", function() {
        var report = cli.executeOnText(shortText, "test.markdown");

        assert.equal(report.results.length, 1);
        assert.equal(report.results[0].messages.length, 1);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 2);
    });

    it("should extract blocks and remap messages", function() {
        var report = cli.executeOnFiles([path.resolve(__dirname, "../fixtures/long.md")]);

        assert.equal(report.results.length, 1);
        assert.equal(report.results[0].messages.length, 5);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 10);
        assert.equal(report.results[0].messages[0].column, 1);
        assert.equal(report.results[0].messages[1].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[1].line, 16);
        assert.equal(report.results[0].messages[1].column, 5);
        assert.equal(report.results[0].messages[2].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[2].line, 24);
        assert.equal(report.results[0].messages[2].column, 1);
        assert.equal(report.results[0].messages[3].message, "Strings must use singlequote.");
        assert.equal(report.results[0].messages[3].line, 38);
        assert.equal(report.results[0].messages[3].column, 13);
        assert.equal(report.results[0].messages[4].message, "Parsing error: Unexpected character '@'");
        assert.equal(report.results[0].messages[4].line, 46);
        assert.equal(report.results[0].messages[4].column, 2);
    });

    describe("configuration comments", function() {

        it("apply only to the code block immediately following", function() {
            var code = [
                "<!-- eslint \"quotes\": [\"error\", \"single\"] -->",
                "<!-- eslint-disable no-console -->",
                "",
                "```js",
                "var single = 'single';",
                "console.log(single);",
                "var double = \"double\";",
                "console.log(double);",
                "```",
                "",
                "```js",
                "var single = 'single';",
                "console.log(single);",
                "var double = \"double\";",
                "console.log(double);",
                "```"
            ].join("\n");
            var report = cli.executeOnText(code, "test.md");

            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 4);
            assert.equal(report.results[0].messages[0].message, "Strings must use singlequote.");
            assert.equal(report.results[0].messages[0].line, 7);
            assert.equal(report.results[0].messages[1].message, "Strings must use doublequote.");
            assert.equal(report.results[0].messages[1].line, 12);
            assert.equal(report.results[0].messages[2].message, "Unexpected console statement.");
            assert.equal(report.results[0].messages[2].line, 13);
            assert.equal(report.results[0].messages[3].message, "Unexpected console statement.");
            assert.equal(report.results[0].messages[3].line, 15);
        });

    });

    describe("should fix code", function() {

        before(function() {
            cli = initCLI(true);
        });

        it("in the simplest case", function() {
            var input = [
                "This is Markdown.",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("across multiple lines", function() {
            var input = [
                "This is Markdown.",
                "",
                "```js",
                "console.log('Hello, world!')",
                "console.log('Hello, world!')",
                "```",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "console.log(\"Hello, world!\")",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("across multiple blocks", function() {
            var input = [
                "This is Markdown.",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "```",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("with lines indented by spaces", function() {
            var input = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "    console.log('Hello, world!')",
                "}",
                "```",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "    console.log(\"Hello, world!\")",
                "}",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("with lines indented by tabs", function() {
            var input = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "\tconsole.log('Hello, world!')",
                "}",
                "```",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "\tconsole.log(\"Hello, world!\")",
                "}",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("in blocks with uncommon tags", function() {
            var input = [
                "This is Markdown.",
                "",
                "```JavaScript",
                "console.log('Hello, world!')",
                "```",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "```JavaScript",
                "console.log(\"Hello, world!\")",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("in blocks with extra backticks", function() {
            var input = [
                "This is Markdown.",
                "",
                "````js",
                "console.log('Hello, world!')",
                "````",
            ].join("\n");
            var expected = [
                "This is Markdown.",
                "",
                "````js",
                "console.log(\"Hello, world!\")",
                "````",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("with configuration comments", function() {
            var input = [
                "<!-- eslint semi: 2 -->",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```",
            ].join("\n");
            var expected = [
                "<!-- eslint semi: 2 -->",
                "",
                "```js",
                "console.log(\"Hello, world!\");",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("inside a list single line", function() {
            var input = [
                "- Inside a list",
                "",
                "  ```js",
                "  console.log('Hello, world!')",
                "  ```",
            ].join("\n");
            var expected = [
                "- Inside a list",
                "",
                "  ```js",
                "  console.log(\"Hello, world!\")",
                "  ```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        it("inside a list multi line", function() {
            var input = [
                "- Inside a list",
                "",
                "   ```js",
                "   console.log('Hello, world!')",
                "   console.log('Hello, world!')",
                "   ",
                "   var obj = {",
                "     hello: 'value'",
                "   }",
                "   ```",
            ].join("\n");
            var expected = [
                "- Inside a list",
                "",
                "   ```js",
                "   console.log(\"Hello, world!\")",
                "   console.log(\"Hello, world!\")",
                "   ",
                "   var obj = {",
                "     hello: \"value\"",
                "   }",
                "   ```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

        // https://spec.commonmark.org/0.28/#fenced-code-blocks
        describe("when indented", function() {
            it("by one space", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log('Hello, world!')",
                    " console.log('Hello, world!')",
                    " ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log(\"Hello, world!\")",
                    " console.log(\"Hello, world!\")",
                    " ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            it("by two spaces", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    "  ```js",
                    "  console.log('Hello, world!')",
                    "  console.log('Hello, world!')",
                    "  ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    "  ```js",
                    "  console.log(\"Hello, world!\")",
                    "  console.log(\"Hello, world!\")",
                    "  ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            it("by three spaces", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    "   console.log('Hello, world!')",
                    "   console.log('Hello, world!')",
                    "   ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    "   console.log(\"Hello, world!\")",
                    "   console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            it("and the closing fence is differently indented", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log('Hello, world!')",
                    " console.log('Hello, world!')",
                    "   ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log(\"Hello, world!\")",
                    " console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            it("underindented", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    " console.log('Hello, world!')",
                    "  console.log('Hello, world!')",
                    "     console.log('Hello, world!')",
                    "   ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    " console.log(\"Hello, world!\")",
                    "  console.log(\"Hello, world!\")",
                    "     console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            it("by one space with comments", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    "<!-- eslint semi: 2 -->",
                    "<!-- global foo: true -->",
                    "",
                    " ```js",
                    " console.log('Hello, world!')",
                    " console.log('Hello, world!')",
                    " ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    "<!-- eslint semi: 2 -->",
                    "<!-- global foo: true -->",
                    "",
                    " ```js",
                    " console.log(\"Hello, world!\");",
                    " console.log(\"Hello, world!\");",
                    " ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            it("unevenly by two spaces with comments", function() {
                var input = [
                    "This is Markdown.",
                    "",
                    "<!-- eslint semi: 2 -->",
                    "<!-- global foo: true -->",
                    "",
                    "  ```js",
                    " console.log('Hello, world!')",
                    "  console.log('Hello, world!')",
                    "   console.log('Hello, world!')",
                    "  ```"
                ].join("\n");
                var expected = [
                    "This is Markdown.",
                    "",
                    "<!-- eslint semi: 2 -->",
                    "<!-- global foo: true -->",
                    "",
                    "  ```js",
                    " console.log(\"Hello, world!\");",
                    "  console.log(\"Hello, world!\");",
                    "   console.log(\"Hello, world!\");",
                    "  ```"
                ].join("\n");
                var report = cli.executeOnText(input, "test.md");
                var actual = report.results[0].output;

                assert.equal(actual, expected);
            });

            describe("inside a list", function() {
                it("normally", function() {
                    var input = [
                        "- This is a Markdown list.",
                        "",
                        "  ```js",
                        "  console.log('Hello, world!')",
                        "  console.log('Hello, world!')",
                        "  ```"
                    ].join("\n");
                    var expected = [
                        "- This is a Markdown list.",
                        "",
                        "  ```js",
                        "  console.log(\"Hello, world!\")",
                        "  console.log(\"Hello, world!\")",
                        "  ```"
                    ].join("\n");
                    var report = cli.executeOnText(input, "test.md");
                    var actual = report.results[0].output;

                    assert.equal(actual, expected);
                });

                it("by one space", function() {
                    var input = [
                        "- This is a Markdown list.",
                        "",
                        "   ```js",
                        "   console.log('Hello, world!')",
                        "   console.log('Hello, world!')",
                        "   ```"
                    ].join("\n");
                    var expected = [
                        "- This is a Markdown list.",
                        "",
                        "   ```js",
                        "   console.log(\"Hello, world!\")",
                        "   console.log(\"Hello, world!\")",
                        "   ```"
                    ].join("\n");
                    var report = cli.executeOnText(input, "test.md");
                    var actual = report.results[0].output;

                    assert.equal(actual, expected);
                });
            });
        });

        it("with multiple rules", function() {
            var input = [
                "## Hello!",
                "",
                "<!-- eslint semi: 2 -->",
                "",
                "```js",
                "var obj = {",
                "  some: 'value'",
                "}",
                "",
                "console.log('opop');",
                "",
                "function hello() {",
                "  return false",
                "};",
                "```",
            ].join("\n");
            var expected = [
                "## Hello!",
                "",
                "<!-- eslint semi: 2 -->",
                "",
                "```js",
                "var obj = {",
                "  some: \"value\"",
                "};",
                "",
                "console.log(\"opop\");",
                "",
                "function hello() {",
                "  return false;",
                "};",
                "```",
            ].join("\n");
            var report = cli.executeOnText(input, "test.md");
            var actual = report.results[0].output;

            assert.equal(actual, expected);
        });

    });

});
