# no-unused-definitions

Disallow unused definitions.

## Background

In Markdown, you can define reference-style links, images, and footnotes using definitions that appear elsewhere in the document. These definitions consist of an identifier followed by a URL, image source, or footnote content. However, when definitions are created but never referenced in the document, they become unused and potentially confusing.

Unused definitions can cause several issues:

- They add unnecessary clutter to the document.
- They might indicate broken references or content that was intended to be included.
- They can mislead readers who might assume the definitions are being used somewhere.


Cleaning up unused definitions helps maintain a more organized and intentional document structure.

## Rule Details

> [!IMPORTANT] <!-- eslint-disable-line -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
>
> The footnotes are only supported when using `language` mode [`markdown/gfm`](/README.md#languages).

This rule warns about unused reference definitions in Markdown documents. It detects definition entries (e.g., `[reference-id]: http://example.com`) that aren't used by any links, images, or footnotes in the document, and reports them as violations. Please note that this rule doesn't report definition-style comments (e.g., `[//]: # (This is a comment)`) by default.

Examples of **incorrect** code:

```markdown
<!-- eslint markdown/no-unused-definitions: "error" -->

<!-- definition -->

[mercury]: https://example.com/mercury/

[venus]: https://example.com/venus.jpg

<!-- footnote definition -->

[^mercury]: Hello, Mercury!
```

Examples of **correct** code:

```markdown
<!-- eslint markdown/no-unused-definitions: "error" -->

<!-- definition -->

[Mercury][mercury]

[mercury]: https://example.com/mercury/

![Venus Image][venus]

[venus]: https://example.com/venus.jpg

<!-- footnote definition -->

Mercury[^mercury]

[^mercury]: Hello, Mercury!

<!-- definition-style comment -->

[//]: # (This is a comment 1)
[//]: <> (This is a comment 2)
```

## Options

- `allowDefinitions: Array<string>` - when specified, unused definitions are allowed if they match one of the identifiers in this array. This is useful for ignoring definitions that are intentionally unused. (default: `["//"]`)

    Examples of **correct** code when configured as `"no-unused-definitions": ["error", { allowDefinitions: ["mercury"] }]`:

    ```markdown
    <!-- eslint markdown/no-unused-definitions: ["error", { allowDefinitions: ["mercury"] }] -->

    [mercury]: https://example.com/mercury/
    [mercury]: https://example.com/venus/
    ```

- `allowFootnoteDefinitions: Array<string>` - when specified, unused footnote definitions are allowed if they match one of the identifiers in this array. This is useful for ignoring footnote definitions that are intentionally unused. (default: `[]`)

    Examples of **correct** code when configured as `"no-unused-definitions": ["error", { allowFootnoteDefinitions: ["mercury"] }]`:

    ```markdown
    <!-- eslint markdown/no-unused-definitions: ["error", { allowFootnoteDefinitions: ["mercury"] }] -->

    [^mercury]: Hello, Mercury!
    [^mercury]: Hello, Venus!
    ```

- `checkFootnoteDefinitions: boolean` - When set to `false`, the rule will not report unused footnote definitions. (default: `true`)

    Examples of **correct** code when configured as `"no-unused-definitions": ["error", { checkFootnoteDefinitions: false }]`:

    ```markdown
    <!-- eslint markdown/no-unused-definitions: ["error", { checkFootnoteDefinitions: false }] -->

    [^mercury]: Hello, Mercury!
    ```

## When Not to Use It

You might want to disable this rule if:

- You're maintaining a document with intentionally defined but temporarily unused references.
- You're using reference definitions as a form of comment or placeholder for future content.

## Prior Art

- [MD053 - Link and image reference definitions should be needed](https://github.com/DavidAnson/markdownlint/blob/main/doc/md053.md#md053---link-and-image-reference-definitions-should-be-needed)
- [remark-lint-no-unused-definitions](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-unused-definitions#remark-lint-no-unused-definitions)