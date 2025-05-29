# no-duplicate-headings

Disallow duplicate headings in the same document.

## Background

Headings in Markdown documents are often used in a variety ways:

1. To generate in-document links
1. To generate a table of contents

When generating in-document links, unique headings are necessary to ensure you can navigate to a specific heading. Generated tables of contents then use those links, and when there are duplicate headings, you can only link to the first instance.

## Rule Details

This rule warns when it finds more than one heading with the same text, even if the headings are of different levels.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-duplicate-headings: "error" -->

# Hello world!

## Hello world!

Goodbye World!
--------------

# Goodbye World!
```

## Options

The following options are available on this rule:

* `siblingsOnly: boolean` - When set to `true`, the rule will only check for duplicate headings among headings that share the same immediate parent heading. Default is `false`.

Examples of **correct** code for this rule with `siblingsOnly: true`:

```markdown
<!-- eslint markdown/no-duplicate-headings: ["error", { "siblingsOnly": true }] -->

# Change log

## 1.0.0

### Features
### Bug Fixes

## 2.0.0

### Features
### Bug Fixes
```

In this example, the duplicate "Features" and "Bug Fixes" headings are allowed because they have different parent headings ("1.0.0" vs "2.0.0").

## When Not to Use It

If you aren't concerned with autolinking heading or autogenerating a table of contents, you can safely disable this rule.

## Prior Art

* [MD024 - Multiple headers with the same content](https://github.com/markdownlint/markdownlint/blob/main/docs/RULES.md#md024---multiple-headers-with-the-same-content)
* [MD024 - no-duplicate-heading](https://github.com/DavidAnson/markdownlint/blob/main/doc/md024.md)
