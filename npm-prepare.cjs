/**
 * @fileoverview Install examples' dependencies as part of local npm install for
 * development and CI.
 * @author btmills
 */

"use strict";

if (!process.env.NO_RECURSIVE_PREPARE) {
	const childProcess = require("node:child_process");
	const fs = require("node:fs");
	const path = require("node:path");

	const examplesDir = path.resolve(__dirname, "examples");
	const examples = fs
		.readdirSync(examplesDir)
		.filter(exampleDir =>
			fs.statSync(path.join(examplesDir, exampleDir)).isDirectory(),
		)
		.filter(exampleDir =>
			fs.existsSync(path.join(examplesDir, exampleDir, "package.json")),
		);

	for (const example of examples) {
		childProcess.execSync("npm install", {
			cwd: path.resolve(examplesDir, example),
			env: {
				...process.env,
				NO_RECURSIVE_PREPARE: "true",
			},
		});
	}
}
