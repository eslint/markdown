/**
 * @fileoverview Tests for the preprocessor plugin.
 * @author Brandon Mills
 */

"use strict";

const assert = require("chai").assert;
const execSync = require("child_process").execSync;
const CLIEngine = require("eslint").CLIEngine;
const path = require("path");
const plugin = require("../..");

/**
 * @typedef {import('eslint/lib/cli-engine/cli-engine').CLIEngineOptions} CLIEngineOptions
 */

/**
 * Helper function which creates CLIEngine instance with enabled/disabled autofix feature.
 * @param {string} fixtureConfigName ESLint JSON config fixture filename.
 * @param {CLIEngineOptions} [options={}] Whether to enable autofix feature.
 * @returns {CLIEngine} CLIEngine instance to execute in tests.
 */
function initCLI(fixtureConfigName, options = {}) {
    const cli = new CLIEngine({
        cwd: path.resolve(__dirname, "../fixtures/"),
        ignore: false,
        useEslintrc: false,
        configFile: path.resolve(__dirname, "../fixtures/", fixtureConfigName),
        ...options
    });

    cli.addPlugin("markdown", plugin);
    return cli;
}

describe("recommended config", () => {

    let cli;
    const shortText = [
        "```js",
        "var unusedVar = console.log(undef);",
        "'unused expression';",
        "```"
    ].join("\n");

    before(function() {
        try {

            // The tests for the recommended config will have ESLint import
            // the plugin, so we need to make sure it's resolvable and link it
            // if not.
            // eslint-disable-next-line node/no-extraneous-require
            require.resolve("eslint-plugin-markdown");
        } catch (error) {
            if (error.code === "MODULE_NOT_FOUND") {

                // The npm link step can take longer than Mocha's default 2s
                // timeout, so give it more time. Mocha's API for customizing
                // hook-level timeouts uses `this`, so disable the rule.
                // https://mochajs.org/#hook-level
                // eslint-disable-next-line no-invalid-this
                this.timeout(30000);

                execSync("npm link && npm link eslint-plugin-markdown");
            } else {
                throw error;
            }
        }

        cli = initCLI("recommended.json");
    });

    it("should include the plugin", () => {
        const config = cli.getConfigForFile("test.md");

        assert.include(config.plugins, "markdown");
    });

    it("applies convenience configuration", () => {
        const config = cli.getConfigForFile("subdir/test.md/0.js");

        assert.deepStrictEqual(config.parserOptions, {
            ecmaFeatures: {
                impliedStrict: true
            }
        });
        assert.deepStrictEqual(config.rules["eol-last"], ["off"]);
        assert.deepStrictEqual(config.rules["no-undef"], ["off"]);
        assert.deepStrictEqual(config.rules["no-unused-expressions"], ["off"]);
        assert.deepStrictEqual(config.rules["no-unused-vars"], ["off"]);
        assert.deepStrictEqual(config.rules["padded-blocks"], ["off"]);
        assert.deepStrictEqual(config.rules.strict, ["off"]);
        assert.deepStrictEqual(config.rules["unicode-bom"], ["off"]);
    });

    it("overrides configure processor to parse .md file code blocks", () => {
        const report = cli.executeOnText(shortText, "test.md");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 1);
        assert.strictEqual(report.results[0].messages[0].ruleId, "no-console");
    });

});

