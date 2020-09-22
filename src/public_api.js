"use strict";
/*
 * Public API Surface of xliffmerge
 * In principle, there is only the bin file xliffmerge,
 * because this is not mentioned as a library.
 * But the tooling uses the configuration file type.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffMerge = exports.CommandOutput = exports.WriterToString = void 0;
const tslib_1 = require("tslib");
// The module is here only because ng-packagr needs it
tslib_1.__exportStar(require("./lib/xliffmerge.module"), exports);
var writer_to_string_1 = require("./common/writer-to-string");
Object.defineProperty(exports, "WriterToString", { enumerable: true, get: function () { return writer_to_string_1.WriterToString; } });
var command_output_1 = require("./common/command-output");
Object.defineProperty(exports, "CommandOutput", { enumerable: true, get: function () { return command_output_1.CommandOutput; } });
var xliff_merge_1 = require("./xliffmerge/xliff-merge");
Object.defineProperty(exports, "XliffMerge", { enumerable: true, get: function () { return xliff_merge_1.XliffMerge; } });
//# sourceMappingURL=public_api.js.map