# React Example

```ts
function hello(name: String) {
    await console.log(`Hello, ${name}!`);
}

hello(42 as any);
```

When I add a `tsconfig.json`, the first code block above works with type-aware linting, but the second code block below doesn't. I've copied the output below. Any ideas? Since the TypeScript plugin needs to do its own pre-parse step, perhaps it's not able to extract the blocks from the Markdown file? But if that's the case, how is it finding the first block but failing on the second?

```ts
function hello(name: String) {
    await console.log(`Hello, ${name}!`);
}

hello(42 as any);
```

```sh
$ git clone https://github.com/eslint/eslint-plugin-markdown.git
$ cd eslint-plugin-markdown/examples/typescript
$ npm install
$ npm test

/Users/brandon/code/eslint/eslint-plugin-markdown/examples/typescript/README.md
  4:22  error    Don’t use `String` as a type. Use string instead            @typescript-eslint/ban-types
  5:5   error    Unexpected `await` of a non-Promise (non-"Thenable") value  @typescript-eslint/await-thenable
  5:33  error    Invalid type "String" of template literal expression        @typescript-eslint/restrict-template-expressions
  8:13  warning  Unexpected any. Specify a different type                    @typescript-eslint/no-explicit-any
  0:0   error    Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser.
The file does not match your project config: README.md/1_1.ts.
The file must be included in at least one of the projects provided

✖ 5 problems (4 errors, 1 warning)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```
