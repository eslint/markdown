# no-missing-label-refs

Disallow missing label references.

## Background

Markdown allows you to specify a label as a placeholder for a URL in both links and images using square brackets, such as:

```markdown
[ESLint][eslint]

[eslint]: https://eslint.org
```

If the label is never defined, then Markdown doesn't render a link and instead renders plain text.

## Rule Details

This rule warns when it finds text that looks like it's a label but the label reference doesn't exist.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-missing-label-refs: "error" -->

[ESLint][eslint]

[eslint][]

[eslint]
```

## Options

The following options are available on this rule:

* `allowLabels: Array<string>` - labels to allow when checking for missing label references. (default: `[]`)

Examples of **correct** code when configured as `"no-missing-label-refs": ["error", { allowLabels: ["eslint"] }]`:

```markdown
<!-- eslint markdown/no-missing-label-refs: ["error", { allowLabels: ["eslint"] }] -->

[ESLint][eslint]

[eslint][]

[eslint]
```

## When Not to Use It

If you aren't concerned with missing label references, you can safely disable this rule.

## Prior Art

* [MD052 - reference-links-images](https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md)
