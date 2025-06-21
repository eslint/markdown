# table-column-count

Disallow data rows in a GitHub Flavored Markdown table from having more cells than the header row.

## Background

In GitHub Flavored Markdown [tables](https://github.github.com/gfm/#tables-extension-), rows should maintain a consistent number of cells. While variations are sometimes tolerated, data rows having *more* cells than the header can lead to lost data or rendering issues. This rule prevents data rows from exceeding the header's column count.

## Rule Details

> [!IMPORTANT] <!-- eslint-disable-line -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
>
> This rule relies on the `table` AST node, typically available when using a GFM-compatible parser (e.g., `language: "markdown/gfm"`).

This rule is triggered if a data row in a GFM table contains more cells than the header row. It does not flag rows with fewer cells than the header.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/table-column-count: "error" -->

| Head1 | Head2 |
| ----- | ----- |
| R1C1  | R1C2  | R2C3  | <!-- This data row has 3 cells, header has 2 -->

| A |
| - |
| 1 | 2 | <!-- This data row has 2 cells, header has 1 -->
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/table-column-count: "error" -->

<!-- Standard correct table -->
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
| Cell   | Cell   |

<!-- Data row with fewer cells than header (VALID for this rule) -->
<!-- Rows with fewer cells are valid because they render correctly and no data is lost -->
| Header | Header | Header |
| ------ | ------ | ------ |
| Cell   | Cell   |

<!-- Table with some empty cells (VALID for this rule) -->
<!-- Missing cells are treated as empty and don't cause rendering issues -->
| Col A | Col B | Col C |
| ----- | ----- | ----- |
| 1     |       | 3     |
| 4     | 5     |

<!-- Single column table -->
| Single Header |
| ------------- |
| Single Cell   |
```

## Options

The following options are available on this rule:

* `checkMissingCells: boolean` - When set to `true`, the rule will also flag rows that have fewer cells than the header row. Default is `false`.

Examples of **incorrect** code for this rule with `checkMissingCells: true`:

```markdown
<!-- eslint markdown/table-column-count: ["error", { checkMissingCells: true }] -->

<!-- Data row with fewer cells than header -->
| Header | Header | Header |
| ------ | ------ | ------ |
| Cell   | Cell   |
```

## When Not To Use It

If you intentionally create Markdown tables where data rows are expected to contain more cells than the header, and you have a specific (perhaps non-standard) processing or rendering pipeline that handles this scenario correctly, you might choose to disable this rule. However, adhering to this rule is recommended for typical GFM rendering and data consistency.

## Prior Art

* [MD056 - table-column-count](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md#md056---table-column-count)