describe("plugin", () => {

    let cli;
    const shortText = [
        "```js",
        "console.log(42);",
        "```"
    ].join("\n");

    before(() => {
        cli = initCLI("eslintrc.json");
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

    // https://github.com/eslint/eslint-plugin-markdown/issues/77
    it("should emit correct line numbers with leading blank line", () => {
        const code = [
            "### Heading",
            "",
            "```js",
            "",
            "console.log('a')",
            "```"
        ].join("\n");
        const report = cli.executeOnText(code, "test.md");

        assert.strictEqual(report.results[0].messages[0].line, 5);
    });

    it("doesn't add end locations to messages without them", () => {
        const code = [
            "```js",
            "!@#$%^&*()",
            "```"
        ].join("\n");
        const report = cli.executeOnText(code, "test.md");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 1);
        assert.notProperty(report.results[0].messages[0], "endLine");
        assert.notProperty(report.results[0].messages[0], "endColumn");
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

    it("should run on files with any custom extension", () => {
        const report = cli.executeOnText(shortText, "test.custom");

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

    // https://github.com/eslint/eslint-plugin-markdown/issues/181
    it("should work when called on nested code blocks in the same file", () => {

        /*
          * As of this writing, the nested code block, though it uses the same
          * Markdown processor, must use a different extension or ESLint will not
          * re-apply the processor on the nested code block. To work around that,
          * a file named `test.md` contains a nested `markdown` code block in
          * this test.
          *
          * https://github.com/eslint/eslint/pull/14227/files#r602802758
          */
        const code = [
            "<!-- test.md -->",
            "",
            "````markdown",
            "<!-- test.md/0_0.markdown -->",
            "",
            "This test only repros if the MD files have a different number of lines before code blocks.",
            "",
            "```js",
            "// test.md/0_0.markdown/0_0.js",
            "console.log('single quotes')",
            "```",
            "````"
        ].join("\n");
        const recursiveCli = initCLI("eslintrc.json", {
            extensions: [".js", ".markdown", ".md"]
        });
        const report = recursiveCli.executeOnText(code, "test.md");

        assert.strictEqual(report.results.length, 1);
        assert.strictEqual(report.results[0].messages.length, 2);
        assert.strictEqual(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.strictEqual(report.results[0].messages[0].line, 10);
        assert.strictEqual(report.results[0].messages[1].message, "Strings must use doublequote.");
        assert.strictEqual(report.results[0].messages[1].line, 10);
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

        // https://github.com/eslint/eslint-plugin-markdown/issues/78
        it("preserves leading empty lines", () => {
            const code = [
                "<!-- eslint lines-around-directive: ['error', 'never'] -->",
                "",
                "```js",
                "",
                "\"use strict\";",
                "```"
            ].join("\n");
            const report = cli.executeOnText(code, "test.md");

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 1);
            assert.strictEqual(report.results[0].messages[0].message, "Unexpected newline before \"use strict\" directive.");
            assert.strictEqual(report.results[0].messages[0].line, 5);
        });
    });

    describe("should fix code", () => {

        before(() => {
            cli = initCLI("eslintrc.json", { fix: true });
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

            it("multiline autofix", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    "   console.log('Hello, \\",
                    "   world!')",
                    "   console.log('Hello, \\",
                    "   world!')",
                    "   ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    "   ```js",
                    "   console.log(\"Hello, \\",
                    "   world!\")",
                    "   console.log(\"Hello, \\",
                    "   world!\")",
                    "   ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("underindented multiline autofix", () => {
                const input = [
                    "   ```js",
                    " console.log('Hello, world!')",
                    "  console.log('Hello, \\",
                    "  world!')",
                    "     console.log('Hello, world!')",
                    "   ```"
                ].join("\n");

                // The Markdown parser doesn't have any concept of a "negative"
                // indent left of the opening code fence, so autofixes move
                // lines that were previously underindented to the same level
                // as the opening code fence.
                const expected = [
                    "   ```js",
                    " console.log(\"Hello, world!\")",
                    "  console.log(\"Hello, \\",
                    "   world!\")",
                    "     console.log(\"Hello, world!\")",
                    "   ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("multiline autofix in blockquote", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    ">   ```js",
                    ">   console.log('Hello, \\",
                    ">   world!')",
                    ">   console.log('Hello, \\",
                    ">   world!')",
                    ">   ```"
                ].join("\n");
                const expected = [
                    "This is Markdown.",
                    "",
                    ">   ```js",
                    ">   console.log(\"Hello, \\",
                    ">   world!\")",
                    ">   console.log(\"Hello, \\",
                    ">   world!\")",
                    ">   ```"
                ].join("\n");
                const report = cli.executeOnText(input, "test.md");
                const actual = report.results[0].output;

                assert.strictEqual(actual, expected);
            });

            it("multiline autofix in nested blockquote", () => {
                const input = [
                    "This is Markdown.",
                    "",
                    "> This is a nested blockquote.",
                    ">",
                    "> >   ```js",
                    "> >  console.log('Hello, \\",
                    "> > new\\",
                    "> > world!')",
                    "> >  console.log('Hello, \\",
                    "> >    world!')",
                    "> >   ```"
                ].join("\n");

                // The Markdown parser doesn't have any concept of a "negative"
                // indent left of the opening code fence, so autofixes move
                // lines that were previously underindented to the same level
                // as the opening code fence.
                const expected = [
                    "This is Markdown.",
                    "",
                    "> This is a nested blockquote.",
                    ">",
                    "> >   ```js",
                    "> >  console.log(\"Hello, \\",
                    "> >   new\\",
                    "> >   world!\")",
                    "> >  console.log(\"Hello, \\",
                    "> >    world!\")",
                    "> >   ```"
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
