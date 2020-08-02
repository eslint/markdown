# React Example

```jsx
function App({ name }) {
    return (
        <div>
            <p>Hello, {name}!</p>
        </div>
    );
}
```

```sh
$ git clone https://github.com/eslint/eslint-plugin-markdown.git
$ cd eslint-plugin-markdown/examples/react
$ npm install
$ npm test

eslint-plugin-markdown/examples/react/README.md
  4:10  error  'App' is defined but never used        no-unused-vars
  4:16  error  'name' is missing in props validation  react/prop-types

✖ 2 problems (2 errors, 0 warnings)
```
