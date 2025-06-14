# no-bare-urls

Disallow bare URLs.

## Background

In Markdown, URLs are typically formatted in two ways:

1. Autolinks: URLs wrapped in angle brackets, such as `<https://example.com/>`
2. Links: URLs with descriptive text, such as `[Visit our website](https://example.com/)`

A bare URL appears without angle brackets (`<>`), such as `https://example.com/`. While GitHub Flavored Markdown (GFM) allows bare URLs to be recognized as clickable links, this feature is not supported in all Markdown processors. To ensure compatibility across different processors, use autolinks or links instead.

## Rule Details

> [!IMPORTANT] <!-- eslint-disable-line -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
>
> This rule requires `language: "markdown/gfm"`.

This rule flags bare URLs that should be formatted as autolinks or links.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-bare-urls: "error" -->

For more info, visit https://www.example.com/

Contact us at user@example.com

[Read the [docs]](https://www.example.com/)

[docs]: https://www.example.com/docs
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-bare-urls: "error" -->

For more info, visit <https://www.example.com/>

For more info, visit [Example Website](https://www.example.com/)

Contact us at <user@example.com>

Contact us at [user@example.com](mailto:user@example.com)

Not a clickable link: `https://www.example.com/`

[https://www.example.com/]

[Read the \[docs\]](https://www.example.com/)
```

## When Not to Use It

If you're working in an environment where GFM autolink literals are fully supported and you prefer their simplicity, you can safely disable this rule.

## Prior Art

* [remark-lint-no-literal-urls](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-literal-urls)
* [MD034 - Bare URL used](https://github.com/DavidAnson/markdownlint/blob/main/doc/md034.md)
