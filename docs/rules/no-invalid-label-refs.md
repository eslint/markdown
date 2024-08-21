# no-invalid-label-refs

Disallow invalid label references.

## Background

CommonMark allows you to specify a label as a placeholder for a URL in both links and images using square brackets, such as:

```markdown
[ESLint][eslint]
[eslint][]
[eslint]

[eslint]: https://eslint.org
```

The shorthand form, `[label][]` does not allow any white space between the brackets, and when found, doesn't treat this as a link reference. 

Confusingly, GitHub still treats this as a label reference and will render it as if there is no white space between the brackets. Relying on this behavior could result in errors when using CommonMark-compliant renderers.

## Rule Details

This rule warns when it finds text that looks like it's a shorthand label reference and there's white space between the brackets.

Examples of incorrect code:

```markdown
[eslint][ ]

[eslint][

]
```

## When Not to Use It

If you publish your Markdown exclusively on GitHub, then you can safely disable this rule.
