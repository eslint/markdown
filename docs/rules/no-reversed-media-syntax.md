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

# (ESLint)[https://eslint.org/]

# !(A beautiful sunset)[sunset.png]

| ESLint                        | Sunset                            |
| ----------------------------- | --------------------------------- |
| (ESLint)[https://eslint.org/] | !(A beautiful sunset)[sunset.png] |
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-reversed-media-syntax: "error" -->

[ESLint](https://eslint.org/)

![A beautiful sunset](sunset.png)

# [ESLint](https://eslint.org/)

# ![A beautiful sunset](sunset.png)

| ESLint                        | Sunset                            |
| ----------------------------- | --------------------------------- |
| [ESLint](https://eslint.org/) | ![A beautiful sunset](sunset.png) |
```

## Known Limitations

This rule uses a regular expression to find reversed syntax, and JavaScript regular expressions cannot match arbitrarily nested parentheses. A label may contain at most one level of nested parentheses, so `(ESLint (the linter))[https://eslint.org/]` is reported, while labels nesting two or more levels deep are not.

Examples of reversed syntax that this rule **does not** report:

```markdown
<!-- eslint markdown/no-reversed-media-syntax: "error" -->

(ESLint (the (JavaScript) linter))[https://eslint.org/]

!(A sunset (over (the) sea))[sunset.png]
```

## When Not To Use It

If you don't need to enforce correct link and image syntax, you can safely disable this rule.

## Prior Art

* [MD011 - no-reversed-links](https://github.com/DavidAnson/markdownlint/blob/main/doc/md011.md)
* [remark-lint-correct-media-syntax](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-correct-media-syntax)
