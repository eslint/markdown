# Migration

## From `eslint-plugin-markdown`

Starting with v6, `@eslint/markdown` officially replaced `eslint-plugin-markdown`.
You can take the following steps to migrate from the old package.

<!-- eslint-disable-next-line markdown/no-missing-label-refs -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
> [!NOTE]
> `@eslint/markdown` requires that you're on at least ESLint v9.15.0.

### Update dependencies

```sh
pnpm remove eslint-plugin-markdown
pnpm add -D @eslint/markdown

# or

npm remove eslint-plugin-markdown
npm add -D @eslint/markdown

# or

yarn remove eslint-plugin-markdown
yarn add -D @eslint/markdown

# or

bun remove eslint-plugin-markdown
bun add -D @eslint/markdown

# or

deno remove eslint-plugin-markdown
deno add jsr:@eslint/markdown
```

### Update `eslint.config.js/ts`

Make the following updates to your config, based on how you're currently using `eslint-plugin-markdown`.

#### Configs

```diff
// eslint.config.js
import { defineConfig } from "eslint/config";
- import markdown from "eslint-plugin-markdown";
+ import markdown from "@eslint/markdown";

export default defineConfig([
- ...markdown.configs.recommended,
+ markdown.configs.recommended,

  // your other configs
]);

```

<!-- eslint-disable-next-line markdown/no-missing-label-refs -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
> [!IMPORTANT]
> Because this plugin uses a new language to power its linting, you may need to update the other configs you're using so that you limit those to only apply to `js / ts` files.
> Otherwise, those rules will be applied to markdown files now, too, which can lead to unexpected failures.

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import markdown from "@eslint/markdown";

export default defineConfig([
  {
    name: "your-project/recommended-rules",
    files: ["**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
  },
  markdown.configs.recommended,
]);
```

If you were previously applying rules from other languages to code blocks within your markdown files, you can use this plugin's `processor` config to still allow for that.

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import markdown from "@eslint/markdown";

export default defineConfig([
  markdown.configs.processor,

  // your other configs
]);
```

<!-- eslint-disable-next-line markdown/no-missing-label-refs -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
> [!WARNING]
> It is not currently possible to use both the language-based `recommended` config and the processor-based `processor` config, due to a limitation in ESLint core.
> We hope at some point in the future the core will have a solution for this.

#### Rules Only

`@eslint/markdown` is significantly different in its architecture than `eslint-plugin-markdown`, and uses the language feature of `ESLint`, rather than using a processor.
As a result, if you want to configure rules directly (instead of using the recommended config), you'll have to set up the language instead of the processor.

```diff
// eslint.config.js
import { defineConfig } from "eslint/config";
- import markdown from "eslint-plugin-markdown";
+ import markdown from "@eslint/markdown";

export default defineConfig([
  {
    files: ["**/*.md"],
    plugins: {
      markdown,
    },
-   processor: "markdown/markdown"
+   language: "markdown/commonmark",
    rules: {
      "markdown/no-html": "error",
    },
  },
]);

```
<!-- eslint-disable-next-line markdown/no-missing-label-refs -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
> [!IMPORTANT]
> Because this plugin uses a new language to power its linting, you may need to update the other configs you're using so that you limit those to only apply to `js / ts` files.
> Otherwise, those rules will be applied to markdown files now, too, which can lead to unexpected failures.

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import markdown from "@eslint/markdown";

export default defineConfig([
  {
    name: "your-project/recommended-rules",
    files: ["**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: {
      markdown,
    },
    language: "markdown/commonmark",
    rules: {
      "markdown/no-html": "error",
    },
  },
]);
```
