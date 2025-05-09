/**
 * @fileoverview Strips typedef aliases from the rolled-up file. This
 * is necessary because the TypeScript compiler throws an error when
 * it encounters a duplicate typedef.
 *
 * Usage:
 *  node tools/dedupe-types.js filename1.js filename2.js ...
 *
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import fs from "node:fs";

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

const importRegExp =
	/^\s*\*\s*@import\s*\{\s*(?<ids>[^,}]+(?:\s*,\s*[^,}]+)*)\s*\}\s*from\s*"(?<source>[^"]+)"/u;

// read files from the command line
const files = process.argv.slice(2);

files.forEach(filePath => {
	const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/gu);
	const imports = new Map();

	// find all imports and remove them
	const remainingLines = lines.filter(line => {
		if (!line.startsWith(" * @import")) {
			return true;
		}

		const match = importRegExp.exec(line);

		if (!match) {
			throw Error("@import statement must be on a single line.");
		}

		const source = match.groups.source;
		const ids = match.groups.ids.split(/,/gu).map(id => id.trim());

		// save the import data

		if (!imports.has(source)) {
			imports.set(source, new Set());
		}

		const existingIds = imports.get(source);
		ids.forEach(id => existingIds.add(id));

		return false;
	});

	// create a new import statement for each unique import
	const jsdocBlock = ["/**"];

	imports.forEach((ids, source) => {
		// if it's a local file, we don't need it
		if (source.startsWith("./") && !source.includes("./types.js")) {
			return;
		}

		const idList = Array.from(ids).join(", ");
		jsdocBlock.push(` * @import { ${idList} } from "${source}"`);
	});

	// add the new import statements to the top of the file
	jsdocBlock.push(" */");
	remainingLines.unshift(...jsdocBlock);
	remainingLines.unshift(""); // add a blank line before the block

	// replace references to ../types.ts with ./types.ts
	const text = remainingLines
		.join("\n")
		.replace(/\.\.\/types\.js/gu, "./types.js");

	fs.writeFileSync(filePath, text, "utf8");
});
