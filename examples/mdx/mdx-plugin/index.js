const {
    processors: { markdown },
} = require("../../..");

module.exports = {
    processors: {
        remark: {
            preprocess(text, filename) {
                return [...markdown.preprocess(text, filename), text]
            },
            postprocess(lintMessages, filename) {
                return [...markdown.postprocess(lintMessages, filename)]
            }
        },
    },
};
