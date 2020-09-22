"use strict";
/**
 * Created by martin on 17.02.2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffMergeError = void 0;
class XliffMergeError extends Error {
    constructor(msg) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, XliffMergeError.prototype);
    }
}
exports.XliffMergeError = XliffMergeError;
//# sourceMappingURL=xliff-merge-error.js.map