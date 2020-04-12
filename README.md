# eslint-plugin-markdown

[![npm Version](https://img.shields.io/npm/v/eslint-plugin-markdown.svg)](https://www.npmjs.com/package/eslint-plugin-markdown)
[![Build Status](https://img.shields.io/github/workflow/status/eslint/eslint-plugin-markdown/CI/master.svg)](https://github.com/eslint/eslint-plugin-markdown/actions)

Lint JS, JSX, TypeScript, and more inside Markdown.

<img
    src="screenshot.png"
    height="142"
    width="432"
    alt="A JS code snippet in a Markdown editor has red squiggly underlines. A tooltip explains the problem."
/>

> 🚧 This documentation is for an unfinished v2 release in progress in the `master` branch. The latest stable documentation is in the [`v1` branch](https://github.com/eslint/eslint-plugin-markdown/tree/v1).

## Usage

### Installing

Install the plugin alongside ESLint v6 or greater:

```sh
npm install --save-dev eslint eslint-plugin-markdown@next
```

### Configuring

Add the plugin to your `.eslintrc` and use the `processor` option in an `overrides` entry to enable the plugin's `markdown/markdown` processor on Markdown files.
Each fenced code block inside a Markdown document has a virtual filename appended to the Markdown file's path.
The virtual filename's extension will match the fenced code block's syntax tag, so for example, <code>```js</code> code blocks in <code>README.md</code> would match <code>README.md/*.js</code>.
For more information on configuring processors, refer to the [ESLint documentation](https://eslint.org/docs/user-guide/configuring#specifying-processor).

```js
// .eslintrc.js
module.exports = {
    // 1. Add the plugin.
    plugins: ["markdown"],
    overrides: [
        {
            // 2. Enable the Markdown processor for all .md files.
            files: ["**/*.md"],
            processor: "markdown/markdown"
        },
        {
            // 3. Optionally, customize the configuration ESLint uses for ```js
            // fenced code blocks inside .md files.
            files: ["**/*.md/*.js"],
            // ...
            rules: {
                // ...
            }
        }
    ]
};
```

#### Migrating from `eslint-plugin-markdown` v1

`eslint-plugin-markdown` v1 used an older version of ESLint's processor API.
The Markdown processor automatically ran on `.md`, `.mkdn`, `.mdown`, and `.markdown` files, and it only extracted fenced code blocks marked with `js`, `javascript`, `jsx`, or `node` syntax.
Configuration specifically for fenced code blocks went inside an `overrides` entry with a `files` pattern matching the containing Markdown document's filename that applied to all fenced code blocks inside the file.

```js
// .eslintrc.js for eslint-plugin-markdown v1
module.exports = {
    plugins: ["markdown"],
    overrides: [
        {
            files: ["**/*.md"],
            // In v1, configuration for fenced code blocks went inside an
            // `overrides` entry with a .md pattern, for example:
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true
                }
            },
            rules: {
                "no-console": "off"
            }
        }
    ]
};
```

[RFC3](https://github.com/eslint/rfcs/blob/master/designs/2018-processors-improvements/README.md) designed a new processor API to remove these limitations, and the new API was [implemented](https://github.com/eslint/eslint/pull/11552) as part of ESLint v6.
`eslint-plugin-markdown` v2 uses this new API.

```bash
$ npm install --save-dev eslint@latest eslint-plugin-markdown@next
```

All of the Markdown file extensions that were previously hard-coded are now fully configurable in `.eslintrc.js`.
Use the new `processor` option to apply the `markdown/markdown` processor on any Markdown documents matching a `files` pattern.
Each fenced code block inside a Markdown document has a virtual filename appended to the Markdown file's path.
The virtual filename's extension will match the fenced code block's syntax tag, so for example, <code>```js</code> code blocks in <code>README.md</code> would match <code>README.md/*.js</code>.

```js
// eslintrc.js for eslint-plugin-markdown v2
module.exports = {
    plugins: ["markdown"],
    overrides: [
        {
            // In v2, explicitly apply eslint-plugin-markdown's `markdown`
            // processor on any Markdown files you want to lint.
            files: ["**/*.md"],
            processor: "markdown/markdown"
        },
        {
            // In v2, configuration for fenced code blocks is separate from the
            // containing Markdown file. Each code block has a virtual filename
            // appended to the Markdown file's path.
            files: ["**/*.md/*.js"],
            // Configuration for fenced code blocks goes with the override for
            // the code block's virtual filename, for example:
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true
                }
            },
            rules: {
                "no-console": "off"
            }
        }
    ]
};
```

If you need to precisely mimic the behavior of v1 with the hard-coded Markdown extensions and fenced code block syntaxes, you can use those as glob patterns in `overrides[].files`:

```js
// eslintrc.js for v2 mimicking v1 behavior
module.exports = {
    plugins: ["markdown"],
    overrides: [
        {
            files: ["**/*.{md,mkdn,mdown,markdown}"],
            processor: "markdown/markdown"
        },
        {
            files: ["**/*.{md,mkdn,mdown,markdown}/*.{js,javascript,jsx,node}"]
            // ...
        }
    ]
};
```

### Running

#### ESLint v7

You can run ESLint as usual and do not need to use the `--ext` option.
ESLint v7 [automatically lints file extensions specified in `overrides[].files` patterns in config files](https://github.com/eslint/rfcs/blob/0253e3a95511c65d622eaa387eb73f824249b467/designs/2019-additional-lint-targets/README.md).

#### ESLint v6

Use the [`--ext` option](https://eslint.org/docs/user-guide/command-line-interface#ext) to include `.js` and `.md` extensions in ESLint's file search:

```sh
eslint --ext js,md .
```

### Autofixing

With this plugin, [ESLint's `--fix` option](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some issues in your Markdown fenced code blocks.
To enable this, pass the `--fix` flag when you run ESLint:

```bash
eslint --fix .
```

## What Gets Linted?

With this plugin, ESLint will lint [fenced code blocks](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks) in your Markdown documents:

````markdown
```js
// This gets linted
var answer = 6 * 7;
console.log(answer);
```

Here is some regular Markdown text that will be ignored.

```js
// This also gets linted

