/**
 * @fileoverview Updates the rules table in README.md with rule names,
 * descriptions, and whether the rules are recommended or not.
 *
 * Usage:
 *  node tools/update-rules-docs.js
 *
 * @author Francesco Trotta
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { fromMarkdown } from "mdast-util-from-markdown";
import fs from "node:fs/promises";
import path from "node:path";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("eslint").AST.Range} Range */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const docsFileURL = new URL("../README.md", import.meta.url);
const rulesDirURL = new URL("../src/rules/", import.meta.url);

/**
 * Formats a table row from a rule filename.
 * @param {string} ruleFilename The filename of the rule module without directory.
 * @returns {Promise<string>} The formatted markdown text of the table row.
 */
async function formatTableRowFromFilename(ruleFilename) {
	const ruleURL = new URL(ruleFilename, rulesDirURL);
	const { default: rule } = await import(ruleURL);
	const ruleName = path.parse(ruleFilename).name;
	const { description, recommended } = rule.meta.docs;
	const ruleLink = `[\`${ruleName}\`](./docs/rules/${ruleName}.md)`;
	const recommendedText = recommended ? "yes" : "no";

	return `| ${ruleLink} | ${description} | ${recommendedText} |`;
}

/**
 * Generates the markdown text for the rules table.
 * @returns {Promise<string>} The formatted markdown text of the rules table.
 */
async function createRulesTableText() {
	const filenames = await fs.readdir(rulesDirURL);
	const ruleFilenames = filenames.filter(
		filename => path.extname(filename) === ".js",
	);
	const text = [
		"| **Rule Name** | **Description** | **Recommended** |",
		"| :- | :- | :-: |",
		...(await Promise.all(ruleFilenames.map(formatTableRowFromFilename))),
	].join("\n");

	return text;
}

/**
 * Returns start and end offset of the rules table as indicated by "Rule Table Start" and
 * "Rule Table End" HTML comments in the markdown text.
 * @param {string} text The markdown text.
 * @returns {Range | null} The offset range of the rules table, or `null`.
 */
function getRulesTableRange(text) {
	const tree = fromMarkdown(text);
	const htmlNodes = tree.children.filter(({ type }) => type === "html");
	const startComment = htmlNodes.find(
		({ value }) => value === "<!-- Rule Table Start -->",
	);
	const endComment = htmlNodes.find(
		({ value }) => value === "<!-- Rule Table End -->",
	);

	return startComment && endComment
		? [startComment.position.end.offset, endComment.position.start.offset]
		: null;
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

let docsText = await fs.readFile(docsFileURL, "utf-8");
const rulesTableRange = getRulesTableRange(docsText);

if (!rulesTableRange) {
	throw Error("Rule Table Start/End comments not found, unable to update.");
}

const tableText = await createRulesTableText();

docsText = `${docsText.slice(0, rulesTableRange[0])}\n${tableText}\n${docsText.slice(rulesTableRange[1])}`;

await fs.writeFile(docsFileURL, docsText);
