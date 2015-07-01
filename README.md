# eslint-plugin-markdown

An [ESLint](http://eslint.org/) plugin to lint JavaScript in Markdown.

Supported extensions are `.markdown`, `.mdown`, `.mkdn`, and `.md`.

## Usage

Install the plugin:

```sh
npm install --save-dev eslint-plugin-markdown
```

Add it to your `.eslintrc`:

```json
{
    "plugins": [
        "markdown"
    ]
}
```

It will lint `js` or `javascript` [fenced code blocks](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks) in your Markdown documents:

    ```js
    // This gets linted
    var answer = 6 * 7;
    console.log(answer);
    ```

    ```JavaScript
    // This also gets linted

    /* eslint quotes: [2, "double"] */

    function hello() {
        console.log("Hello, world!");
    }
    hello();
    ```

Blocks that don't specify either `js` or `javascript` syntax are ignored:

    ```
    This is plain text and doesn't get linted.
    ```
