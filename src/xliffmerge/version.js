"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = void 0;
/**
 * Created by martin on 19.02.2017.
 */
const path = require("path");
let pkg = null;
try {
    pkg = require(path.resolve(__dirname, '..', 'package.json'));
}
catch (e) {
    try {
        pkg = require(path.resolve(__dirname, '..', '..', 'package.json'));
    }
    catch (e) {
        pkg = null;
    }
}
exports.VERSION = (pkg ? pkg.version : 'unknown');
//# sourceMappingURL=version.js.map