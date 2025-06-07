# no-reversed-media-syntax

Disallow reversed link and image syntax in Markdown.

## Background

Markdown syntax for links requires the text to be in square brackets `[]` followed by the URL in parentheses `()`. Similarly, images use `![alt](url)`. It's easy to accidentally reverse these brackets, which results in invalid syntax that won't render correctly.

## Rule Details

This rule is triggered when text that appears to be a link or image is encountered, but the syntax seems to have been reversed (the `[]` and `()` are in the wrong order).

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-reversed-media-syntax: "error" -->

(ESLint)[https://eslint.org/]

!(A beautiful sunset)[sunset.png]
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-reversed-media-syntax: "error" -->

[ESLint](https://eslint.org/)

![A beautiful sunset](sunset.png)
```

## When Not To Use It

If you don't need to enforce correct link and image syntax, you can safely disable this rule.

## Prior Art

* [MD011 - no-reversed-links](https://github.com/DavidAnson/markdownlint/blob/main/doc/md011.md)
* [remark-lint-correct-media-syntax](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-correct-media-syntax)