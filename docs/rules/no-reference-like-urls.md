# no-reference-like-urls

Disallow URLs that match defined reference identifiers.

## Background

In Markdown, you can create links using either inline syntax `[text](url)` or reference syntax `[text][id]` with a separate definition `[id]: url`. This rule encourages the use of reference syntax when a link's URL matches an existing reference identifier.

For example, if you have a definition like `[mercury]: https://example.com/mercury/`, then using `[text](mercury)` should be written as `[text][mercury]` instead.

Please note that autofix is not performed for links or images that include a title. For example:

```markdown
[Mercury](mercury "The planet Mercury")
![Venus](venus "The planet Venus")
```

## Rule Details

This rule flags URLs that match defined reference identifiers.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-reference-like-urls: "error" -->

[**Mercury**](mercury) is the first planet from the sun.
![**Venus** is a planet](venus).

[mercury]: https://example.com/mercury/
[venus]: https://example.com/venus.jpg
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-reference-like-urls: "error" -->

[**Mercury**][mercury] is the first planet from the sun.
![**Venus** is a planet][venus].

[mercury]: https://example.com/mercury/
[venus]: https://example.com/venus.jpg
```

## Options

This rule has no options.

## Known Limitations

This rule uses a regular expression to parse the link/image label, and JavaScript regular expressions cannot match arbitrarily nested parentheses. A label may contain at most one level of nested parentheses, so `[Mercury (the planet)](mercury)` is still checked, while labels nesting two or more levels deep are not.

Examples of code that this rule **does not** flag, even though the URL matches a defined reference identifier:

```markdown
<!-- eslint markdown/no-reference-like-urls: "error" -->

[Mercury (the (first) planet)](mercury)

[mercury]: https://example.com/mercury/
```

## When Not to Use It

If you prefer inline link syntax even when reference definitions are available, or if you're working in an environment where reference syntax is not preferred, you can safely disable this rule.

## Prior Art

* [remark-lint-no-reference-like-url](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-reference-like-url)
