(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('stream'), require('chalk'), require('util'), require('fs'), require('@ngx-i18nsupport/ngx-i18nsupport-lib'), require('path'), require('rxjs'), require('rxjs/operators'), require('he'), require('request')) :
    typeof define === 'function' && define.amd ? define('@ngx-i18nsupport/ngx-i18nsupport', ['exports', '@angular/core', 'stream', 'chalk', 'util', 'fs', '@ngx-i18nsupport/ngx-i18nsupport-lib', 'path', 'rxjs', 'rxjs/operators', 'he', 'request'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global['ngx-i18nsupport'] = global['ngx-i18nsupport'] || {}, global['ngx-i18nsupport']['ngx-i18nsupport'] = {}), global.ng.core, global.stream, global.chalk, global.util, global.fs, global.ngxI18nsupportLib, global.path, global.rxjs, global.rxjs.operators, global.entityDecoderLib, global.request));
}(this, (function (exports, i0, stream, chalk, util, fs, ngxI18nsupportLib, path, rxjs, operators, entityDecoderLib, request) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) { return e; } else {
            var n = Object.create(null);
            if (e) {
                Object.keys(e).forEach(function (k) {
                    if (k !== 'default') {
                        var d = Object.getOwnPropertyDescriptor(e, k);
                        Object.defineProperty(n, k, d.get ? d : {
                            enumerable: true,
                            get: function () {
                                return e[k];
                            }
                        });
                    }
                });
            }
            n['default'] = e;
            return Object.freeze(n);
        }
    }

    var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
    var request__namespace = /*#__PURE__*/_interopNamespace(request);

    // not used, only there to make ng-packagr happy
    var XliffmergeModule = /** @class */ (function () {
        function XliffmergeModule() {
        }
        return XliffmergeModule;
    }());
    /** @nocollapse */ XliffmergeModule.ɵmod = i0.ɵɵdefineNgModule({ type: XliffmergeModule });
    /** @nocollapse */ XliffmergeModule.ɵinj = i0.ɵɵdefineInjector({ factory: function XliffmergeModule_Factory(t) { return new (t || XliffmergeModule)(); }, imports: [[]] });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(XliffmergeModule, [{
                type: i0.NgModule,
                args: [{
                        imports: [],
                        declarations: [],
                        exports: []
                    }]
            }], null, null);
    })();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /**
     * Collection of utility functions that are deprecated in nodes util.
     */
    /**
     * Replaces node isNullOrUndefined.
     */
    function isNullOrUndefined(value) {
        return value === undefined || value === null;
    }
    /**
     * Replaces node isString.
     */
    function isString(value) {
        return typeof value === 'string';
    }
    /**
     * Replaces node isBoolean.
     */
    function isBoolean(value) {
        return typeof value === 'boolean';
    }
    /**
     * Replaces node isNumber.
     */
    function isNumber(value) {
        return typeof value === 'number';
    }
    /**
     * Replaces node isArray.
     */
    function isArray(value) {
        return Array.isArray(value);
    }

    /**
     * Created by martin on 20.02.2017.
     * A helper class for testing.
     * Can be used as a WritableStream and writes everything (synchronously) into a string,
     * that can easily be read by the tests.
     */
    var WriterToString = /** @class */ (function (_super) {
        __extends(WriterToString, _super);
        function WriterToString() {
            var _this = _super.call(this) || this;
            _this.resultString = '';
            return _this;
        }
        WriterToString.prototype._write = function (chunk, encoding, callback) {
            var chunkString;
            if (isString(chunk)) {
                chunkString = chunk;
            }
            else if (chunk instanceof Buffer) {
                chunkString = chunk.toString();
            }
            else {
                chunkString = Buffer.alloc(chunk).toString(encoding);
            }
            this.resultString = this.resultString + chunkString;
            callback();
        };
        /**
         * Returns a string of everything, that was written to the stream so far.
         * @return written data
         */
        WriterToString.prototype.writtenData = function () {
            return this.resultString;
        };
        return WriterToString;
    }(stream.Writable));

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
        LogLevel[LogLevel["WARN"] = 1] = "WARN";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
    })(LogLevel || (LogLevel = {}));
    var CommandOutput = /** @class */ (function () {
        function CommandOutput(stdout) {
            this._quiet = false;
            this._verbose = false;
            if (stdout) {
                this.outputStream = stdout;
            }
            else {
                this.outputStream = process.stdout;
            }
        }
        CommandOutput.prototype.setVerbose = function () {
            this._verbose = true;
        };
        CommandOutput.prototype.setQuiet = function () {
            this._quiet = true;
        };
        /**
         * Test, wether verbose is enabled.
         * @return wether verbose is enabled.
         */
        CommandOutput.prototype.verbose = function () {
            return this._verbose;
        };
        /**
         * Test, wether quiet is enabled.
         * @return wether quiet is enabled.
         */
        CommandOutput.prototype.quiet = function () {
            return this._quiet;
        };
        CommandOutput.prototype.error = function (msg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            this.log(LogLevel.ERROR, msg, params);
        };
        CommandOutput.prototype.warn = function (msg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            this.log(LogLevel.WARN, msg, params);
        };
        CommandOutput.prototype.info = function (msg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            this.log(LogLevel.INFO, msg, params);
        };
        CommandOutput.prototype.debug = function (msg) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            this.log(LogLevel.DEBUG, msg, params);
        };
        CommandOutput.prototype.log = function (level, msg, params) {
            if (!this.isOutputEnabled(level)) {
                return;
            }
            var coloredMessage;
            switch (level) {
                case LogLevel.ERROR:
                    coloredMessage = chalk__default['default'].red('ERROR: ' + msg);
                    break;
                case LogLevel.WARN:
                    coloredMessage = chalk__default['default'].magenta('WARNING: ' + msg);
                    break;
                default:
                    coloredMessage = chalk__default['default'].gray('* ' + msg);
                    break;
            }
            var outMsg = util.format.apply(void 0, __spread([coloredMessage], params));
            this.outputStream.write(outMsg + '\n');
        };
        CommandOutput.prototype.isOutputEnabled = function (level) {
            var quietEnabled, verboseEnabled;
            if (this._quiet && this._verbose) {
                quietEnabled = false;
                verboseEnabled = false;
            }
            else {
                quietEnabled = this._quiet;
                verboseEnabled = this._verbose;
            }
            switch (level) {
                case LogLevel.ERROR:
                    return true; // always output errors
                case LogLevel.WARN:
                    return (!quietEnabled);
                case LogLevel.INFO:
                    return (verboseEnabled && !quietEnabled);
                case LogLevel.DEBUG:
                    return verboseEnabled;
                default:
                    return true;
            }
        };
        return CommandOutput;
    }());

    /**
     * Created by martin on 17.02.2017.
     */
    var XliffMergeError = /** @class */ (function (_super) {
        __extends(XliffMergeError, _super);
        function XliffMergeError(msg) {
            var _this = _super.call(this, msg) || this;
            // Set the prototype explicitly.
            Object.setPrototypeOf(_this, XliffMergeError.prototype);
            return _this;
        }
        return XliffMergeError;
    }(Error));

    /**
     * Created by martin on 17.02.2017.
     * Some (a few) simple utils for file operations.
     * Just for convenience.
     */
    var FileUtil = /** @class */ (function () {
        function FileUtil() {
        }
        /**
         * Check for existence.
         * @param filename filename
         * @return wether file exists
         */
        FileUtil.exists = function (filename) {
            return fs.existsSync(filename);
        };
        /**
         * Read a file.
         * @param filename filename
         * @param encoding encoding
         * @return content of file
         */
        FileUtil.read = function (filename, encoding) {
            return fs.readFileSync(filename, encoding);
        };
        /**
         * Write a file with given content.
         * @param filename filename
         * @param newContent newContent
         * @param encoding encoding
         */
        FileUtil.replaceContent = function (filename, newContent, encoding) {
            fs.writeFileSync(filename, newContent, { encoding: encoding });
        };
        FileUtil.copy = function (srcFile, destFile) {
            var BUF_LENGTH = 64 * 1024;
            var buff = Buffer.alloc(BUF_LENGTH);
            var fdr = fs.openSync(srcFile, 'r');
            var fdw = fs.openSync(destFile, 'w');
            var bytesRead = 1;
            var pos = 0;
            while (bytesRead > 0) {
                bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
                fs.writeSync(fdw, buff, 0, bytesRead);
                pos += bytesRead;
            }
            fs.closeSync(fdr);
            fs.closeSync(fdw);
        };
        /**
         * Delete the folder and all of its content (rm -rf).
         * @param path path
         */
        FileUtil.deleteFolderRecursive = function (path) {
            var files = [];
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                files.forEach(function (file) {
                    var curPath = path + '/' + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        FileUtil.deleteFolderRecursive(curPath);
                    }
                    else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };
        /**
         * Delete folders content recursively, but do not delete folder.
         * Folder is left empty at the end.
         * @param path path
         */
        FileUtil.deleteFolderContentRecursive = function (path) {
            var files = [];
            if (fs.existsSync(path)) {
                files = fs.readdirSync(path);
                files.forEach(function (file) {
                    var curPath = path + '/' + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        FileUtil.deleteFolderRecursive(curPath);
                    }
                    else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
            }
        };
        /**
         * Delete a file.
         * @param path path
         */
        FileUtil.deleteFile = function (path) {
            fs.unlinkSync(path);
        };
        return FileUtil;
    }());

    /**
     * Helper class to parse ngx translate extraction pattern
     * and to decide wether a given message matches the pattern.
     */
    var NgxTranslateExtractionPattern = /** @class */ (function () {
        /**
         * Construct the pattern from given description string
         * @param extractionPatternString extractionPatternString
         * @throws an error, if there is a syntax error
         */
        function NgxTranslateExtractionPattern(extractionPatternString) {
            this.extractionPatternString = extractionPatternString;
            var parts = extractionPatternString.split('|');
            this._matchExplicitId = false;
            this._descriptionPatterns = [];
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part === '@@') {
                    if (this._matchExplicitId) {
                        throw new Error('extraction pattern must not contain @@ twice');
                    }
                    this._matchExplicitId = true;
                }
                else {
                    var errorString = this.checkValidDescriptionPattern(part);
                    if (errorString) {
                        throw new Error(errorString);
                    }
                    this._descriptionPatterns.push(part);
                }
            }
        }
        /**
         * Check, wether an explicitly set id matches the pattern.
         * @param id id
         * @return wether an explicitly set id matches the pattern.
         */
        NgxTranslateExtractionPattern.prototype.isExplicitIdMatched = function (id) {
            return id && this._matchExplicitId;
        };
        /**
         * Check, wether a given description matches the pattern.
         * @param description description
         * @return wether a given description matches the pattern.
         */
        NgxTranslateExtractionPattern.prototype.isDescriptionMatched = function (description) {
            return this._descriptionPatterns.indexOf(description) >= 0;
        };
        NgxTranslateExtractionPattern.prototype.checkValidDescriptionPattern = function (descriptionPattern) {
            if (!descriptionPattern) {
                return 'empty value not allowed';
            }
            if (/^[a-zA-Z_][a-zA-Z_-]*$/.test(descriptionPattern)) {
                return null; // it is ok
            }
            else {
                return 'description pattern must be an identifier containing only letters, digits, _ or -';
            }
        };
        return NgxTranslateExtractionPattern;
    }());

    var NgxTranslateExtractor = /** @class */ (function () {
        function NgxTranslateExtractor(messagesFile, extractionPatternString) {
            this.messagesFile = messagesFile;
            this.extractionPattern = new NgxTranslateExtractionPattern(extractionPatternString);
        }
        /**
         * Check, wether extractionPattern has valid syntax.
         * @param extractionPatternString extractionPatternString
         * @return null, if pattern is ok, string describing the error, if it is not ok.
         */
        NgxTranslateExtractor.checkPattern = function (extractionPatternString) {
            try {
                if (new NgxTranslateExtractionPattern(extractionPatternString)) {
                    return null;
                }
            }
            catch (error) {
                return error.message;
            }
            return null;
        };
        NgxTranslateExtractor.extract = function (messagesFile, extractionPattern, outputFile) {
            new NgxTranslateExtractor(messagesFile, extractionPattern).extractTo(outputFile);
        };
        /**
         * Extact messages and write them to a file.
         * @param outputFile outputFile
         */
        NgxTranslateExtractor.prototype.extractTo = function (outputFile) {
            var translations = this.toNgxTranslations(this.extract());
            if (translations && Object.keys(translations).length > 0) {
                FileUtil.replaceContent(outputFile, JSON.stringify(translations, null, 4), 'UTF-8');
            }
            else {
                if (FileUtil.exists(outputFile)) {
                    FileUtil.deleteFile(outputFile);
                }
            }
        };
        /**
         *  Extract messages and convert them to ngx translations.
         *  @return the translation objects.
         */
        NgxTranslateExtractor.prototype.extract = function () {
            var _this = this;
            var result = [];
            this.messagesFile.forEachTransUnit(function (tu) {
                var ngxId = _this.ngxTranslateIdFromTU(tu);
                if (ngxId) {
                    var messagetext = tu.targetContentNormalized().asDisplayString(ngxI18nsupportLib.NORMALIZATION_FORMAT_NGXTRANSLATE);
                    result.push({ id: ngxId, message: messagetext });
                }
            });
            return result;
        };
        /**
         * Check, wether this tu should be extracted for ngx-translate usage, and return its id for ngx-translate.
         * There are 2 possibilities:
         * 1. description is set to "ngx-translate" and meaning contains the id.
         * 2. id is explicitly set to a string.
         * @param tu tu
         * @return an ngx id or null, if this tu should not be extracted.
         */
        NgxTranslateExtractor.prototype.ngxTranslateIdFromTU = function (tu) {
            if (this.isExplicitlySetId(tu.id)) {
                if (this.extractionPattern.isExplicitIdMatched(tu.id)) {
                    return tu.id;
                }
                else {
                    return null;
                }
            }
            var description = tu.description();
            if (description && this.extractionPattern.isDescriptionMatched(description)) {
                return tu.meaning();
            }
        };
        /**
         * Test, wether ID was explicitly set (via i18n="@myid).
         * Just heuristic, an ID is explicitly, if it does not look like a generated one.
         * @param id id
         * @return wether ID was explicitly set (via i18n="@myid).
         */
        NgxTranslateExtractor.prototype.isExplicitlySetId = function (id) {
            if (isNullOrUndefined(id)) {
                return false;
            }
            // generated IDs are either decimal or sha1 hex
            var reForGeneratedId = /^[0-9a-f]{11,}$/;
            return !reForGeneratedId.test(id);
        };
        /**
         * Convert list of relevant TUs to ngx translations object.
         * @param msgList msgList
         */
        NgxTranslateExtractor.prototype.toNgxTranslations = function (msgList) {
            var _this = this;
            var translationObject = {};
            msgList.forEach(function (msg) {
                _this.putInTranslationObject(translationObject, msg);
            });
            return translationObject;
        };
        /**
         * Put a new messages into the translation data object.
         * If you add, e.g. "{id: 'myapp.example', message: 'test'}",
         * the translation object will then contain an object myapp that has property example:
         * {myapp: {
         *   example: 'test'
         *   }}
         * @param translationObject translationObject
         * @param msg msg
         */
        NgxTranslateExtractor.prototype.putInTranslationObject = function (translationObject, msg) {
            var firstPartOfId;
            var restOfId;
            var indexOfDot = msg.id.indexOf('.');
            if (indexOfDot === 0 || indexOfDot === (msg.id.length - 1)) {
                throw new Error('bad nxg-translate id "' + msg.id + '"');
            }
            if (indexOfDot < 0) {
                firstPartOfId = msg.id;
                restOfId = '';
            }
            else {
                firstPartOfId = msg.id.substring(0, indexOfDot);
                restOfId = msg.id.substring(indexOfDot + 1);
            }
            var object = translationObject[firstPartOfId];
            if (isNullOrUndefined(object)) {
                if (restOfId === '') {
                    translationObject[firstPartOfId] = msg.message;
                    return;
                }
                object = {};
                translationObject[firstPartOfId] = object;
            }
            else {
                if (restOfId === '') {
                    throw new Error('duplicate id praefix "' + msg.id + '"');
                }
            }
            this.putInTranslationObject(object, { id: restOfId, message: msg.message });
        };
        return NgxTranslateExtractor;
    }());
    NgxTranslateExtractor.DefaultExtractionPattern = '@@|ngx-translate';

    var PROFILE_CANDIDATES = ['package.json', '.angular-cli.json'];
    var XliffMergeParameters = /** @class */ (function () {
        function XliffMergeParameters() {
            this.errorsFound = [];
            this.warningsFound = [];
        }
        /**
         * Create Parameters.
         * @param options command options
         * @param profileContent given profile (if not, it is read from the profile path from options).
         */
        XliffMergeParameters.createFromOptions = function (options, profileContent) {
            var parameters = new XliffMergeParameters();
            parameters.configure(options, profileContent);
            return parameters;
        };
        /**
         * Read potential profile.
         * To be a candidate, file must exist and contain property "xliffmergeOptions".
         * @param profilePath path of profile
         * @return parsed content of file or null, if file does not exist or is not a profile candidate.
         */
        XliffMergeParameters.readProfileCandidate = function (profilePath) {
            var content;
            try {
                content = fs.readFileSync(profilePath, 'UTF-8');
            }
            catch (err) {
                return null;
            }
            var parsedContent = JSON.parse(content);
            if (parsedContent && parsedContent.xliffmergeOptions) {
                return parsedContent;
            }
            else {
                return null;
            }
        };
        /**
         * Initialize me from the profile content.
         * (public only for test usage).
         * @param options options given at runtime via command line
         * @param profileContent if null, read it from profile.
         */
        XliffMergeParameters.prototype.configure = function (options, profileContent) {
            this.errorsFound = [];
            this.warningsFound = [];
            if (!profileContent) {
                profileContent = this.readProfile(options);
            }
            var validProfile = (!!profileContent);
            if (options.quiet) {
                this._quiet = options.quiet;
            }
            if (options.verbose) {
                this._verbose = options.verbose;
            }
            if (validProfile) {
                this.initializeFromConfig(profileContent);
                // if languages are given as parameters, they ovveride everything said in profile
                if (!!options.languages && options.languages.length > 0) {
                    this._languages = options.languages;
                    if (!this._defaultLanguage) {
                        this._defaultLanguage = this._languages[0];
                    }
                }
                this.checkParameters();
            }
        };
        /**
         * Read profile.
         * @param options program options
         * @return the read profile (empty, if none, null if errors)
         */
        XliffMergeParameters.prototype.readProfile = function (options) {
            var e_1, _a;
            var profilePath = options.profilePath;
            if (!profilePath) {
                try {
                    for (var PROFILE_CANDIDATES_1 = __values(PROFILE_CANDIDATES), PROFILE_CANDIDATES_1_1 = PROFILE_CANDIDATES_1.next(); !PROFILE_CANDIDATES_1_1.done; PROFILE_CANDIDATES_1_1 = PROFILE_CANDIDATES_1.next()) {
                        var configfilename = PROFILE_CANDIDATES_1_1.value;
                        var profile = XliffMergeParameters.readProfileCandidate(configfilename);
                        if (profile) {
                            this.usedProfilePath = configfilename;
                            return profile;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (PROFILE_CANDIDATES_1_1 && !PROFILE_CANDIDATES_1_1.done && (_a = PROFILE_CANDIDATES_1.return)) _a.call(PROFILE_CANDIDATES_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return {};
            }
            var content;
            try {
                content = fs.readFileSync(profilePath, 'UTF-8');
            }
            catch (err) {
                this.errorsFound.push(new XliffMergeError('could not read profile "' + profilePath + '"'));
                return null;
            }
            this.usedProfilePath = profilePath;
            var profileContent = JSON.parse(content);
            // replace all pathes in options by absolute paths
            var xliffmergeOptions = profileContent.xliffmergeOptions;
            xliffmergeOptions.srcDir = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.srcDir);
            xliffmergeOptions.genDir = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.genDir);
            if (xliffmergeOptions.optionalMasterFilePath) {
                xliffmergeOptions.optionalMasterFilePath = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.optionalMasterFilePath);
            }
            xliffmergeOptions.apikeyfile = this.adjustPathToProfilePath(profilePath, xliffmergeOptions.apikeyfile);
            return profileContent;
        };
        XliffMergeParameters.prototype.adjustPathToProfilePath = function (profilePath, pathToAdjust) {
            if (!pathToAdjust || path.isAbsolute(pathToAdjust)) {
                return pathToAdjust;
            }
            return path.join(path.dirname(profilePath), pathToAdjust).replace(/\\/g, '/');
        };
        XliffMergeParameters.prototype.initializeFromConfig = function (profileContent) {
            if (!profileContent) {
                return;
            }
            var profile = profileContent.xliffmergeOptions;
            if (profile) {
                if (!isNullOrUndefined(profile.quiet)) {
                    this._quiet = profile.quiet;
                }
                if (!isNullOrUndefined(profile.verbose)) {
                    this._verbose = profile.verbose;
                }
                if (!isNullOrUndefined(profile.allowIdChange)) {
                    this._allowIdChange = profile.allowIdChange;
                }
                if (profile.defaultLanguage) {
                    this._defaultLanguage = profile.defaultLanguage;
                }
                if (profile.languages) {
                    this._languages = profile.languages;
                }
                if (profile.srcDir) {
                    this._srcDir = profile.srcDir;
                }
                if (profile.angularCompilerOptions) {
                    if (profile.angularCompilerOptions.genDir) {
                        this._genDir = profile.angularCompilerOptions.genDir;
                    }
                }
                if (profile.genDir) {
                    // this must be after angularCompilerOptions to be preferred
                    this._genDir = profile.genDir;
                }
                if (profile.optionalMasterFilePath) {
                    this._optionalMasterFilePath = profile.optionalMasterFilePath;
                }
                if (profile.i18nBaseFile) {
                    this._i18nBaseFile = profile.i18nBaseFile;
                }
                if (profile.i18nFile) {
                    this._i18nFile = profile.i18nFile;
                }
                if (profile.i18nFormat) {
                    this._i18nFormat = profile.i18nFormat;
                }
                if (profile.encoding) {
                    this._encoding = profile.encoding;
                }
                if (!isNullOrUndefined(profile.removeUnusedIds)) {
                    this._removeUnusedIds = profile.removeUnusedIds;
                }
                if (!isNullOrUndefined(profile.supportNgxTranslate)) {
                    this._supportNgxTranslate = profile.supportNgxTranslate;
                }
                if (!isNullOrUndefined(profile.ngxTranslateExtractionPattern)) {
                    this._ngxTranslateExtractionPattern = profile.ngxTranslateExtractionPattern;
                }
                if (!isNullOrUndefined(profile.useSourceAsTarget)) {
                    this._useSourceAsTarget = profile.useSourceAsTarget;
                }
                if (!isNullOrUndefined(profile.targetPraefix)) {
                    this._targetPraefix = profile.targetPraefix;
                }
                if (!isNullOrUndefined(profile.targetSuffix)) {
                    this._targetSuffix = profile.targetSuffix;
                }
                if (!isNullOrUndefined(profile.autotranslate)) {
                    this._autotranslate = profile.autotranslate;
                }
                if (!isNullOrUndefined(profile.beautifyOutput)) {
                    this._beautifyOutput = profile.beautifyOutput;
                }
                if (!isNullOrUndefined(profile.preserveOrder)) {
                    this._preserveOrder = profile.preserveOrder;
                }
                if (!isNullOrUndefined(profile.apikey)) {
                    this._apikey = profile.apikey;
                }
                if (!isNullOrUndefined(profile.apikeyfile)) {
                    this._apikeyfile = profile.apikeyfile;
                }
            }
            else {
                this.warningsFound.push('did not find "xliffmergeOptions" in profile, using defaults');
            }
        };
        /**
         * Check all Parameters, wether they are complete and consistent.
         * if something is wrong with the parameters, it is collected in errorsFound.
         */
        XliffMergeParameters.prototype.checkParameters = function () {
            var _this = this;
            this.checkLanguageSyntax(this.defaultLanguage());
            if (this.languages().length === 0) {
                this.errorsFound.push(new XliffMergeError('no languages specified'));
            }
            this.languages().forEach(function (lang) {
                _this.checkLanguageSyntax(lang);
            });
            var stats;
            var err;
            // srcDir should exists
            try {
                stats = fs.statSync(this.srcDir());
            }
            catch (e) {
                err = e;
            }
            if (!!err || !stats.isDirectory()) {
                this.errorsFound.push(new XliffMergeError('srcDir "' + this.srcDir() + '" is not a directory'));
            }
            // genDir should exists
            try {
                stats = fs.statSync(this.genDir());
            }
            catch (e) {
                err = e;
            }
            if (!!err || !stats.isDirectory()) {
                this.errorsFound.push(new XliffMergeError('genDir "' + this.genDir() + '" is not a directory'));
            }
            // master file MUST exist
            try {
                fs.accessSync(this.i18nFile(), fs.constants.R_OK);
            }
            catch (err) {
                this.errorsFound.push(new XliffMergeError('i18nFile "' + this.i18nFile() + '" is not readable'));
            }
            // i18nFormat must be xlf xlf2 or xmb
            if (!(this.i18nFormat() === 'xlf' || this.i18nFormat() === 'xlf2' || this.i18nFormat() === 'xmb')) {
                this.errorsFound.push(new XliffMergeError('i18nFormat "' + this.i18nFormat() + '" invalid, must be "xlf" or "xlf2" or "xmb"'));
            }
            // autotranslate requires api key
            if (this.autotranslate() && !this.apikey()) {
                this.errorsFound.push(new XliffMergeError('autotranslate requires an API key, please set one'));
            }
            // autotranslated languages must be in list of all languages
            this.autotranslatedLanguages().forEach(function (lang) {
                if (_this.languages().indexOf(lang) < 0) {
                    _this.errorsFound.push(new XliffMergeError('autotranslate language "' + lang + '" is not in list of languages'));
                }
                if (lang === _this.defaultLanguage()) {
                    _this.errorsFound.push(new XliffMergeError('autotranslate language "' + lang + '" cannot be translated, because it is the source language'));
                }
            });
            // ngx translate pattern check
            if (this.supportNgxTranslate()) {
                var checkResult = NgxTranslateExtractor.checkPattern(this.ngxTranslateExtractionPattern());
                if (!isNullOrUndefined(checkResult)) {
                    this.errorsFound.push(new XliffMergeError('ngxTranslateExtractionPattern "' + this.ngxTranslateExtractionPattern() + '": ' + checkResult));
                }
            }
            // targetPraefix and targetSuffix check
            if (!this.useSourceAsTarget()) {
                if (this.targetPraefix().length > 0) {
                    this.warningsFound.push('configured targetPraefix "' + this.targetPraefix() + '" will not be used because "useSourceAsTarget" is disabled"');
                }
                if (this.targetSuffix().length > 0) {
                    this.warningsFound.push('configured targetSuffix "' + this.targetSuffix() + '" will not be used because "useSourceAsTarget" is disabled"');
                }
            }
        };
        /**
         * Check syntax of language.
         * Must be compatible with XML Schema type xsd:language.
         * Pattern: [a-zA-Z]{1,8}((-|_)[a-zA-Z0-9]{1,8})*
         * @param lang language to check
         */
        XliffMergeParameters.prototype.checkLanguageSyntax = function (lang) {
            var pattern = /^[a-zA-Z]{1,8}([-_][a-zA-Z0-9]{1,8})*$/;
            if (!pattern.test(lang)) {
                this.errorsFound.push(new XliffMergeError('language "' + lang + '" is not valid'));
            }
        };
        XliffMergeParameters.prototype.allowIdChange = function () {
            return (isNullOrUndefined(this._allowIdChange)) ? false : this._allowIdChange;
        };
        XliffMergeParameters.prototype.optionalMasterFilePath = function (lang) {
            if (lang) {
                if (this._optionalMasterFilePath) {
                    return this._optionalMasterFilePath.replace("." + this.i18nFormat(), "." + lang + "." + this.i18nFormat());
                }
                return null;
            }
            else {
                return this._optionalMasterFilePath;
            }
        };
        XliffMergeParameters.prototype.verbose = function () {
            return (isNullOrUndefined(this._verbose)) ? false : this._verbose;
        };
        XliffMergeParameters.prototype.quiet = function () {
            return (isNullOrUndefined(this._quiet)) ? false : this._quiet;
        };
        /**
         * Debug output all parameters to commandOutput.
         */
        XliffMergeParameters.prototype.showAllParameters = function (commandOutput) {
            var e_2, _a;
            commandOutput.debug('xliffmerge Used Parameters:');
            commandOutput.debug('usedProfilePath:\t"%s"', this.usedProfilePath);
            commandOutput.debug('defaultLanguage:\t"%s"', this.defaultLanguage());
            commandOutput.debug('srcDir:\t"%s"', this.srcDir());
            commandOutput.debug('genDir:\t"%s"', this.genDir());
            commandOutput.debug('optionalMasterFilePath:\t"%s"', this.optionalMasterFilePath());
            commandOutput.debug('i18nBaseFile:\t"%s"', this.i18nBaseFile());
            commandOutput.debug('i18nFile:\t"%s"', this.i18nFile());
            commandOutput.debug('languages:\t%s', this.languages());
            try {
                for (var _b = __values(this.languages()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var language = _c.value;
                    commandOutput.debug('outputFile[%s]:\t%s', language, this.generatedI18nFile(language));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            commandOutput.debug('removeUnusedIds:\t%s', this.removeUnusedIds());
            commandOutput.debug('supportNgxTranslate:\t%s', this.supportNgxTranslate());
            if (this.supportNgxTranslate()) {
                commandOutput.debug('ngxTranslateExtractionPattern:\t%s', this.ngxTranslateExtractionPattern());
            }
            commandOutput.debug('useSourceAsTarget:\t%s', this.useSourceAsTarget());
            if (this.useSourceAsTarget()) {
                commandOutput.debug('targetPraefix:\t"%s"', this.targetPraefix());
                commandOutput.debug('targetSuffix:\t"%s"', this.targetSuffix());
            }
            commandOutput.debug('allowIdChange:\t%s', this.allowIdChange());
            commandOutput.debug('beautifyOutput:\t%s', this.beautifyOutput());
            commandOutput.debug('preserveOrder:\t%s', this.preserveOrder());
            commandOutput.debug('autotranslate:\t%s', this.autotranslate());
            if (this.autotranslate()) {
                commandOutput.debug('autotranslated languages:\t%s', this.autotranslatedLanguages());
                commandOutput.debug('apikey:\t%s', this.apikey() ? '****' : 'NOT SET');
                commandOutput.debug('apikeyfile:\t%s', this.apikeyfile());
            }
        };
        /**
         * Default-Language, default en.
         * @return default language
         */
        XliffMergeParameters.prototype.defaultLanguage = function () {
            return this._defaultLanguage ? this._defaultLanguage : 'en';
        };
        /**
         * Liste der zu bearbeitenden Sprachen.
         * @return languages
         */
        XliffMergeParameters.prototype.languages = function () {
            return this._languages ? this._languages : [];
        };
        /**
         * src directory, where the master xlif is located.
         * @return srcDir
         */
        XliffMergeParameters.prototype.srcDir = function () {
            return this._srcDir ? this._srcDir : '.';
        };
        /**
         * The base file name of the xlif file for input and output.
         * Default is messages
         * @return base file
         */
        XliffMergeParameters.prototype.i18nBaseFile = function () {
            return this._i18nBaseFile ? this._i18nBaseFile : 'messages';
        };
        /**
         * The master xlif file (the one generated by ng-xi18n).
         * Default is <srcDir>/<i18nBaseFile>.xlf.
         * @return master file
         */
        XliffMergeParameters.prototype.i18nFile = function () {
            return path.join(this.srcDir(), (this._i18nFile ? this._i18nFile : this.i18nBaseFile() + '.' + this.suffixForGeneratedI18nFile())).replace(/\\/g, '/');
        };
        /**
         * Format of the master xlif file.
         * Default is "xlf", possible are "xlf" or "xlf2" or "xmb".
         * @return format
         */
        XliffMergeParameters.prototype.i18nFormat = function () {
            return (this._i18nFormat ? this._i18nFormat : 'xlf');
        };
        /**
         * potentially to be generated I18n-File with the translations for one language.
         * @param lang language shortcut
         * @return Path of file
         */
        XliffMergeParameters.prototype.generatedI18nFile = function (lang) {
            return path.join(this.genDir(), this.i18nBaseFile() + '.' + lang + '.' + this.suffixForGeneratedI18nFile()).replace(/\\/g, '/');
        };
        XliffMergeParameters.prototype.suffixForGeneratedI18nFile = function () {
            switch (this.i18nFormat()) {
                case 'xlf':
                    return 'xlf';
                case 'xlf2':
                    return 'xlf';
                case 'xmb':
                    return 'xtb';
            }
        };
        /**
         * potentially to be generated translate-File for ngx-translate with the translations for one language.
         * @param lang language shortcut
         * @return Path of file
         */
        XliffMergeParameters.prototype.generatedNgxTranslateFile = function (lang) {
            return path.join(this.genDir(), this.i18nBaseFile() + '.' + lang + '.' + 'json').replace(/\\/g, '/');
        };
        /**
         * The encoding used to write new XLIFF-files.
         * @return encoding
         */
        XliffMergeParameters.prototype.encoding = function () {
            return this._encoding ? this._encoding : 'UTF-8';
        };
        /**
         * Output-Directory, where the output is written to.
         * Default is <srcDir>.
        */
        XliffMergeParameters.prototype.genDir = function () {
            return this._genDir ? this._genDir : this.srcDir();
        };
        XliffMergeParameters.prototype.removeUnusedIds = function () {
            return (isNullOrUndefined(this._removeUnusedIds)) ? true : this._removeUnusedIds;
        };
        XliffMergeParameters.prototype.supportNgxTranslate = function () {
            return (isNullOrUndefined(this._supportNgxTranslate)) ? false : this._supportNgxTranslate;
        };
        XliffMergeParameters.prototype.ngxTranslateExtractionPattern = function () {
            return (isNullOrUndefined(this._ngxTranslateExtractionPattern)) ?
                NgxTranslateExtractor.DefaultExtractionPattern : this._ngxTranslateExtractionPattern;
        };
        /**
         * Whether source must be used as target for new trans-units
         * Default is true
         */
        XliffMergeParameters.prototype.useSourceAsTarget = function () {
            return (isNullOrUndefined(this._useSourceAsTarget)) ? true : this._useSourceAsTarget;
        };
        /**
         * Praefix used for target when copying new trans-units
         * Default is ""
         */
        XliffMergeParameters.prototype.targetPraefix = function () {
            return (isNullOrUndefined(this._targetPraefix)) ? '' : this._targetPraefix;
        };
        /**
         * Suffix used for target when copying new trans-units
         * Default is ""
         */
        XliffMergeParameters.prototype.targetSuffix = function () {
            return (isNullOrUndefined(this._targetSuffix)) ? '' : this._targetSuffix;
        };
        /**
         * If set, run xml result through beautifier (pretty-data).
         */
        XliffMergeParameters.prototype.beautifyOutput = function () {
            return (isNullOrUndefined(this._beautifyOutput)) ? false : this._beautifyOutput;
        };
        /**
         * If set, order of new trans units will be as in master.
         * Otherwise they are added at the end.
         */
        XliffMergeParameters.prototype.preserveOrder = function () {
            return (isNullOrUndefined(this._preserveOrder)) ? true : this._preserveOrder;
        };
        /**
         * Whether to use autotranslate for new trans-units
         * Default is false
         */
        XliffMergeParameters.prototype.autotranslate = function () {
            if (isNullOrUndefined(this._autotranslate)) {
                return false;
            }
            if (isArray(this._autotranslate)) {
                return this._autotranslate.length > 0;
            }
            return this._autotranslate;
        };
        /**
         * Whether to use autotranslate for a given language.
         * @param lang language code.
         */
        XliffMergeParameters.prototype.autotranslateLanguage = function (lang) {
            return this.autotranslatedLanguages().indexOf(lang) >= 0;
        };
        /**
         * Return a list of languages to be autotranslated.
         */
        XliffMergeParameters.prototype.autotranslatedLanguages = function () {
            if (isNullOrUndefined(this._autotranslate) || this._autotranslate === false) {
                return [];
            }
            if (isArray(this._autotranslate)) {
                return this._autotranslate;
            }
            return this.languages().slice(1); // first is source language
        };
        /**
         * API key to be used for Google Translate
         * @return api key
         */
        XliffMergeParameters.prototype.apikey = function () {
            if (!isNullOrUndefined(this._apikey)) {
                return this._apikey;
            }
            else {
                var apikeyPath = this.apikeyfile();
                if (this.apikeyfile()) {
                    if (fs.existsSync(apikeyPath)) {
                        return FileUtil.read(apikeyPath, 'utf-8');
                    }
                    else {
                        throw new Error(util.format('api key file not found: API_KEY_FILE=%s', apikeyPath));
                    }
                }
                else {
                    return null;
                }
            }
        };
        /**
         * file name for API key to be used for Google Translate.
         * Explicitly set or read from env var API_KEY_FILE.
         * @return file of api key
         */
        XliffMergeParameters.prototype.apikeyfile = function () {
            if (this._apikeyfile) {
                return this._apikeyfile;
            }
            else if (process.env.API_KEY_FILE) {
                return process.env.API_KEY_FILE;
            }
            else {
                return null;
            }
        };
        return XliffMergeParameters;
    }());

    /**
     * Created by martin on 19.02.2017.
     */
    var pkg = null;
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
    var VERSION = (pkg ? pkg.version : 'unknown');

    /**
     * Created by martin on 10.03.2017.
     * Helper class to read XMl with a correct encoding.
     */
    var XmlReader = /** @class */ (function () {
        function XmlReader() {
        }
        /**
         * Read an xml-File.
         * @param path Path to file
         * @param encoding optional encoding of the xml.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @return file content and encoding found in the file.
         */
        XmlReader.readXmlFileContent = function (path, encoding) {
            if (!encoding) {
                encoding = XmlReader.DEFAULT_ENCODING;
            }
            var content = FileUtil.read(path, encoding);
            var foundEncoding = XmlReader.encodingFromXml(content);
            if (foundEncoding !== encoding) {
                // read again with the correct encoding
                content = FileUtil.read(path, foundEncoding);
            }
            return {
                content: content,
                encoding: foundEncoding
            };
        };
        /**
         * Read the encoding from the xml.
         * xml File starts with .. encoding=".."
         * @param xmlString xmlString
         * @return encoding
         */
        XmlReader.encodingFromXml = function (xmlString) {
            var index = xmlString.indexOf('encoding="');
            if (index < 0) {
                return this.DEFAULT_ENCODING; // default in xml if not explicitly set
            }
            var endIndex = xmlString.indexOf('"', index + 10); // 10 = length of 'encoding="'
            return xmlString.substring(index + 10, endIndex);
        };
        return XmlReader;
    }());
    XmlReader.DEFAULT_ENCODING = 'UTF-8';

    /**
     * Created by roobm on 21.03.2017.
     */
    /**
     * Helper class to read translation files depending on format.
     */
    var TranslationMessagesFileReader = /** @class */ (function () {
        function TranslationMessagesFileReader() {
        }
        /**
         * Read file function, result depends on format, either XliffFile or XmbFile.
         * @param i18nFormat format
         * @param path path
         * @param encoding encoding
         * @param optionalMasterFilePath optionalMasterFilePath
         * @return XliffFile
         */
        TranslationMessagesFileReader.fromFile = function (i18nFormat, path, encoding, optionalMasterFilePath) {
            var xmlContent = XmlReader.readXmlFileContent(path, encoding);
            var optionalMaster = TranslationMessagesFileReader.masterFileContent(optionalMasterFilePath, encoding);
            return ngxI18nsupportLib.TranslationMessagesFileFactory.fromFileContent(i18nFormat, xmlContent.content, path, xmlContent.encoding, optionalMaster);
        };
        /**
         * Read file function, result depends on format, either XliffFile or XmbFile.
         * @param path path
         * @param encoding encoding
         * @param optionalMasterFilePath optionalMasterFilePath
         * @return XliffFile
         */
        TranslationMessagesFileReader.fromUnknownFormatFile = function (path, encoding, optionalMasterFilePath) {
            var xmlContent = XmlReader.readXmlFileContent(path, encoding);
            var optionalMaster = TranslationMessagesFileReader.masterFileContent(optionalMasterFilePath, encoding);
            return ngxI18nsupportLib.TranslationMessagesFileFactory.fromUnknownFormatFileContent(xmlContent.content, path, xmlContent.encoding, optionalMaster);
        };
        /**
         * Read master xmb file
         * @param optionalMasterFilePath optionalMasterFilePath
         * @param encoding encoding
         * @return content and encoding of file
         */
        TranslationMessagesFileReader.masterFileContent = function (optionalMasterFilePath, encoding) {
            if (optionalMasterFilePath) {
                var masterXmlContent = XmlReader.readXmlFileContent(optionalMasterFilePath, encoding);
                return {
                    xmlContent: masterXmlContent.content,
                    path: optionalMasterFilePath,
                    encoding: masterXmlContent.encoding
                };
            }
            else {
                return null;
            }
        };
        /**
         * Save edited file.
         * @param messagesFile messagesFile
         * @param beautifyOutput Flag whether to use pretty-data to format the output.
         * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
         * See issue #64 for details.
         * Default is false.
         */
        TranslationMessagesFileReader.save = function (messagesFile, beautifyOutput) {
            FileUtil.replaceContent(messagesFile.filename(), messagesFile.editedContent(beautifyOutput), messagesFile.encoding());
        };
        return TranslationMessagesFileReader;
    }());

    var MAX_SEGMENTS = 128;
    var AutoTranslateService = /** @class */ (function () {
        function AutoTranslateService(apiKey) {
            this._request = request__namespace;
            this._apiKey = apiKey;
            this._rootUrl = 'https://translation.googleapis.com/';
        }
        /**
         * Strip region code and convert to lower
         * @param lang lang
         * @return lang without region code and in lower case.
         */
        AutoTranslateService.stripRegioncode = function (lang) {
            var langLower = lang.toLowerCase();
            for (var i = 0; i < langLower.length; i++) {
                var c = langLower.charAt(i);
                if (c < 'a' || c > 'z') {
                    return langLower.substring(0, i);
                }
            }
            return langLower;
        };
        /**
         * Change API key (just for tests).
         * @param apikey apikey
         */
        AutoTranslateService.prototype.setApiKey = function (apikey) {
            this._apiKey = apikey;
        };
        /**
         * Translate an array of messages at once.
         * @param messages the messages to be translated
         * @param from source language code
         * @param to target language code
         * @return Observable with translated messages or error
         */
        AutoTranslateService.prototype.translateMultipleStrings = function (messages, from, to) {
            var _this = this;
            // empty array needs no translation and always works ... (#78)
            if (messages.length === 0) {
                return rxjs.of([]);
            }
            if (!this._apiKey) {
                return rxjs.throwError('cannot autotranslate: no api key');
            }
            if (!from || !to) {
                return rxjs.throwError('cannot autotranslate: source and target language must be set');
            }
            from = AutoTranslateService.stripRegioncode(from);
            to = AutoTranslateService.stripRegioncode(to);
            var allRequests = this.splitMessagesToGoogleLimit(messages).map(function (partialMessages) {
                return _this.limitedTranslateMultipleStrings(partialMessages, from, to);
            });
            return rxjs.forkJoin(allRequests).pipe(operators.map(function (allTranslations) {
                var all = [];
                for (var i = 0; i < allTranslations.length; i++) {
                    all = all.concat(allTranslations[i]);
                }
                return all;
            }));
        };
        AutoTranslateService.prototype.splitMessagesToGoogleLimit = function (messages) {
            if (messages.length <= MAX_SEGMENTS) {
                return [messages];
            }
            var result = [];
            var currentPackage = [];
            var packageSize = 0;
            for (var i = 0; i < messages.length; i++) {
                currentPackage.push(messages[i]);
                packageSize++;
                if (packageSize >= MAX_SEGMENTS) {
                    result.push(currentPackage);
                    currentPackage = [];
                    packageSize = 0;
                }
            }
            if (currentPackage.length > 0) {
                result.push(currentPackage);
            }
            return result;
        };
        /**
         * Return translation request, but messages must be limited to google limits.
         * Not more that 128 single messages.
         * @param messages messages
         * @param from from
         * @param to to
         * @return the translated strings
         */
        AutoTranslateService.prototype.limitedTranslateMultipleStrings = function (messages, from, to) {
            var realUrl = this._rootUrl + 'language/translate/v2' + '?key=' + this._apiKey;
            var translateRequest = {
                q: messages,
                target: to,
                source: from,
            };
            var options = {
                url: realUrl,
                body: translateRequest,
                json: true,
            };
            return this.post(realUrl, options).pipe(operators.map(function (data) {
                var body = data.body;
                if (!body) {
                    throw new Error('no result received');
                }
                if (body.error) {
                    if (body.error.code === 400) {
                        if (body.error.message === 'Invalid Value') {
                            throw new Error(util.format('Translation from "%s" to "%s" not supported', from, to));
                        }
                        throw new Error(util.format('Invalid request: %s', body.error.message));
                    }
                    else {
                        throw new Error(util.format('Error %s: %s', body.error.code, body.error.message));
                    }
                }
                var result = body.data;
                return result.translations.map(function (translation) {
                    return translation.translatedText;
                });
            }));
        };
        /**
         * Function to do a POST HTTP request
         *
         * @param uri uri
         * @param options options
         *
         * @return response
         */
        AutoTranslateService.prototype.post = function (uri, options) {
            return this._call.apply(this, [].concat('post', uri, Object.assign({}, options || {})));
        };
        /**
         * Function to do a HTTP request for given method
         *
         * @param method method
         * @param uri uri
         * @param options options
         *
         * @return response
         *
         */
        AutoTranslateService.prototype._call = function (method, uri, options) {
            var _this = this;
            return rxjs.Observable.create(function (observer) {
                // build params array
                var params = [].concat(uri, Object.assign({}, options || {}), function (error, response, body) {
                    if (error) {
                        return observer.error(error);
                    }
                    observer.next(Object.assign({}, {
                        response: response,
                        body: body
                    }));
                    observer.complete();
                });
                // _call request method
                try {
                    _this._request[method].apply(_this._request, params);
                }
                catch (error) {
                    observer.error(error);
                }
            });
        };
        return AutoTranslateService;
    }());

    /**
     * Created by martin on 29.06.2017.
     */
    var AutoTranslateResult = /** @class */ (function () {
        function AutoTranslateResult(_success, _details) {
            this._success = _success;
            this._details = _details;
        }
        AutoTranslateResult.prototype.success = function () {
            return this._success;
        };
        return AutoTranslateResult;
    }());

    /**
     * A report about a run of Google Translate over all untranslated unit.
     * * Created by martin on 29.06.2017.
     */
    var AutoTranslateSummaryReport = /** @class */ (function () {
        function AutoTranslateSummaryReport(from, to) {
            this._from = from;
            this._to = to;
            this._total = 0;
            this._ignored = 0;
            this._success = 0;
            this._failed = 0;
        }
        /**
         * Set error if total call failed (e.g. "invalid api key" or "no connection" ...)
         * @param error error
         * @param total total
         */
        AutoTranslateSummaryReport.prototype.setError = function (error, total) {
            this._error = error;
            this._total = total;
            this._failed = total;
        };
        AutoTranslateSummaryReport.prototype.error = function () {
            return this._error;
        };
        AutoTranslateSummaryReport.prototype.setIgnored = function (ignored) {
            this._total += ignored;
            this._ignored = ignored;
        };
        /**
         * Add a single result to the summary.
         * @param tu tu
         * @param result result
         */
        AutoTranslateSummaryReport.prototype.addSingleResult = function (tu, result) {
            this._total++;
            if (result.success()) {
                this._success++;
            }
            else {
                this._failed++;
            }
        };
        /**
         * Merge another summary into this one.
         * @param anotherSummary anotherSummary
         */
        AutoTranslateSummaryReport.prototype.merge = function (anotherSummary) {
            if (!this._error) {
                this._error = anotherSummary._error;
            }
            this._total += anotherSummary.total();
            this._ignored += anotherSummary.ignored();
            this._success += anotherSummary.success();
            this._failed += anotherSummary.failed();
        };
        AutoTranslateSummaryReport.prototype.total = function () {
            return this._total;
        };
        AutoTranslateSummaryReport.prototype.ignored = function () {
            return this._ignored;
        };
        AutoTranslateSummaryReport.prototype.success = function () {
            return this._success;
        };
        AutoTranslateSummaryReport.prototype.failed = function () {
            return this._failed;
        };
        /**
         * Human readable version of report
         */
        AutoTranslateSummaryReport.prototype.content = function () {
            var result;
            if (this._error) {
                result = util.format('Auto translation from "%s" to "%s" failed: "%s", failed units: %s', this._from, this._to, this._error, this._failed);
            }
            else {
                result = util.format('Auto translation from "%s" to "%s", total auto translated units: %s, ignored: %s, succesful: %s, failed: %s', this._from, this._to, this._total, this._ignored, this._success, this._failed);
            }
            return result;
        };
        return AutoTranslateSummaryReport;
    }());

    /**
     * Created by martin on 07.07.2017.
     * Service to autotranslate Transunits via Google Translate.
     */
    var XliffMergeAutoTranslateService = /** @class */ (function () {
        function XliffMergeAutoTranslateService(apikey) {
            this.autoTranslateService = new AutoTranslateService(apikey);
        }
        /**
         * Auto translate file via Google Translate.
         * Will translate all new units in file.
         * @param from from
         * @param to to
         * @param languageSpecificMessagesFile languageSpecificMessagesFile
         * @return a promise with the execution result as a summary report.
         */
        XliffMergeAutoTranslateService.prototype.autoTranslate = function (from, to, languageSpecificMessagesFile) {
            return rxjs.forkJoin(__spread([
                this.doAutoTranslateNonICUMessages(from, to, languageSpecificMessagesFile)
            ], this.doAutoTranslateICUMessages(from, to, languageSpecificMessagesFile)))
                .pipe(operators.map(function (summaries) {
                var summary = summaries[0];
                for (var i = 1; i < summaries.length; i++) {
                    summary.merge(summaries[i]);
                }
                return summary;
            }));
        };
        /**
         * Collect all units that are untranslated.
         * @param languageSpecificMessagesFile languageSpecificMessagesFile
         * @return all untranslated units
         */
        XliffMergeAutoTranslateService.prototype.allUntranslatedTUs = function (languageSpecificMessagesFile) {
            // collect all units, that should be auto translated
            var allUntranslated = [];
            languageSpecificMessagesFile.forEachTransUnit(function (tu) {
                if (tu.targetState() === ngxI18nsupportLib.STATE_NEW) {
                    allUntranslated.push(tu);
                }
            });
            return allUntranslated;
        };
        XliffMergeAutoTranslateService.prototype.doAutoTranslateNonICUMessages = function (from, to, languageSpecificMessagesFile) {
            var _this = this;
            var allUntranslated = this.allUntranslatedTUs(languageSpecificMessagesFile);
            var allTranslatable = allUntranslated.filter(function (tu) { return isNullOrUndefined(tu.sourceContentNormalized().getICUMessage()); });
            var allMessages = allTranslatable.map(function (tu) {
                return tu.sourceContentNormalized().asDisplayString();
            });
            return this.autoTranslateService.translateMultipleStrings(allMessages, from, to)
                .pipe(
            // #94 google translate might return &#.. entity refs, that must be decoded
            operators.map(function (translations) { return translations.map(function (encodedTranslation) { return entityDecoderLib.decode(encodedTranslation); }); }), operators.map(function (translations) {
                var summary = new AutoTranslateSummaryReport(from, to);
                summary.setIgnored(allUntranslated.length - allTranslatable.length);
                for (var i = 0; i < translations.length; i++) {
                    var tu = allTranslatable[i];
                    var translationText = translations[i];
                    var result = _this.autoTranslateNonICUUnit(tu, translationText);
                    summary.addSingleResult(tu, result);
                }
                return summary;
            }), operators.catchError(function (err) {
                var failSummary = new AutoTranslateSummaryReport(from, to);
                failSummary.setError(err.message, allMessages.length);
                return rxjs.of(failSummary);
            }));
        };
        XliffMergeAutoTranslateService.prototype.doAutoTranslateICUMessages = function (from, to, languageSpecificMessagesFile) {
            var _this = this;
            var allUntranslated = this.allUntranslatedTUs(languageSpecificMessagesFile);
            var allTranslatableICU = allUntranslated.filter(function (tu) { return !isNullOrUndefined(tu.sourceContentNormalized().getICUMessage()); });
            return allTranslatableICU.map(function (tu) {
                return _this.doAutoTranslateICUMessage(from, to, tu);
            });
        };
        /**
         * Translate single ICU Messages.
         * @param from from
         * @param to to
         * @param tu transunit to translate (must contain ICU Message)
         * @return summary report
         */
        XliffMergeAutoTranslateService.prototype.doAutoTranslateICUMessage = function (from, to, tu) {
            var _this = this;
            var icuMessage = tu.sourceContentNormalized().getICUMessage();
            var categories = icuMessage.getCategories();
            // check for nested ICUs, we do not support that
            if (categories.find(function (category) { return !isNullOrUndefined(category.getMessageNormalized().getICUMessage()); })) {
                var summary = new AutoTranslateSummaryReport(from, to);
                summary.setIgnored(1);
                return rxjs.of(summary);
            }
            var allMessages = categories.map(function (category) { return category.getMessageNormalized().asDisplayString(); });
            return this.autoTranslateService.translateMultipleStrings(allMessages, from, to)
                .pipe(
            // #94 google translate might return &#.. entity refs, that must be decoded
            operators.map(function (translations) { return translations.map(function (encodedTranslation) { return entityDecoderLib.decode(encodedTranslation); }); }), operators.map(function (translations) {
                var summary = new AutoTranslateSummaryReport(from, to);
                var icuTranslation = {};
                for (var i = 0; i < translations.length; i++) {
                    icuTranslation[categories[i].getCategory()] = translations[i];
                }
                var result = _this.autoTranslateICUUnit(tu, icuTranslation);
                summary.addSingleResult(tu, result);
                return summary;
            }), operators.catchError(function (err) {
                var failSummary = new AutoTranslateSummaryReport(from, to);
                failSummary.setError(err.message, allMessages.length);
                return rxjs.of(failSummary);
            }));
        };
        XliffMergeAutoTranslateService.prototype.autoTranslateNonICUUnit = function (tu, translatedMessage) {
            return this.autoTranslateUnit(tu, tu.sourceContentNormalized().translate(translatedMessage));
        };
        XliffMergeAutoTranslateService.prototype.autoTranslateICUUnit = function (tu, translation) {
            return this.autoTranslateUnit(tu, tu.sourceContentNormalized().translateICUMessage(translation));
        };
        XliffMergeAutoTranslateService.prototype.autoTranslateUnit = function (tu, translatedMessage) {
            var errors = translatedMessage.validate();
            var warnings = translatedMessage.validateWarnings();
            if (!isNullOrUndefined(errors)) {
                return new AutoTranslateResult(false, 'errors detected, not translated');
            }
            else if (!isNullOrUndefined(warnings)) {
                return new AutoTranslateResult(false, 'warnings detected, not translated');
            }
            else {
                tu.translate(translatedMessage);
                return new AutoTranslateResult(true, null); // success
            }
        };
        return XliffMergeAutoTranslateService;
    }());

    /**
     * Created by martin on 17.02.2017.
     * XliffMerge - read xliff or xmb file and put untranslated parts in language specific xliff or xmb files.
     *
     */
    var XliffMerge = /** @class */ (function () {
        function XliffMerge(commandOutput, options) {
            this.commandOutput = commandOutput;
            this.options = options;
            this.parameters = null;
        }
        XliffMerge.main = function (argv) {
            var options = XliffMerge.parseArgs(argv);
            if (options) {
                new XliffMerge(new CommandOutput(process.stdout), options).run(function (result) {
                    process.exit(result);
                });
            }
        };
        XliffMerge.parseArgs = function (argv) {
            var _a;
            var options = {
                languages: []
            };
            for (var i = 1; i < argv.length; i++) {
                var arg = argv[i];
                if (arg === '--version' || arg === '-version') {
                    console.log('xliffmerge ' + VERSION);
                }
                else if (arg === '--verbose' || arg === '-v') {
                    options.verbose = true;
                }
                else if (arg === '--profile' || arg === '-p') {
                    i++;
                    if (i >= argv.length) {
                        console.log('missing config file');
                        XliffMerge.showUsage();
                        return null;
                    }
                    else {
                        options.profilePath = argv[i];
                    }
                }
                else if (arg === '--quiet' || arg === '-q') {
                    options.quiet = true;
                }
                else if (arg === '--language' || arg === '-l') {
                    i++;
                    if (i >= argv.length) {
                        console.log('missing language');
                        return null;
                    }
                    else {
                        if (argv[i].indexOf(',') !== -1) {
                            var newLocal = argv[i].split(',');
                            (_a = options.languages).push.apply(_a, __spread(newLocal));
                        }
                        else {
                            options.languages.push(argv[i]);
                        }
                    }
                }
                else if (arg === '--help' || arg === '-help' || arg === '-h') {
                    XliffMerge.showUsage();
                }
                else if (arg.length > 0 && arg.charAt(0) === '-') {
                    console.log('unknown option');
                    return null;
                }
                else {
                    //options.languages.push(arg);
                }
            }
            return options;
        };
        XliffMerge.showUsage = function () {
            console.log('usage: xliffmerge <option>* <language>*');
            console.log('Options');
            console.log('\t-p|--profile a json configuration file containing all relevant parameters.');
            console.log('\t\tfor details please consult the home page https://github.com/martinroob/ngx-i18nsupport');
            console.log('\t-v|--verbose show some output for debugging purposes');
            console.log('\t-q|--quiet only show errors, nothing else');
            console.log('\t-version|--version show version string');
            console.log('');
            console.log('\t<language> has to be a valid language short string, e,g. "en", "de", "de-ch"');
        };
        /**
         * For Tests, create instance with given profile
         * @param commandOutput commandOutput
         * @param options options
         * @param profileContent profileContent
         */
        XliffMerge.createFromOptions = function (commandOutput, options, profileContent) {
            var instance = new XliffMerge(commandOutput, options);
            instance.parameters = XliffMergeParameters.createFromOptions(options, profileContent);
            return instance;
        };
        /**
         * Run the command.
         * This runs async.
         * @param callbackFunction when command is executed, called with the return code (0 for ok), if given.
         * @param errorFunction callbackFunction for error handling
         */
        XliffMerge.prototype.run = function (callbackFunction, errorFunction) {
            this.runAsync()
                .subscribe(function (retcode) {
                if (!isNullOrUndefined(callbackFunction)) {
                    callbackFunction(retcode);
                }
            }, function (error) {
                if (!isNullOrUndefined(errorFunction)) {
                    errorFunction(error);
                }
            });
        };
        /**
         * Execute merge-Process.
         * @return Async operation, on completion returns retcode 0=ok, other = error.
         */
        XliffMerge.prototype.runAsync = function () {
            var e_1, _a, e_2, _b;
            var _this = this;
            if (this.options && this.options.quiet) {
                this.commandOutput.setQuiet();
            }
            if (this.options && this.options.verbose) {
                this.commandOutput.setVerbose();
            }
            if (!this.parameters) {
                this.parameters = XliffMergeParameters.createFromOptions(this.options);
            }
            this.commandOutput.info('xliffmerge version %s', VERSION);
            if (this.parameters.verbose()) {
                this.parameters.showAllParameters(this.commandOutput);
            }
            if (this.parameters.errorsFound.length > 0) {
                try {
                    for (var _c = __values(this.parameters.errorsFound), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var err = _d.value;
                        this.commandOutput.error(err.message);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return rxjs.of(-1);
            }
            if (this.parameters.warningsFound.length > 0) {
                try {
                    for (var _e = __values(this.parameters.warningsFound), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var warn = _f.value;
                        this.commandOutput.warn(warn);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            this.readMaster();
            if (this.parameters.autotranslate()) {
                this.autoTranslateService = new XliffMergeAutoTranslateService(this.parameters.apikey());
            }
            var executionForAllLanguages = [];
            this.parameters.languages().forEach(function (lang) {
                executionForAllLanguages.push(_this.processLanguage(lang));
            });
            return rxjs.forkJoin(executionForAllLanguages).pipe(operators.map(function (retcodes) { return _this.totalRetcode(retcodes); }));
        };
        /**
         * Give an array of retcodes for the different languages, return the total retcode.
         * If all are 0, it is 0, otherwise the first non zero.
         * @param retcodes retcodes
         * @return number
         */
        XliffMerge.prototype.totalRetcode = function (retcodes) {
            for (var i = 0; i < retcodes.length; i++) {
                if (retcodes[i] !== 0) {
                    return retcodes[i];
                }
            }
            return 0;
        };
        /**
         * Return the name of the generated file for given lang.
         * @param lang language
         * @return name of generated file
         */
        XliffMerge.prototype.generatedI18nFile = function (lang) {
            return this.parameters.generatedI18nFile(lang);
        };
        /**
         * Return the name of the generated ngx-translation file for given lang.
         * @param lang language
         * @return name of translate file
         */
        XliffMerge.prototype.generatedNgxTranslateFile = function (lang) {
            return this.parameters.generatedNgxTranslateFile(lang);
        };
        /**
         * Warnings found during the run.
         * @return warnings
         */
        XliffMerge.prototype.warnings = function () {
            return this.parameters.warningsFound;
        };
        XliffMerge.prototype.readMaster = function () {
            var _this = this;
            try {
                this.master = TranslationMessagesFileReader.fromFile(this.parameters.i18nFormat(), this.parameters.i18nFile(), this.parameters.encoding());
                this.master.warnings().forEach(function (warning) {
                    _this.commandOutput.warn(warning);
                });
                var count = this.master.numberOfTransUnits();
                var missingIdCount = this.master.numberOfTransUnitsWithMissingId();
                this.commandOutput.info('master contains %s trans-units', count);
                if (missingIdCount > 0) {
                    this.commandOutput.warn('master contains %s trans-units, but there are %s without id', count, missingIdCount);
                }
                var sourceLang = this.master.sourceLanguage();
                if (sourceLang && sourceLang !== this.parameters.defaultLanguage()) {
                    this.commandOutput.warn('master says to have source-language="%s", should be "%s" (your defaultLanguage)', sourceLang, this.parameters.defaultLanguage());
                    this.master.setSourceLanguage(this.parameters.defaultLanguage());
                    TranslationMessagesFileReader.save(this.master, this.parameters.beautifyOutput());
                    this.commandOutput.warn('changed master source-language="%s" to "%s"', sourceLang, this.parameters.defaultLanguage());
                }
            }
            catch (err) {
                if (err instanceof XliffMergeError) {
                    this.commandOutput.error(err.message);
                    return rxjs.of(-1);
                }
                else {
                    // unhandled
                    var currentFilename = this.parameters.i18nFile();
                    var filenameString = (currentFilename) ? util.format('file "%s", ', currentFilename) : '';
                    this.commandOutput.error(filenameString + 'oops ' + err);
                    throw err;
                }
            }
        };
        /**
         * Process the given language.
         * Async operation.
         * @param lang language
         * @return on completion 0 for ok, other for error
         */
        XliffMerge.prototype.processLanguage = function (lang) {
            var _this = this;
            this.commandOutput.debug('processing language %s', lang);
            var languageXliffFile = this.parameters.generatedI18nFile(lang);
            var currentFilename = languageXliffFile;
            var result;
            if (!FileUtil.exists(languageXliffFile)) {
                result = this.createUntranslatedXliff(lang, languageXliffFile);
            }
            else {
                result = this.mergeMasterTo(lang, languageXliffFile);
            }
            return result
                .pipe(operators.map(function () {
                if (_this.parameters.supportNgxTranslate()) {
                    var languageSpecificMessagesFile = TranslationMessagesFileReader.fromFile(_this.translationFormat(_this.parameters.i18nFormat()), languageXliffFile, _this.parameters.encoding(), _this.master.filename());
                    NgxTranslateExtractor.extract(languageSpecificMessagesFile, _this.parameters.ngxTranslateExtractionPattern(), _this.parameters.generatedNgxTranslateFile(lang));
                }
                return 0;
            }), operators.catchError(function (err) {
                if (err instanceof XliffMergeError) {
                    _this.commandOutput.error(err.message);
                    return rxjs.of(-1);
                }
                else {
                    // unhandled
                    var filenameString = (currentFilename) ? util.format('file "%s", ', currentFilename) : '';
                    _this.commandOutput.error(filenameString + 'oops ' + err);
                    throw err;
                }
            }));
        };
        /**
         * create a new file for the language, which contains no translations, but all keys.
         * in principle, this is just a copy of the master with target-language set.
         * @param lang language
         * @param languageXliffFilePath name of file
         */
        XliffMerge.prototype.createUntranslatedXliff = function (lang, languageXliffFilePath) {
            var _this = this;
            // copy master ...
            // and set target-language
            // and copy source to target if necessary
            var isDefaultLang = (lang === this.parameters.defaultLanguage());
            this.master.setNewTransUnitTargetPraefix(this.parameters.targetPraefix());
            this.master.setNewTransUnitTargetSuffix(this.parameters.targetSuffix());
            var optionalMaster;
            if (this.parameters.optionalMasterFilePath(lang)) {
                optionalMaster = TranslationMessagesFileReader.masterFileContent(this.parameters.optionalMasterFilePath(lang), this.parameters.encoding());
            }
            var languageSpecificMessagesFile = this.master.createTranslationFileForLang(lang, languageXliffFilePath, isDefaultLang, this.parameters.useSourceAsTarget(), optionalMaster);
            return this.autoTranslate(this.master.sourceLanguage(), lang, languageSpecificMessagesFile).pipe(operators.map(function ( /* summary */) {
                // write it to file
                TranslationMessagesFileReader.save(languageSpecificMessagesFile, _this.parameters.beautifyOutput());
                _this.commandOutput.info('created new file "%s" for target-language="%s"', languageXliffFilePath, lang);
                if (!isDefaultLang) {
                    _this.commandOutput.warn('please translate file "%s" to target-language="%s"', languageXliffFilePath, lang);
                }
                return null;
            }));
        };
        /**
         * Map the input format to the format of the translation.
         * Normally they are the same but for xmb the translation format is xtb.
         * @param i18nFormat format
         */
        XliffMerge.prototype.translationFormat = function (i18nFormat) {
            if (i18nFormat === ngxI18nsupportLib.FORMAT_XMB) {
                return ngxI18nsupportLib.FORMAT_XTB;
            }
            else {
                return i18nFormat;
            }
        };
        /**
         * Merge all
         * @param lang language
         * @param languageXliffFilePath filename
         */
        XliffMerge.prototype.mergeMasterTo = function (lang, languageXliffFilePath) {
            var _this = this;
            // read lang specific file
            var languageSpecificMessagesFile = TranslationMessagesFileReader.fromFile(this.translationFormat(this.parameters.i18nFormat()), languageXliffFilePath, this.parameters.encoding(), this.parameters.optionalMasterFilePath(lang));
            var isDefaultLang = (lang === this.parameters.defaultLanguage());
            var newCount = 0;
            var correctSourceContentCount = 0;
            var correctSourceRefCount = 0;
            var correctDescriptionOrMeaningCount = 0;
            var idChangedCount = 0;
            languageSpecificMessagesFile.setNewTransUnitTargetPraefix(this.parameters.targetPraefix());
            languageSpecificMessagesFile.setNewTransUnitTargetSuffix(this.parameters.targetSuffix());
            var lastProcessedUnit = null;
            this.master.forEachTransUnit(function (masterTransUnit) {
                var transUnit = languageSpecificMessagesFile.transUnitWithId(masterTransUnit.id);
                var optionalTransUnit = languageSpecificMessagesFile.optionalMasterTransUnitWithId(masterTransUnit.id);
                if (!transUnit && optionalTransUnit) {
                    // If we dont have a transunit in the language file but there is one in the language master file we use the language master one instead.
                    transUnit = optionalTransUnit;
                }
                if (!transUnit) {
                    // oops, no translation, must be a new key, so add it
                    var newUnit = void 0;
                    if (_this.parameters.allowIdChange()
                        && (newUnit = _this.processChangedIdUnit(masterTransUnit, languageSpecificMessagesFile, lastProcessedUnit))) {
                        lastProcessedUnit = newUnit;
                        idChangedCount++;
                    }
                    else {
                        lastProcessedUnit = languageSpecificMessagesFile.importNewTransUnit(masterTransUnit, isDefaultLang, _this.parameters.useSourceAsTarget(), (_this.parameters.preserveOrder()) ? lastProcessedUnit : undefined);
                        newCount++;
                    }
                }
                else {
                    // check for changed source content and change it if needed
                    // (can only happen if ID is explicitely set, otherwise ID would change if source content is changed.
                    if (transUnit.supportsSetSourceContent() && !_this.areSourcesNearlyEqual(masterTransUnit, transUnit)) {
                        transUnit.setSourceContent(masterTransUnit.sourceContent());
                        if (isDefaultLang) {
                            // #81 changed source must be copied to target for default lang
                            transUnit.translate(masterTransUnit.sourceContent());
                            transUnit.setTargetState(ngxI18nsupportLib.STATE_FINAL);
                        }
                        else {
                            if (transUnit.targetState() === ngxI18nsupportLib.STATE_FINAL) {
                                // source is changed, so translation has to be checked again
                                transUnit.setTargetState(ngxI18nsupportLib.STATE_TRANSLATED);
                            }
                        }
                        correctSourceContentCount++;
                    }
                    // check for missing or changed source ref and add it if needed
                    if (transUnit.supportsSetSourceReferences()
                        && !_this.areSourceReferencesEqual(masterTransUnit.sourceReferences(), transUnit.sourceReferences())) {
                        transUnit.setSourceReferences(masterTransUnit.sourceReferences());
                        correctSourceRefCount++;
                    }
                    // check for changed description or meaning
                    if (transUnit.supportsSetDescriptionAndMeaning()) {
                        var changed = false;
                        if (transUnit.description() !== masterTransUnit.description()) {
                            transUnit.setDescription(masterTransUnit.description());
                            changed = true;
                        }
                        if (transUnit.meaning() !== masterTransUnit.meaning()) {
                            transUnit.setMeaning(masterTransUnit.meaning());
                            changed = true;
                        }
                        if (changed) {
                            correctDescriptionOrMeaningCount++;
                        }
                    }
                    lastProcessedUnit = transUnit;
                }
            });
            if (newCount > 0) {
                this.commandOutput.warn('merged %s trans-units from master to "%s"', newCount, lang);
            }
            if (correctSourceContentCount > 0) {
                this.commandOutput.warn('transferred %s changed source content from master to "%s"', correctSourceContentCount, lang);
            }
            if (correctSourceRefCount > 0) {
                this.commandOutput.warn('transferred %s source references from master to "%s"', correctSourceRefCount, lang);
            }
            if (idChangedCount > 0) {
                this.commandOutput.warn('found %s changed id\'s in "%s"', idChangedCount, lang);
            }
            if (correctDescriptionOrMeaningCount > 0) {
                this.commandOutput.warn('transferred %s changed descriptions/meanings from master to "%s"', correctDescriptionOrMeaningCount, lang);
            }
            // remove all elements that are no longer used
            var removeCount = 0;
            languageSpecificMessagesFile.forEachTransUnit(function (transUnit) {
                var existsInMaster = !isNullOrUndefined(_this.master.transUnitWithId(transUnit.id));
                if (!existsInMaster) {
                    if (_this.parameters.removeUnusedIds()) {
                        languageSpecificMessagesFile.removeTransUnitWithId(transUnit.id);
                    }
                    removeCount++;
                }
            });
            if (removeCount > 0) {
                if (this.parameters.removeUnusedIds()) {
                    this.commandOutput.warn('removed %s unused trans-units in "%s"', removeCount, lang);
                }
                else {
                    this.commandOutput.warn('keeping %s unused trans-units in "%s", because removeUnused is disabled', removeCount, lang);
                }
            }
            if (newCount === 0 && removeCount === 0 && correctSourceContentCount === 0
                && correctSourceRefCount === 0 && correctDescriptionOrMeaningCount === 0) {
                this.commandOutput.info('file for "%s" was up to date', lang);
                return rxjs.of(null);
            }
            else {
                return this.autoTranslate(this.master.sourceLanguage(), lang, languageSpecificMessagesFile)
                    .pipe(operators.map(function () {
                    // write it to file
                    TranslationMessagesFileReader.save(languageSpecificMessagesFile, _this.parameters.beautifyOutput());
                    _this.commandOutput.info('updated file "%s" for target-language="%s"', languageXliffFilePath, lang);
                    if (newCount > 0 && !isDefaultLang) {
                        _this.commandOutput.warn('please translate file "%s" to target-language="%s"', languageXliffFilePath, lang);
                    }
                    return null;
                }));
            }
        };
        /**
         * Handle the case of changed id due to small white space changes.
         * @param masterTransUnit unit in master file
         * @param languageSpecificMessagesFile translation file
         * @param lastProcessedUnit Unit before the one processed here. New unit will be inserted after this one.
         * @return processed unit, if done, null if no changed unit found
         */
        XliffMerge.prototype.processChangedIdUnit = function (masterTransUnit, languageSpecificMessagesFile, lastProcessedUnit) {
            var _this = this;
            var changedTransUnit = null;
            languageSpecificMessagesFile.forEachTransUnit(function (languageTransUnit) {
                if (_this.areSourcesNearlyEqual(languageTransUnit, masterTransUnit)) {
                    changedTransUnit = languageTransUnit;
                }
            });
            if (!changedTransUnit) {
                return null;
            }
            var mergedTransUnit = languageSpecificMessagesFile.importNewTransUnit(masterTransUnit, false, false, (this.parameters.preserveOrder()) ? lastProcessedUnit : undefined);
            var translatedContent = changedTransUnit.targetContent();
            if (translatedContent) { // issue #68 set translated only, if it is really translated
                mergedTransUnit.translate(translatedContent);
                mergedTransUnit.setTargetState(ngxI18nsupportLib.STATE_TRANSLATED);
            }
            return mergedTransUnit;
        };
        /**
         * test wether the sources of 2 trans units are equal ignoring white spaces.
         * @param tu1 tu1
         * @param tu2 tu2
         */
        XliffMerge.prototype.areSourcesNearlyEqual = function (tu1, tu2) {
            if ((tu1 && !tu2) || (tu2 && !tu1)) {
                return false;
            }
            var tu1Normalized = tu1.sourceContentNormalized();
            var tu2Normalized = tu2.sourceContentNormalized();
            if (tu1Normalized.isICUMessage()) {
                if (tu2Normalized.isICUMessage()) {
                    var icu1Normalized = tu1Normalized.getICUMessage().asNativeString().trim();
                    var icu2Normalized = tu2Normalized.getICUMessage().asNativeString().trim();
                    return icu1Normalized === icu2Normalized;
                }
                else {
                    return false;
                }
            }
            if (tu1Normalized.containsICUMessageRef()) {
                var icuref1Normalized = tu1Normalized.asNativeString().trim();
                var icuref2Normalized = tu2Normalized.asNativeString().trim();
                return icuref1Normalized === icuref2Normalized;
            }
            var s1Normalized = tu1Normalized.asDisplayString(ngxI18nsupportLib.NORMALIZATION_FORMAT_DEFAULT).trim();
            var s2Normalized = tu2Normalized.asDisplayString(ngxI18nsupportLib.NORMALIZATION_FORMAT_DEFAULT).trim();
            return s1Normalized === s2Normalized;
        };
        XliffMerge.prototype.areSourceReferencesEqual = function (ref1, ref2) {
            if ((isNullOrUndefined(ref1) && !isNullOrUndefined(ref2)) || (isNullOrUndefined(ref2) && !isNullOrUndefined(ref1))) {
                return false;
            }
            if (isNullOrUndefined(ref1) && isNullOrUndefined(ref2)) {
                return true;
            }
            // bot refs are set now, convert to set to compare them
            var set1 = new Set();
            ref1.forEach(function (ref) { set1.add(ref.sourcefile + ':' + ref.linenumber); });
            var set2 = new Set();
            ref2.forEach(function (ref) { set2.add(ref.sourcefile + ':' + ref.linenumber); });
            if (set1.size !== set2.size) {
                return false;
            }
            var match = true;
            set2.forEach(function (ref) {
                if (!set1.has(ref)) {
                    match = false;
                }
            });
            return match;
        };
        /**
         * Auto translate file via Google Translate.
         * Will translate all new units in file.
         * @param from from
         * @param to to
         * @param languageSpecificMessagesFile languageSpecificMessagesFile
         * @return a promise with the execution result as a summary report.
         */
        XliffMerge.prototype.autoTranslate = function (from, to, languageSpecificMessagesFile) {
            var _this = this;
            var serviceCall;
            var autotranslateEnabled = this.parameters.autotranslateLanguage(to);
            if (autotranslateEnabled) {
                serviceCall = this.autoTranslateService.autoTranslate(from, to, languageSpecificMessagesFile);
            }
            else {
                serviceCall = rxjs.of(new AutoTranslateSummaryReport(from, to));
            }
            return serviceCall.pipe(operators.map(function (summary) {
                if (autotranslateEnabled) {
                    if (summary.error() || summary.failed() > 0) {
                        _this.commandOutput.error(summary.content());
                    }
                    else {
                        _this.commandOutput.warn(summary.content());
                    }
                }
                return summary;
            }));
        };
        return XliffMerge;
    }());

    /*
     * Public API Surface of xliffmerge
     * In principle, there is only the bin file xliffmerge,
     * because this is not mentioned as a library.
     * But the tooling uses the configuration file type.
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.CommandOutput = CommandOutput;
    exports.WriterToString = WriterToString;
    exports.XliffMerge = XliffMerge;
    exports.XliffmergeModule = XliffmergeModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-i18nsupport-ngx-i18nsupport.umd.js.map
