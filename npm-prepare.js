/**
 * @fileoverview Install examples' dependencies as part of local npm install for
 * development and CI.
 * @author btmills
 */

"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const examplesDir = path.resolve(__dirname, "examples");
const examples = fs.readdirSync(examplesDir);

for (const example of examples) {
    childProcess.execSync("npm install", {
        cwd: path.resolve(examplesDir, example)
    });
}