/* eslint quotes: [2, "double"] */

function hello() {
    console.log("Hello, world!");
}
hello();
```

```jsx
// This can be linted too if you add `.jsx` files to `overrides` in ESLint v7
// or pass `--ext jsx` in ESLint v6.
var div = <div className="jsx"></div>;
```
````

Blocks that don't specify a syntax are ignored:

````markdown
```
This is plain text and doesn't get linted.
```
````

Unless a fenced code block's syntax appears as a file extension in `overrides[].files` in ESLint v7, it will be ignored.
If using ESLint v6, you must also include the extension with the `--ext` option.

````markdown
```python
print("This doesn't get linted either.")
```
````

## Configuration Comments

The processor will convert HTML comments immediately preceding a code block into JavaScript block comments and insert them at the beginning of the source code that it passes to ESLint.
This permits configuring ESLint via configuration comments while keeping the configuration comments themselves hidden when the markdown is rendered.
Comment bodies are passed through unmodified, so the plugin supports any [configuration comments](http://eslint.org/docs/user-guide/configuring) supported by ESLint itself.

This example enables the `browser` environment, disables the `no-alert` rule, and configures the `quotes` rule to prefer single quotes:

````markdown
<!-- eslint-env browser -->
<!-- eslint-disable no-alert -->
<!-- eslint quotes: ["error", "single"] -->

```js
alert('Hello, world!');
```
````

Each code block in a file is linted separately, so configuration comments apply only to the code block that immediately follows.

````markdown
Assuming `no-alert` is enabled in `.eslintrc`, the first code block will have no error from `no-alert`:

<!-- eslint-env browser -->
<!-- eslint-disable no-alert -->

```js
alert("Hello, world!");
```

But the next code block will have an error from `no-alert`:

<!-- eslint-env browser -->

```js
alert("Hello, world!");
```
````

### Skipping Blocks

Sometimes it can be useful to have code blocks marked with `js` even though they don't contain valid JavaScript syntax, such as commented JSON blobs that need `js` syntax highlighting.
Standard `eslint-disable` comments only silence rule reporting, but ESLint still reports any syntax errors it finds.
In cases where a code block should not even be parsed, insert a non-standard `<!-- eslint-skip -->` comment before the block, and this plugin will hide the following block from ESLint.
Neither rule nor syntax errors will be reported.

````markdown
There are comments in this JSON, so we use `js` syntax for better
highlighting. Skip the block to prevent warnings about invalid syntax.

<!-- eslint-skip -->

```js
{
    // This code block is hidden from ESLint.
    "hello": "world"
}
```

```js
console.log("This code block is linted normally.");
```
````

## Unsatisfiable Rules

Since code blocks are not files themselves but embedded inside a Markdown document, some rules do not apply to Markdown code blocks, and messages from these rules are automatically suppressed:

- `eol-last`
- `unicode-bom`

### Project or directory-wide overrides for code snippets

Given that code snippets often lack full context, and adding full context through configuration comments may be too cumbersome to apply for each snippet, one may wish to instead set defaults for all one's JavaScript snippets in a manner that applies to all Markdown files within your project (or a specific directory).

ESLint allows a configuration property `overrides` which has a `files` property which accepts a [glob pattern](https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns), allowing you to designate files (such as all `md` files) whose rules will be overridden.

The following example shows the disabling of a few commonly problematic rules for code snippets.
It also points to the fact that some rules (e.g., `padded-blocks`) may be more appealing for disabling given that one may wish for documentation to be more liberal in providing padding for readability.

```js
// .eslintrc.js
module.exports = {
    plugins: ["markdown"],
    overrides: [
        {
            files: ["**/*.md"],
            processor: "markdown/markdown"
        },
        {
            files: ["**/*.md/*.js"],
            rules: {
                "no-undef": "off",
                "no-unused-vars": "off",
                "no-console": "off",
                "padded-blocks": "off"
            }
        }
    ]
};
```

### Overriding `strict`

The `strict` rule is technically satisfiable inside of Markdown code blocks, but writing a `"use strict"` directive at the top of every code block is tedious and distracting.
We recommend a glob pattern for `.md` files containing `.js` blocks to disable `strict` and enable the `impliedStrict` [parser option](https://eslint.org/docs/user-guide/configuring#specifying-parser-options) so the code blocks still parse in strict mode:

```js
// .eslintrc.js
module.exports = {
    plugins: ["markdown"],
    overrides: [
        {
            files: ["**/*.md"],
            processor: "markdown/markdown"
        },
        {
            files: ["**/*.md/*.js"],
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true
                }
            }
        }
    ]
};
```

## Editor Integrations

### VSCode

[`vscode-eslint`](https://github.com/microsoft/vscode-eslint) has built-in support for the Markdown processor.

### Atom

The [`linter-eslint`](https://atom.io/packages/linter-eslint) package allows for linting within the [Atom IDE](https://atom.io/).

In order to see `eslint-plugin-markdown` work its magic within Markdown code blocks in your Atom editor, you can go to `linter-eslint`'s settings and within "List of scopes to run ESLint on...", add the cursor scope "source.gfm".

However, this reports a problem when viewing Markdown which does not have configuration, so you may wish to use the cursor scope "source.embedded.js", but note that `eslint-plugin-markdown` configuration comments and skip directives won't work in this context.

## Contributing

```sh
$ git clone https://github.com/eslint/eslint-plugin-markdown.git
$ cd eslint-plugin-markdown
$ npm install
$ npm test
```

This project follows the [ESLint contribution guidelines](http://eslint.org/docs/developer-guide/contributing/).
