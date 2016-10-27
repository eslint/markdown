/**
 * @fileoverview Tests for the preprocessor plugin.
 * @author Brandon Mills
 */

"use strict";

var assert = require("chai").assert,
    CLIEngine = require("eslint").CLIEngine,
    path = require("path"),
    plugin = require("..");

describe("plugin", function() {

    var cli;
    var shortText = [
        "```js",
        "console.log(42);",
        "```"
    ].join("\n");

    before(function() {
        cli = new CLIEngine({
            envs: ["browser"],
            extensions: ["md", "mkdn", "mdown", "markdown"],
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
    });

    it("should run on .md files", function() {
        var report = cli.executeOnText(shortText, "test.md");

        assert.equal(report.results.length, 1);
        assert.equal(report.results[0].messages.length, 1);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 2);
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
        var report = cli.executeOnFiles([path.resolve(__dirname, "fixtures/long.md")]);

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

    describe("disable comments", function() {

    });

});
