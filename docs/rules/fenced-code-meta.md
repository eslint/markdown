# fenced-code-meta

Require or disallow metadata for fenced code blocks.

## Background

Fenced code blocks can include an info string after the opening fence. The first word typically specifies the language (e.g., `js`). Many tools also support additional metadata after the language (separated by whitespace), such as titles or line highlighting parameters. This rule enforces a consistent policy for including such metadata.

## Rule Details

This rule warns when the presence of metadata in a fenced code block's info string does not match the configured mode.

Examples of **incorrect** code for this rule:

````markdown
<!-- eslint markdown/fenced-code-meta: "error" -->

```js
console.log("Hello, world!");
```
````

## Options

This rule accepts a single string option:

- `"always"` (default): Require metadata when a language is specified.
- `"never"`: Disallow metadata in the info string.

Examples of **incorrect** code when configured as `"fenced-code-meta": ["error", "always"]`:

````markdown
<!-- eslint markdown/fenced-code-meta: ["error", "always"] -->

```js
console.log("Hello, world!");
```
````

Examples of **correct** code when configured as `"fenced-code-meta": ["error", "always"]`:

````markdown
<!-- eslint markdown/fenced-code-meta: ["error", "always"] -->

```js title="example.js"
console.log("Hello, world!");
```
````

Examples of **incorrect** code when configured as `"fenced-code-meta": ["error", "never"]`:

````markdown
<!-- eslint markdown/fenced-code-meta: ["error", "never"] -->

```js title="example.js"
console.log("Hello, world!");
```
````

Examples of **correct** code when configured as `"fenced-code-meta": ["error", "never"]`:

````markdown
<!-- eslint markdown/fenced-code-meta: ["error", "never"] -->

```js
console.log("Hello, world!");
```
````

## When Not to Use It

If you aren't concerned with metadata in info strings, you can safely disable this rule.

## Prior Art

* [MD040 - Fenced code blocks should have a language specified](https://github.com/DavidAnson/markdownlint/blob/main/doc/md040.md)
