# React Example

```ts
function hello(name: String) {
    console.log(`Hello, ${name}!`);
}

hello(42 as any);
```

```sh
$ git clone https://github.com/eslint/eslint-plugin-markdown.git
$ cd eslint-plugin-markdown/examples/typescript
$ npm install
$ npm test

eslint-plugin-markdown/examples/typescript/README.md
  4:22  error    Don’t use `String` as a type. Use string instead  @typescript-eslint/ban-types
  8:13  warning  Unexpected any. Specify a different type          @typescript-eslint/no-explicit-any

✖ 2 problems (1 error, 1 warning)
  1 error and 0 warnings potentially fixable with the `--fix` option.
```
