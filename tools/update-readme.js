/**
 * @fileoverview Script to update the README with sponsors details in all packages.
 *
 *   node tools/update-readme.js
 *
 * @author Milos Djermanovic
 */

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

import { readFileSync, writeFileSync } from "node:fs";
import got from "got";

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const SPONSORS_URL =
	"https://raw.githubusercontent.com/eslint/eslint.org/main/includes/sponsors.md";

const README_FILE_PATH = "./README.md";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Fetches the latest sponsors from the website.
 * @returns {Promise<string>}} Prerendered sponsors markdown.
 */
async function fetchSponsorsMarkdown() {
	return got(SPONSORS_URL).text();
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

const allSponsors = await fetchSponsorsMarkdown();

// read readme file
const readme = readFileSync(README_FILE_PATH, "utf8");

let newReadme = readme.replace(
	/<!--sponsorsstart-->[\w\W]*?<!--sponsorsend-->/u,
	`<!--sponsorsstart-->\n\n${allSponsors}\n<!--sponsorsend-->`,
);

// replace multiple consecutive blank lines with just one blank line
newReadme = newReadme.replace(/(?<=^|\n)\n{2,}/gu, "\n");

// output to the files
writeFileSync(README_FILE_PATH, newReadme, "utf8");
