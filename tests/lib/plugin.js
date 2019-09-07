/**
 * @fileoverview Tests for the preprocessor plugin.
 * @author Brandon Mills
 */

"use strict";

const assert = require("chai").assert;
const CLIEngine = require("eslint").CLIEngine;
const path = require("path");
const plugin = require("../..");

/**
 * Helper function which creates CLIEngine instance with enabled/disabled autofix feature.
 * @param {boolean} [isAutofixEnabled=false] Whether to enable autofix feature.
 * @returns {CLIEngine} CLIEngine instance to execute in tests.
 */
function initCLI(isAutofixEnabled) {
    const fix = isAutofixEnabled || false;
    const cli = new CLIEngine({
        envs: ["browser"],
        extensions: ["md", "mkdn", "mdown", "markdown"],
        fix,
        ignore: false,
        rules: {
            "eol-last": 2,
            "no-console": 2,
            "no-undef": 2,
            quotes: 2,
            "spaced-comment": 2
        },
        useEslintrc: false
    });

    cli.addPlugin("markdown", plugin);
    return cli;
}

describe("plugin", () => {

    let cli;
    const shortText = [
        "```js",
        "console.log(42);",
        "```"
    ].join("\n");

    before(() => {
        cli = initCLI();
    });

    it("should run on .md files", () => {
        const report = cli.executeOnText(shortText, "test.md");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 1);
        assert.strictEqual(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[0].line, 2);
    });

    it("should emit correct line numbers", () => {
        const code = [
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
        const report = cli.executeOnText(code, "test.md");

        assert.strictEqual(report.results[0].messages[0].message, "'baz' is not defined.");
        assert.strictEqual(report.results[0].messages[0].line, 5);
        assert.strictEqual(report.results[0].messages[0].endLine, 5);
        assert.strictEqual(report.results[0].messages[1].message, "'blah' is not defined.");
        assert.strictEqual(report.results[0].messages[1].line, 8);
        assert.strictEqual(report.results[0].messages[1].endLine, 8);
    });

    it("should emit correct line numbers with leading comments", () => {
        const code = [
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
        const report = cli.executeOnText(code, "test.md");

        assert.strictEqual(report.results[0].messages[0].message, "'baz' is not defined.");
        assert.strictEqual(report.results[0].messages[0].line, 7);
        assert.strictEqual(report.results[0].messages[0].endLine, 7);
        assert.strictEqual(report.results[0].messages[1].message, "'blah' is not defined.");
        assert.strictEqual(report.results[0].messages[1].line, 11);
        assert.strictEqual(report.results[0].messages[1].endLine, 11);
    });

    it("should run on .mkdn files", () => {
        const report = cli.executeOnText(shortText, "test.mkdn");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 1);
        assert.strictEqual(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[0].line, 2);
    });

    it("should run on .mdown files", () => {
        const report = cli.executeOnText(shortText, "test.mdown");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 1);
        assert.strictEqual(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[0].line, 2);
    });

    it("should run on .markdown files", () => {
        const report = cli.executeOnText(shortText, "test.markdown");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 1);
        assert.strictEqual(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[0].line, 2);
    });

    it("should extract blocks and remap messages", () => {
        const report = cli.executeOnFiles([path.resolve(__dirname, "../fixtures/long.md")]);

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 5);
        assert.strictEqual(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[0].line, 10);
        assert.strictEqual(report.results[0].messages[0].column, 1);
        assert.strictEqual(report.results[0].messages[1].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[1].line, 16);
        assert.strictEqual(report.results[0].messages[1].column, 5);
        assert.strictEqual(report.results[0].messages[2].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[2].line, 24);
        assert.strictEqual(report.results[0].messages[2].column, 1);
        assert.strictEqual(report.results[0].messages[3].message, "Strings must use singlequote.");
        assert.strictEqual(report.results[0].messages[3].line, 38);
        assert.strictEqual(report.results[0].messages[3].column, 13);
        assert.strictEqual(report.results[0].messages[4].message, "Parsing error: Unexpected character '@'");
        assert.strictEqual(report.results[0].messages[4].line, 46);
        assert.strictEqual(report.results[0].messages[4].column, 2);
    });

    describe("configuration comments", () => {

        it("apply only to the code block immediately following", () => {
            const code = [
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
            const report = cli.executeOnText(code, "test.md");

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 4);
            assert.strictEqual(report.results[0].messages[0].message, "Strings must use singlequote.");
            assert.strictEqual(report.results[0].messages[0].line, 7);
            assert.strictEqual(report.results[0].messages[1].message, "Strings must use doublequote.");
            assert.strictEqual(report.results[0].messages[1].line, 12);
            assert.strictEqual(report.results[0].messages[2].message, "Unexpected console statement.");
            assert.strictEqual(report.results[0].messages[2].line, 13);
            assert.strictEqual(report.results[0].messages[3].message, "Unexpected console statement.");
            assert.strictEqual(report.results[0].messages[3].line, 15);
        });

    });

    describe("should fix code", () => {

        before(() => {
            cli = initCLI(true);
        });

        it("in the simplest case", () => {
            const input = [
                "This is Markdown.",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("across multiple lines", () => {
            const input = [
                "This is Markdown.",
                "",
                "```js",
                "console.log('Hello, world!')",
                "console.log('Hello, world!')",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "console.log(\"Hello, world!\")",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("across multiple blocks", () => {
            const input = [
                "This is Markdown.",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "```",
                "",
                "```js",
                "console.log(\"Hello, world!\")",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("with lines indented by spaces", () => {
            const input = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "    console.log('Hello, world!')",
                "}",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "    console.log(\"Hello, world!\")",
                "}",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("with lines indented by tabs", () => {
            const input = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "\tconsole.log('Hello, world!')",
                "}",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```js",
                "function test() {",
                "\tconsole.log(\"Hello, world!\")",
                "}",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("at the very start of a block", () => {
            const input = [
                "This is Markdown.",
                "",
                "```js",
                "'use strict'",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```js",
                "\"use strict\"",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("in blocks with uncommon tags", () => {
            const input = [
                "This is Markdown.",
                "",
                "```JavaScript",
                "console.log('Hello, world!')",
                "```"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "```JavaScript",
                "console.log(\"Hello, world!\")",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("in blocks with extra backticks", () => {
            const input = [
                "This is Markdown.",
                "",
                "````js",
                "console.log('Hello, world!')",
                "````"
            ].join("\n");
            const expected = [
                "This is Markdown.",
                "",
                "````js",
                "console.log(\"Hello, world!\")",
                "````"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("with configuration comments", () => {
            const input = [
                "<!-- eslint semi: 2 -->",
                "",
                "```js",
                "console.log('Hello, world!')",
                "```"
            ].join("\n");
            const expected = [
                "<!-- eslint semi: 2 -->",
                "",
                "```js",
                "console.log(\"Hello, world!\");",
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("inside a list single line", () => {
            const input = [
                "- Inside a list",
                "",
                "  ```js",
                "  console.log('Hello, world!')",
                "  ```"
            ].join("\n");
            const expected = [
                "- Inside a list",
                "",
                "  ```js",
                "  console.log(\"Hello, world!\")",
                "  ```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        it("inside a list multi line", () => {
            const input = [
                "- Inside a list",
                "",
                "   ```js",
                "   console.log('Hello, world!')",
                "   console.log('Hello, world!')",
                "   ",
                "   var obj = {",
                "     hello: 'value'",
                "   }",
                "   ```"
            ].join("\n");
            const expected = [
                "- Inside a list",
                "",
                "   ```js",
                "   console.log(\"Hello, world!\")",
                "   console.log(\"Hello, world!\")",
                "   ",
                "   var obj = {",
                "     hello: \"value\"",
                "   }",
                "   ```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

        // https://spec.commonmark.org/0.28/#fenced-code-blocks
        describe("when indented", () => {
            it("by one space", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log('Hello, world!')",
                    " console.log('Hello, world!')",
                    " ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log(\"Hello, world!\")",
                    " console.log(\"Hello, world!\")",
                    " ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("by two spaces", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    "  ```js",
                    "  console.log('Hello, world!')",
                    "  console.log('Hello, world!')",
                    "  ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    "  ```js",
                    "  console.log(\"Hello, world!\")",
                    "  console.log(\"Hello, world!\")",
                    "  ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("by three spaces", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    "   console.log('Hello, world!')",
                    "   console.log('Hello, world!')",
                    "   ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    "   console.log(\"Hello, world!\")",
                    "   console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("and the closing fence is differently indented", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log('Hello, world!')",
                    " console.log('Hello, world!')",
                    "   ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    " ```js",
                    " console.log(\"Hello, world!\")",
                    " console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("underindented", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    " console.log('Hello, world!')",
                    "  console.log('Hello, world!')",
                    "     console.log('Hello, world!')",
                    "   ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    " console.log(\"Hello, world!\")",
                    "  console.log(\"Hello, world!\")",
                    "     console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("by one space with comments", () => {
                const input = [
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
                const expected = [
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
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("unevenly by two spaces with comments", () => {
                const input = [
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
                const expected = [
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
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            describe("inside a list", () => {
                it("normally", () => {
                    const input = [
                        "- This is a Markdown list.",
                        "",
                        "  ```js",
                        "  console.log('Hello, world!')",
                        "  console.log('Hello, world!')",
                        "  ```"
                    ].join("\n");
                    const expected = [
                        "- This is a Markdown list.",
                        "",
                        "  ```js",
                        "  console.log(\"Hello, world!\")",
                        "  console.log(\"Hello, world!\")",
                        "  ```"
                    ].join("\n");
                    const report = cli.executeOnText(input, "test.md");
                    const actual = report.results[0].output;

                    assert.strictEqual(actual, expected);
                });

                it("by one space", () => {
                    const input = [
                        "- This is a Markdown list.",
                        "",
                        "   ```js",
                        "   console.log('Hello, world!')",
                        "   console.log('Hello, world!')",
                        "   ```"
                    ].join("\n");
                    const expected = [
                        "- This is a Markdown list.",
                        "",
                        "   ```js",
                        "   console.log(\"Hello, world!\")",
                        "   console.log(\"Hello, world!\")",
                        "   ```"
                    ].join("\n");
                    const report = cli.executeOnText(input, "test.md");
                    const actual = report.results[0].output;

                    assert.strictEqual(actual, expected);
                });
            });
        });

        it("with multiple rules", () => {
            const input = [
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
                "```"
            ].join("\n");
            const expected = [
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
                "```"
            ].join("\n");
            const report = cli.executeOnText(input, "test.md");
            const actual = report.results[0].output;

            assert.strictEqual(actual, expected);
        });

    });

});
