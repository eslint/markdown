/**
 * @fileoverview Strips typedef aliases from the rolled-up file. This
 * is necessary because the TypeScript compiler throws an error when
 * it encounters a duplicate typedef.
 *
 * Usage:
 *  node scripts/strip-typedefs.js filename1.js filename2.js ...
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

// read files from the command line
const files = process.argv.slice(2);

files.forEach(filePath => {
	const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/gu);
	const typedefs = new Set();

	const remainingLines = lines.filter(line => {
		if (!line.startsWith("/** @typedef {import")) {
			return true;
		}

		if (typedefs.has(line)) {
			return false;
		}

		typedefs.add(line);
		return true;
	});

	// replace references to ../types.ts with ./types.ts
	const text = remainingLines
		.join("\n")
		.replace(/\.\.\/types\.ts/gu, "./types.ts");

	fs.writeFileSync(filePath, text, "utf8");
});
