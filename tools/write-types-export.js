/**
 * @fileoverview Adds a re-export of types to dist's index.d.ts file.
 *
 * Usage:
 *  node tools/write-types-export.js
 *
 * @author Josh Goldberg
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import fs from "node:fs/promises";

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

const distIndexFile = "dist/esm/index.d.ts";

await fs.writeFile(
	distIndexFile,
	[
		await fs.readFile(distIndexFile, "utf-8"),
		`export type * from "./types.d.ts";`,
		"",
	].join("\n"),
);
