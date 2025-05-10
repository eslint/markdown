# no-empty-definitions

Disallow empty definitions.

## Background

Markdown allows you to specify a label as a placeholder for a URL in both links and images using square brackets, such as:

```markdown
[ESLint][eslint]

[eslint]: https://eslint.org
```

If the definition's URL is empty or only contains an empty fragment (`#`), then it's not providing any useful information and could be a mistake.

## Rule Details

This rule warns when it finds definitions where the URL is either not specified or contains only an empty fragment (`#`).

Examples of incorrect code:

```markdown
[earth]: <>
[earth]: #
```

Examples of correct code:

```markdown
[earth]: https://example.com/earth/
[earth]: #section
```

## When Not to Use It

If you aren't concerned with empty definitions, you can safely disable this rule.

## Prior Art

* [remark-lint-no-empty-url](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-empty-url)