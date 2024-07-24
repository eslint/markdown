# TypeScript Example

The `@typescript-eslint` parser and the `recommended` config's rules will work in `ts` code blocks. However, [type-aware rules](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md) will not work because the code blocks are not part of a compilable `tsconfig.json` project.

```ts
function hello(name: String) {
    console.log(`Hello, ${name}!`);
}

hello(42 as any);
```

```sh
$ git clone https://github.com/eslint/markdown.git
$ cd markdown
$ npm install
$ cd examples/typescript
$ npm test

markdown/examples/typescript/README.md
   6:22  error  Prefer using the primitive `string` as a type name, rather than the upper-cased `String`  @typescript-eslint/no-wrapper-object-types
  10:13  error  Unexpected any. Specify a different type                                                  @typescript-eslint/no-explicit-any

✖ 2 problems (2 errors, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```
