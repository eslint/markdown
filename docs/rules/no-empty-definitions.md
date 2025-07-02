# no-empty-definitions

Disallow empty definitions.

## Background

Markdown allows you to specify a label as a placeholder for a URL in both links and images, or as a footnote reference, using square brackets. For example:

```markdown
[ESLint][eslint]

[eslint]: https://eslint.org

[ESLint][^eslint]

[^eslint]: Find and fix problmes in your JavaScript code
```

Definitions with an empty URL or only an empty fragment (`#`), as well as footnote definitions with no content, are usually mistakes and do not provide useful information.

## Rule Details

> [!IMPORTANT] <!-- eslint-disable-line -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
>
> Footnotes are only supported when using `language` mode [`markdown/gfm`](/README.md#languages).

This rule warns when it finds definitions where the URL is either not specified or contains only an empty fragment (`#`). It also warns for empty footnote definitions by default. Please note that this rule doesn't report definition-style comments (e.g., `[//]: # (This is a comment)`) by default.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-empty-definitions: "error" -->

[earth]: <>
[moon]: #
[^note]:
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-empty-definitions: "error" -->

[earth]: https://example.com/earth/
[moon]: #section
[//]: <> (This is a comment 1)
[//]: # (This is a comment 2)
[^note]: This is a footnote.
```

## Options

The following options are available on this rule:

- `allowDefinitions: Array<string>` - When specified, empty definitions are allowed if they match one of the identifiers in this array. This is useful for ignoring definitions that are intentionally empty. (default: `["//"]`)

    Examples of **correct** code when configured as `"no-empty-definitions": ["error", { allowDefinitions: ["moon"] }]`:

    ```markdown
    <!-- eslint markdown/no-empty-definitions: ["error", { allowDefinitions: ["moon"] }] -->

    [moon]: <>
    ```

- `allowFootnoteDefinitions: Array<string>` - When specified, empty footnote definitions are allowed if they match one of the identifiers in this array. This is useful for ignoring footnote definitions that are intentionally empty. (default: `[]`)

    Examples of **correct** code when configured as `"no-empty-definitions": ["error", { allowFootnoteDefinitions: ["note"] }]`:

    ```markdown
    <!-- eslint markdown/no-empty-definitions: ["error", { allowFootnoteDefinitions: ["note"] }] -->

    [^note]:
    ```

- `checkFootnoteDefinitions: boolean` - When set to `false`, the rule will not report empty footnote definitions. (default: `true`)

    Examples of **correct** code when configured as `"no-empty-definitions": ["error", { checkFootnoteDefinitions: false }]`:

    ```markdown
    <!-- eslint markdown/no-empty-definitions: ["error", { checkFootnoteDefinitions: false }] -->

    [^note]:
    ```

## When Not to Use It

If you aren't concerned with empty definitions, you can safely disable this rule.

## Prior Art

* [remark-lint-no-empty-url](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-empty-url)