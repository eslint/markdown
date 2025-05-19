# no-duplicate-definitions

Disallow duplicate definitions.

## Background

In Markdown, it's possible to define the same definition identifier multiple times. However, this is usually a mistake, as it can lead to unintended or incorrect link, image, and footnote references.

Please note that this rule does not report definition-style comments. For example:

```markdown
[//]: # (This is a comment 1)
[//]: <> (This is a comment 2)
```

## Rule Details

This rule warns when `Definition` and `FootnoteDefinition` type identifiers are defined multiple times.

Examples of **incorrect** code:

```markdown
<!-- eslint markdown/no-duplicate-definitions: "error" -->
<!-- definition -->

[mercury]: https://example.com/mercury/
[mercury]: https://example.com/venus/

<!-- footnote definition -->

[^mercury]: Hello, Mercury!
[^mercury]: Hello, Venus!
```

Examples of **correct** code:

```markdown
<!-- eslint markdown/no-duplicate-definitions: "error" -->
<!-- definition -->

[mercury]: https://example.com/mercury/
[venus]: https://example.com/venus/

<!-- footnote definition -->

[^mercury]: Hello, Mercury!
[^venus]: Hello, Venus!

<!-- definition-style comment -->

[//]: # (This is a comment 1)
[//]: <> (This is a comment 2)
```

## Options

The following options are available on this rule:

- `allowDefinitions: Array<string>` - when specified, duplicate definitions are allowed if they match one of the identifiers in this array. This is useful for ignoring definitions that are intentionally duplicated. (default: `["//"]`)

    Examples of **correct** code when configured as `"no-duplicate-definitions: ["error", { allowDefinitions: ["mercury"] }]`:

    ```markdown
    <!-- eslint markdown/no-duplicate-definitions: ["error", { allowDefinitions: ["mercury"] }] -->
    [mercury]: https://example.com/mercury/
    [mercury]: https://example.com/venus/
    ```

- `allowFootnoteDefinitions: Array<string>` - when specified, duplicate footnote definitions are allowed if they match one of the identifiers in this array. This is useful for ignoring footnote definitions that are intentionally duplicated. (default: `[]`)

    Examples of **correct** code when configured as `"no-duplicate-definitions: ["error", { allowFootnoteDefinitions: ["mercury"] }]`:

    ```markdown
    <!-- eslint markdown/no-duplicate-definitions: ["error", { allowFootnoteDefinitions: ["mercury"] }] -->
    [^mercury]: Hello, Mercury!
    [^mercury]: Hello, Venus!
    ```

## When Not to Use It

If you are using a different style of definition comments, or not concerned with duplicate definitions, you can safely disable this rule.
