"use strict";

const assert = require("chai").assert;
const execSync = require("child_process").execSync;
const fs = require("fs");
const path = require("path");
const semver = require("semver");

const examples = path.resolve(__dirname, "../../examples/");
for (const example of fs.readdirSync(examples)) {
    const cwd = path.join(examples, example);

    // The plugin officially supports ESLint as early as v6, but the examples
    // use ESLint v7, which has a higher minimum Node.js version than does v6.
    // Only exercise the example if the running Node.js version satisfies the
    // minimum version constraint. In CI, this will skip these tests in Node.js
    // v8 and run them on all other Node.js versions.
    const eslintPackageJsonPath = require.resolve("eslint/package.json", {
        paths: [cwd]
    });
    const eslintPackageJson = require(eslintPackageJsonPath);
    if (semver.satisfies(process.version, eslintPackageJson.engines.node)) {
        describe("examples", function () {
            describe(example, () => {
                it("reports errors on code blocks in .md files", async () => {
                    const { ESLint } = require(
                        require.resolve("eslint", { paths: [cwd] })
                    );
                    const eslint = new ESLint({ cwd });

                    const results = await eslint.lintFiles(["."]);
                    const readme = results.find(result =>
                        path.basename(result.filePath) == "README.md"
                    );
                    assert.isNotNull(readme);
                    assert.isAbove(readme.messages.length, 0);
                });
            });
        });
    }
}
