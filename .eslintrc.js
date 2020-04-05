"use strict";

var fs = require("fs");
var path = require("path");
var PACKAGE_NAME = require("./package").name;
var SYMLINK_LOCATION = path.join(__dirname, "node_modules", PACKAGE_NAME);

// Symlink node_modules/eslint-plugin-markdown to this directory so that ESLint
// resolves this plugin name correctly.
if (!fs.existsSync(SYMLINK_LOCATION)) {
    fs.symlinkSync(__dirname, SYMLINK_LOCATION);
}

module.exports = {
    "root": true,

    "parserOptions": {
        "ecmaVersion": 2018
    },

    "plugins": [
        PACKAGE_NAME
    ],

    "overrides": [
        {
            "files": ["*.md"],
            "processor": "markdown/markdown"
        }
    ],

    "env": {
        "node": true
    },

    "extends": "eslint"
};
