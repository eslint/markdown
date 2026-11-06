# no-duplicate-definition-content

Disallow duplicate definition content.

## Background

In Markdown, definitions let you write a URL once and reuse it in links and images through an identifier, and footnote definitions let you do the same with footnote content. When the same URL or the same footnote content is defined under different identifiers, it's usually a mistake, such as a copy-paste error, or an unnecessary duplication that makes the document harder to maintain, since every change has to be repeated in each definition.

Please note that this rule does not report definition-style comments by default. For example:

```markdown
[//]: # (This is a comment 1)
[//]: <> (This is a comment 2)
```

## Rule Details

> [!IMPORTANT] <!-- eslint-disable-line -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
>
> Footnotes are only supported when using `language` mode [`markdown/gfm`](/README.md#languages).

This rule warns when definitions with different identifiers have the same URL, or when footnote definitions with different identifiers have the same content.

Examples of **incorrect** code:

```markdown
<!-- eslint markdown/no-duplicate-definition-content: "error" -->

<!-- definition -->

[mercury]: https://example.com/mercury/
[venus]: https://example.com/mercury/

[earth]: <https://example.com/earth/> "Earth"
[moon]: https://example.com/earth/ "Moon"

<!-- footnote definition -->

[^mercury]: Hello, Mercury!
[^venus]: Hello, Mercury!

[^earth]: *Hello*, Earth!
[^moon]: _Hello_, Earth!
```

Examples of **correct** code:

```markdown
<!-- eslint markdown/no-duplicate-definition-content: "error" -->

<!-- definition -->

[mercury]: https://example.com/mercury/
[venus]: https://example.com/venus/

<!-- footnote definition -->

[^mercury]: Hello, Mercury!
[^venus]: Hello, Venus!

<!-- definition-style comment -->

[//]: # (This is a comment)
[top]: #
```

## Options

The following options are available on this rule:

- `allowDefinitions: Array<string>` - When specified, definitions are allowed to have the same URL as other definitions if their identifiers match one of the identifiers in this array. This is useful for ignoring definitions that intentionally share a URL. (default: `["//"]`)

    Examples of **correct** code when configured as `"no-duplicate-definition-content": ["error", { allowDefinitions: ["venus"] }]`:

    ```markdown
    <!-- eslint markdown/no-duplicate-definition-content: ["error", { allowDefinitions: ["venus"] }] -->

    [mercury]: https://example.com/mercury/
    [venus]: https://example.com/mercury/
    ```

- `allowFootnoteDefinitions: Array<string>` - When specified, footnote definitions are allowed to have the same content as other footnote definitions if their identifiers match one of the identifiers in this array. This is useful for ignoring footnote definitions that intentionally share content. (default: `[]`)

    Examples of **correct** code when configured as `"no-duplicate-definition-content": ["error", { allowFootnoteDefinitions: ["venus"] }]`:

    ```markdown
    <!-- eslint markdown/no-duplicate-definition-content: ["error", { allowFootnoteDefinitions: ["venus"] }] -->

    [^mercury]: Hello, Mercury!
    [^venus]: Hello, Mercury!
    ```

- `checkFootnoteDefinitions: boolean` - When set to `false`, the rule will not report footnote definitions with duplicate content. (default: `true`)

    Examples of **correct** code when configured as `"no-duplicate-definition-content": ["error", { checkFootnoteDefinitions: false }]`:

    ```markdown
    <!-- eslint markdown/no-duplicate-definition-content: ["error", { checkFootnoteDefinitions: false }] -->

    [^mercury]: Hello, Mercury!
    [^venus]: Hello, Mercury!
    ```

## When Not to Use It

If you don't mind the same URL or footnote content being defined under different identifiers, you can safely disable this rule.

## Prior Art

* [remark-lint-no-duplicate-defined-urls](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-duplicate-defined-urls)
