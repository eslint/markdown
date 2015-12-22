/**
 * @fileoverview Tests for the preprocessor plugin.
 * @author Brandon Mills
 * @copyright 2015 Brandon Mills. All rights reserved.
 * See LICENSE in root directory for full license.
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
            extensions: ["md", "mkdn", "mdown", "markdown"],
            ignore: false,
            rules: {
                "no-console": 2
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
        assert.equal(report.results[0].messages.length, 4);
        assert.equal(report.results[0].messages[0].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[0].line, 10);
        assert.equal(report.results[0].messages[1].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[1].line, 16);
        assert.equal(report.results[0].messages[1].column, 5);
        assert.equal(report.results[0].messages[2].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[2].line, 21);
        assert.equal(report.results[0].messages[3].message, "Unexpected console statement.");
        assert.equal(report.results[0].messages[3].line, 27);
    });

});
