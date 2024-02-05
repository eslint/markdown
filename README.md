# eslint-plugin-markdown

[![npm Version](https://img.shields.io/npm/v/eslint-plugin-markdown.svg)](https://www.npmjs.com/package/eslint-plugin-markdown)
[![Downloads](https://img.shields.io/npm/dm/eslint-plugin-markdown.svg)](https://www.npmjs.com/package/eslint-plugin-markdown)
[![Build Status](https://github.com/eslint/eslint-plugin-markdown/workflows/CI/badge.svg)](https://github.com/eslint/eslint-plugin-markdown/actions)

Lint JS, JSX, TypeScript, and more inside Markdown.

<img
    src="screenshot.png"
    height="142"
    width="432"
    alt="A JS code snippet in a Markdown editor has red squiggly underlines. A tooltip explains the problem."
/>

## Usage

### Installing

Install the plugin alongside ESLint v8 or greater:

```sh
npm install --save-dev eslint eslint-plugin-markdown
```

### Configuring

In your `eslint.config.js` file, import `eslint-plugin-markdown` and include the recommended config to enable the Markdown processor on all `.md` files:

```js
// eslint.config.js
import markdown from "eslint-plugin-markdown";

export default [
    ...markdown.configs.recommended

    // your other configs here
];
```

If you are still using the deprecated `.eslintrc.js` file format for ESLint, you can extend the `plugin:markdown/recommended` config to enable the Markdown processor on all `.md` files:

```js
// .eslintrc.js
module.exports = {
    extends: "plugin:markdown/recommended"
};
```

#### Advanced Configuration

You can manually include the Markdown processor by setting the `processor` option in your configuration file for all `.md` files.

Each fenced code block inside a Markdown document has a virtual filename appended to the Markdown file's path.

The virtual filename's extension will match the fenced code block's syntax tag, so for example, <code>```js</code> code blocks in <code>README.md</code> would match <code>README.md/*.js</code>.
You can use glob patterns for these virtual filenames to customize configuration for code blocks without affecting regular code.
For more information on configuring processors, refer to the [ESLint documentation](https://eslint.org/docs/user-guide/configuring#specifying-processor).

Here's an example:

```js
// / eslint.config.js
import markdown from "eslint-plugin-markdown";

export default [
    {
        // 1. Add the plugin
        plugins: {
            markdown
        }
    },
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

    // your other configs here
];
```

In the deprecated `.eslintrc.js` format:

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

#### Frequently-Disabled Rules

Some rules that catch mistakes in regular code are less helpful in documentation.
For example, `no-undef` would flag variables that are declared outside of a code snippet because they aren't relevant to the example.
The `plugin:markdown/recommended` config disables these rules in Markdown files:

- [`no-undef`](https://eslint.org/docs/rules/no-undef)
- [`no-unused-expressions`](https://eslint.org/docs/rules/no-unused-expressions)
- [`no-unused-vars`](https://eslint.org/docs/rules/no-unused-vars)
- [`padded-blocks`](https://eslint.org/docs/rules/padded-blocks)

Use glob patterns to disable more rules just for Markdown code blocks:

```js
// / eslint.config.js
import markdown from "eslint-plugin-markdown";

export default [
    {
        plugins: {
            markdown
        }
    },
    {
        files: ["**/*.md"],
        processor: "markdown/markdown"
    },
    {
        // 1. Target ```js code blocks in .md files.
        files: ["**/*.md/*.js"],
        rules: {
            // 2. Disable other rules.
            "no-console": "off",
            "import/no-unresolved": "off"
        }
    }

    // your other configs here
];
```

And in the deprecated `.eslintrc.js` format:

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
            // 1. Target ```js code blocks in .md files.
            files: ["**/*.md/*.js"],
            rules: {
                // 2. Disable other rules.
                "no-console": "off",
                "import/no-unresolved": "off"
            }
        }
    ]
};
```

#### Strict Mode

`"use strict"` directives in every code block would be annoying.
The `plugin:markdown/recommended` config enables the [`impliedStrict` parser option](https://eslint.org/docs/user-guide/configuring#specifying-parser-options) and disables the [`strict` rule](https://eslint.org/docs/rules/strict) in Markdown files.
This opts into strict mode parsing without repeated `"use strict"` directives.

#### Unsatisfiable Rules

Markdown code blocks are not real files, so ESLint's file-format rules do not apply.
The `plugin:markdown/recommended` config disables these rules in Markdown files:

- [`eol-last`](https://eslint.org/docs/rules/eol-last): The Markdown parser trims trailing newlines from code blocks.
- [`unicode-bom`](https://eslint.org/docs/rules/unicode-bom): Markdown code blocks do not have Unicode Byte Order Marks.

### Running

#### ESLint v7+

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
<!-- global alert -->
<!-- eslint-disable no-alert -->
<!-- eslint quotes: ["error", "single"] -->

```js
alert('Hello, world!');
```
````

Each code block in a file is linted separately, so configuration comments apply only to the code block that immediately follows.

````markdown
Assuming `no-alert` is enabled in `.eslintrc`, the first code block will have no error from `no-alert`:

<!-- global alert -->
<!-- eslint-disable no-alert -->

```js
alert("Hello, world!");
```

But the next code block will have an error from `no-alert`:

<!-- global alert -->

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
