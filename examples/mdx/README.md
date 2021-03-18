# MDX Example

The `eslint-mdx` parser and the `recommended` config's rules will work in `md/mdx` code blocks.

## abc

## abc

```md
## abc

## abc
```

```sh
$ git clone https://github.com/eslint/eslint-plugin-markdown.git
$ cd eslint-plugin-markdown/examples/mdx
$ npm install
$ npm test

eslint-plugin-markdown/examples/mdx/README.md
  12:1  warning  {"reason":"Do not use headings with similar content (1:1)","source":"remark-lint","ruleId":"no-duplicate-headings","severity":1}  mdx/remark
   7:1  warning  {"reason":"Do not use headings with similar content (5:1)","source":"remark-lint","ruleId":"no-duplicate-headings","severity":1}  mdx/remark

✖ 2 problems (0 errors, 2 warnings)
```
