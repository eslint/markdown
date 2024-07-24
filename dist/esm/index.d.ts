export { plugin as default };
export type Block = import("./types.js").Block;
export type RangeMap = import("./types.js").RangeMap;
export type Node = import("mdast").Node;
export type ParentNode = import("mdast").Parent;
export type CodeNode = import("mdast").Code;
export type HtmlNode = import("mdast").Html;
export type Message = import("eslint").Linter.LintMessage;
export type Range = import("eslint").AST.Range;
declare namespace plugin {
    namespace configs {
        let recommended: ({
            name: string;
            plugins: {
                markdown: {
                    meta: {
                        name: string;
                        version: string;
                    };
                    processors: {
                        markdown: {
                            meta: {
                                name: string;
                                version: string;
                            };
                            preprocess: typeof preprocess;
                            postprocess: typeof postprocess;
                            supportsAutofix: boolean;
                        };
                    };
                    configs: {
                        "recommended-legacy": {
                            plugins: string[];
                            overrides: ({
                                files: string[];
                                processor: string;
                                parserOptions?: undefined;
                                rules?: undefined;
                            } | {
                                files: string[];
                                parserOptions: {
                                    ecmaFeatures: {
                                        impliedStrict: boolean;
                                    };
                                };
                                rules: {
                                    "eol-last": string;
                                    "no-undef": string;
                                    "no-unused-expressions": string;
                                    "no-unused-vars": string;
                                    "padded-blocks": string;
                                    strict: string;
                                    "unicode-bom": string;
                                };
                                processor?: undefined;
                            })[];
                        };
                    };
                };
            };
            files?: undefined;
            processor?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            name: string;
            files: string[];
            processor: string;
            plugins?: undefined;
            languageOptions?: undefined;
            rules?: undefined;
        } | {
            name: string;
            files: string[];
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        impliedStrict: boolean;
                    };
                };
            };
            rules: {
                "eol-last": string;
                "no-undef": string;
                "no-unused-expressions": string;
                "no-unused-vars": string;
                "padded-blocks": string;
                strict: string;
                "unicode-bom": string;
            };
            plugins?: undefined;
            processor?: undefined;
        })[];
    }
}
/**
 * Extracts lintable code blocks from Markdown text.
 * @param {string} text The text of the file.
 * @param {string} filename The filename of the file
 * @returns {Array<{ filename: string, text: string }>} Source code blocks to lint.
 */
declare function preprocess(text: string, filename: string): Array<{
    filename: string;
    text: string;
}>;
/**
 * Transforms generated messages for output.
 * @param {Array<Message[]>} messages An array containing one array of messages
 *     for each code block returned from `preprocess`.
 * @param {string} filename The filename of the file
 * @returns {Message[]} A flattened array of messages with mapped locations.
 */
declare function postprocess(messages: Array<Message[]>, filename: string): Message[];
