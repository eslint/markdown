# RFC: Configuring File Name from Block Meta

## Summary

Allowing codeblocks to change the `filename` used in `eslint-plugin-markdown`'s processor using codeblock `meta` text.

## Motivation

Some projects use ESLint `overrides` to run different lint rules on files based on their file name.
There's no way to respect file name based `overrides` in parsed Markdown codeblocks right now using `eslint-plugin-markdown`'s parsing.
This RFC would allow codeblocks to specify a custom file name so that `overrides` can be used more idiomatically.

### Real-World Example

In [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app), `*.json` files _except_ `package.json` files have [`jsonc/sort-keys`](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-keys.html) enabled using [an ESLint config file `overrides`](https://github.com/JoshuaKGoldberg/create-typescript-app/blob/76a75186fd89fc3f66e4c1254c717c28d70afe0d/.eslintrc.cjs#L94).
However, a codeblock in a file named `docs/FAQs.md` intended to be a `package.json` is currently given a name like `create-typescript-app/docs/FAQs.md/0_0.jsonc`.
Short of hardcoding overrides or disabling the lint rule in the file, there is no way to have the `overrides` apply to the markdown codeblock.

## Detailed Design

This RFC proposes that codeblocks be allowed to specify a file path in `meta` (the \`\`\` opening fence) with `filename="..."`.
Doing so would replace the `filename` provided by `eslint-plugin-markdown`'s `preprocess` method.

````md
```json filename="package.json"
{}
```
````

Parsing would be handled by a regular expression similar to the [Docusaurus parser](https://github.com/facebook/docusaurus/blob/7650829e913ec4bb1263d855719779f6b97066b6/packages/docusaurus-theme-common/src/utils/codeBlockUtils.ts#L12).

Parsed language is ignored when the codeblock provides a custom title.
Some languages have many file extensions, such as TypeScript's `.cts`, `.ts`, `.tsx`, etc.
Some extensions may map to multiple languages, such as Perl and Prolog both using `.pl`.

Roughly:

```diff
- filename: `${index}.${block.lang.trim().split(" ")[0]}`,
+ filename: titleFromMeta(block) ?? `${index}.${block.lang.trim().split(" ")[0]}`,
```

### Name Uniqueness

Codeblocks must have unique file paths for ESLint processing.
[ESLint internally prepends a unique number to codeblock filenames](https://github.com/eslint/eslint/blob/5ff6c1dd09f32b56c05ab97f328741fc8ffb1f64/lib/services/processor-service.js#L83), in the format of <code>\`${i}_${block.filename}\`</code>.
For example, given three codeblocks with the same name, the names in order would become:

-   `example`: `0_example`, `1_example`, `2_example`
-   `example.js`: `0_example.js`, `1_example.js`, `2_example.js`

Alternately, if multiple codeblocks require the same _file_ name, developers can give different _directory paths_:

````md
```json filename="example-1/package.json"
{}
```

```json filename="example-2/package.json"
{}
```
````

### Parsing Meta

There is no unified standard in the ecosystem for parsing codeblock metadata in Markdown.
The syntax has roughly converged on the syntax looking like <code>\`\`\`lang key="value"</code>, and to a lesser extent, using `filename` as the prop name.

-   [Docusaurus's `codeBlockTitleRegex`](https://github.com/facebook/docusaurus/blob/7650829e913ec4bb1263d855719779f6b97066b6/packages/docusaurus-theme-common/src/utils/codeBlockUtils.ts#L12): only supports a [code title prop](https://mdxjs.com/guides/syntax-highlighting/#syntax-highlighting-with-the-meta-field) like <code>\`\`\`jsx title="/src/components/HelloCodeTitle.js"</code>.
-   [Expressive Code's `title`](https://expressive-code.com/key-features/code-component/#title): used by [Astro](https://astro.build), with the syntax <code>\`\`\`js title="my-test-file.js"</code>.
-   Gatsby plugins such as [`gatsby-remark-prismjs`](https://www.gatsbyjs.com/plugins/gatsby-remark-prismjs) rely on a syntax like <code>\`\`\`javascript{numberLines: true}`</code>.
    -   Separately, [`gatsby-remark-code-titles`](https://www.gatsbyjs.com/plugins/gatsby-remark-code-titles) allows a syntax like <code>\`\`\`js:title=example-file.js</code>.
-   [`rehype-mdx-code-props`](https://github.com/remcohaszing/rehype-mdx-code-props): generally handles parsing of the raw `meta` text from the rehype AST.
    It specifies syntax like <code>\`\`\`js copy filename="awesome.js"</code>, with a suggestion of `filename` for just the file's name.
    -   [`remark-mdx-code-meta`](https://github.com/remcohaszing/remark-mdx-code-meta) is [referenced in the mdxjs.com `meta` docs](https://mdxjs.com/guides/syntax-highlighting/#syntax-highlighting-with-the-meta-field), but was deprecated with a notice to use `rehype-mdx-code-props` instead.
        It also specified syntax like <code>\`\`\`js copy filename="awesome.js" onUsage={props.beAwesome} {...props}</code>.
-   [`remark-fenced-props`](https://github.com/shawnbot/remark-fenced-props): A proof-of-concept that augments Remark's codeblock parsing with arbitrary MDX props, written to support [mdx-js/mdx/issues/702](https://github.com/mdx-js/mdx/issues/702).
    It only specifies syntax like <code>\`\`\`jsx live style={{border: '1px solid red'}}</code>.

This RFC chooses `filename` over alternatives such as `title`.
`filename` appears to be the closest to a "popular" choice in existing projects today.
As noted in [docusaurus/discussions#10033 Choice of filename vs. title for codeblocks](https://github.com/facebook/docusaurus/discussions/10033), `filename` implies a source code file names, whereas `title` implies the visual display.

## Related Discussions

See #226 for the original issue.
This RFC is intended to contain a superset of all information discussed there.
