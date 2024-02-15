"use strict";

const assert = require("chai").assert;
const fs = require("fs");
const path = require("path");
const semver = require("semver");

const examplesDir = path.resolve(__dirname, "../../examples/");
const examples = fs.readdirSync(examplesDir)
    .filter(exampleDir => fs.statSync(path.join(examplesDir, exampleDir)).isDirectory())
    .filter(exampleDir => fs.existsSync(path.join(examplesDir, exampleDir, "package.json")));

for (const example of examples) {
    const cwd = path.join(examplesDir, example);

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
        describe("examples", () => {
            describe(example, () => {
                it("reports errors on code blocks in .md files", async () => {
                    const { FlatESLint } = require(
                        require.resolve("eslint/use-at-your-own-risk", { paths: [cwd] })
                    );
                    const eslint = new FlatESLint({ cwd });
                    const results = await eslint.lintFiles(["README.md"]);
                    const readme = results.find(result =>
                        path.basename(result.filePath) == "README.md");

                    assert.isNotNull(readme);
                    assert.isAbove(readme.messages.length, 0);
                });
            });
        });
    }
}
