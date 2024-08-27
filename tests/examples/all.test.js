import { assert } from "chai";
import fs from "node:fs";
import path from "node:path";
import semver from "semver";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const examplesDir = path.resolve(__dirname, "../../examples/");
const examples = fs
	.readdirSync(examplesDir)
	.filter(exampleDir =>
		fs.statSync(path.join(examplesDir, exampleDir)).isDirectory(),
	)
	.filter(exampleDir =>
		fs.existsSync(path.join(examplesDir, exampleDir, "package.json")),
	);

for (const example of examples) {
	const cwd = path.join(examplesDir, example);

	// In case when this plugin supports multiple major versions of ESLint,
	// CI matrix may include Node.js versions that are not supported by
	// the version of ESLint that is used in examples.
	// Only exercise the example if the running Node.js version satisfies the
	// minimum version constraint.
	const eslintPackageJsonPath = require.resolve("eslint/package.json", {
		paths: [cwd],
	});
	const eslintPackageJson = require(eslintPackageJsonPath);

	if (semver.satisfies(process.version, eslintPackageJson.engines.node)) {
		describe("examples", () => {
			describe(example, () => {
				it("reports errors on code blocks in .md files", async () => {
					const { FlatESLint } = require(
						require.resolve("eslint/use-at-your-own-risk", {
							paths: [cwd],
						}),
					);
					const eslint = new FlatESLint({ cwd });
					const results = await eslint.lintFiles(["README.md"]);
					const readme = results.find(
						result => path.basename(result.filePath) == "README.md",
					);

					assert.isNotNull(readme);
					assert.isAbove(readme.messages.length, 0);
				});
			});
		});
	}
}
