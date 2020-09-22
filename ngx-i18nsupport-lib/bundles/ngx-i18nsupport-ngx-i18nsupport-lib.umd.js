(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('util'), require('xmldom'), require('tokenizr')) :
    typeof define === 'function' && define.amd ? define('@ngx-i18nsupport/ngx-i18nsupport-lib', ['exports', '@angular/core', 'util', 'xmldom', 'tokenizr'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global['ngx-i18nsupport'] = global['ngx-i18nsupport'] || {}, global['ngx-i18nsupport']['ngx-i18nsupport-lib'] = {}), global.ng.core, global.util, global.xmldom, global.tokenizr));
}(this, (function (exports, i0, util, xmldom, Tokenizr) { 'use strict';

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

    var Tokenizr__namespace = /*#__PURE__*/_interopNamespace(Tokenizr);

    var NgxI18nsupportLibModule = /** @class */ (function () {
        function NgxI18nsupportLibModule() {
        }
        return NgxI18nsupportLibModule;
    }());
    /** @nocollapse */ NgxI18nsupportLibModule.ɵmod = i0.ɵɵdefineNgModule({ type: NgxI18nsupportLibModule });
    /** @nocollapse */ NgxI18nsupportLibModule.ɵinj = i0.ɵɵdefineInjector({ factory: function NgxI18nsupportLibModule_Factory(t) { return new (t || NgxI18nsupportLibModule)(); }, imports: [[]] });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(NgxI18nsupportLibModule, [{
                type: i0.NgModule,
                args: [{
                        imports: [],
                        declarations: [],
                        exports: []
                    }]
            }], null, null);
    })();

    /**
     * Created by roobm on 08.05.2017.
     * Some constant values used in the API.
     */
    /**
     * supported file formats
     */
    var FORMAT_XLIFF12 = 'xlf';
    var FORMAT_XLIFF20 = 'xlf2';
    var FORMAT_XMB = 'xmb';
    var FORMAT_XTB = 'xtb';
    /**
     * File types
     * (returned by fileType() method)
     */
    var FILETYPE_XLIFF12 = 'XLIFF 1.2';
    var FILETYPE_XLIFF20 = 'XLIFF 2.0';
    var FILETYPE_XMB = 'XMB';
    var FILETYPE_XTB = 'XTB';
    /**
     * abstract state value.
     * There are only 3 supported state values.
     */
    /**
     * State NEW.
     * Signals an untranslated unit.
     */
    var STATE_NEW = 'new';
    /**
     * State TRANSLATED.
     * Signals a translated unit, that is not reviewed until now.
     */
    var STATE_TRANSLATED = 'translated';
    /**
     * State FINAL.
     * Signals a translated unit, that is reviewed and ready for use.
     */
    var STATE_FINAL = 'final';
    /**
     * Normalizaton message formats.
     */
    /**
     * Default format, contains placeholders, html markup.
     */
    var NORMALIZATION_FORMAT_DEFAULT = 'default';
    /**
     * Format for usage in ngxtranslate messages.
     * Placeholder are in the form {{n}}, no html markup.
     */
    var NORMALIZATION_FORMAT_NGXTRANSLATE = 'ngxtranslate';

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
     * Created by martin on 01.05.2017.
     * Some Tool functions for XML Handling.
     */
    var DOMUtilities = /** @class */ (function () {
        function DOMUtilities() {
        }
        /**
         * return the first subelement with the given tag.
         * @param element element
         * @param tagName tagName
         * @return subelement or null, if not existing.
         */
        DOMUtilities.getFirstElementByTagName = function (element, tagName) {
            var matchingElements = element.getElementsByTagName(tagName);
            if (matchingElements && matchingElements.length > 0) {
                return matchingElements.item(0);
            }
            else {
                return null;
            }
        };
        /**
         * return an element with the given tag and id attribute.
         * @param element element
         * @param tagName tagName
         * @param id id
         * @return subelement or null, if not existing.
         */
        DOMUtilities.getElementByTagNameAndId = function (element, tagName, id) {
            var matchingElements = element.getElementsByTagName(tagName);
            if (matchingElements && matchingElements.length > 0) {
                for (var i = 0; i < matchingElements.length; i++) {
                    var node = matchingElements.item(i);
                    if (node.getAttribute('id') === id) {
                        return node;
                    }
                }
            }
            return null;
        };
        /**
         * Get next sibling, that is an element.
         * @param element element
         */
        DOMUtilities.getElementFollowingSibling = function (element) {
            if (!element) {
                return null;
            }
            var e = element.nextSibling;
            while (e) {
                if (e.nodeType === e.ELEMENT_NODE) {
                    return e;
                }
                e = e.nextSibling;
            }
            return null;
        };
        /**
         * Get previous sibling, that is an element.
         * @param element element
         */
        DOMUtilities.getElementPrecedingSibling = function (element) {
            if (!element) {
                return null;
            }
            var e = element.previousSibling;
            while (e) {
                if (e.nodeType === e.ELEMENT_NODE) {
                    return e;
                }
                e = e.previousSibling;
            }
            return null;
        };
        /**
         * return content of element as string, including all markup.
         * @param element element
         * @return content of element as string, including all markup.
         */
        DOMUtilities.getXMLContent = function (element) {
            if (!element) {
                return null;
            }
            var result = new xmldom.XMLSerializer().serializeToString(element);
            var tagName = element.nodeName;
            var reStartMsg = new RegExp('<' + tagName + '[^>]*>', 'g');
            result = result.replace(reStartMsg, '');
            var reEndMsg = new RegExp('</' + tagName + '>', 'g');
            result = result.replace(reEndMsg, '');
            return result;
        };
        /**
         * return PCDATA content of element.
         * @param element element
         * @return PCDATA content of element.
         */
        DOMUtilities.getPCDATA = function (element) {
            if (!element) {
                return null;
            }
            var result = '';
            var childNodes = element.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes.item(i);
                if (child.nodeType === child.TEXT_NODE || child.nodeType === child.CDATA_SECTION_NODE) {
                    result = result + child.nodeValue;
                }
            }
            return result.length === 0 ? null : result;
        };
        /**
         * replace PCDATA content with a new one.
         * @param element element
         * @param pcdata pcdata
         */
        DOMUtilities.replaceContentWithXMLContent = function (element, pcdata) {
            // remove all children
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            // parseICUMessage pcdata
            var pcdataFragment = new xmldom.DOMParser().parseFromString('<fragment>' + pcdata + '</fragment>', 'application/xml');
            var newChildren = pcdataFragment.getElementsByTagName('fragment').item(0).childNodes;
            for (var j = 0; j < newChildren.length; j++) {
                var newChild = newChildren.item(j);
                element.appendChild(element.ownerDocument.importNode(newChild, true));
            }
        };
        /**
         * find the previous sibling that is an element.
         * @param element element
         * @return the previous sibling that is an element or null.
         */
        DOMUtilities.getPreviousElementSibling = function (element) {
            var node = element.previousSibling;
            while (node !== null) {
                if (node.nodeType === node.ELEMENT_NODE) {
                    return node;
                }
                node = node.previousSibling;
            }
            return null;
        };
        /**
         * Create an Element Node that is the next sibling of a given node.
         * @param elementNameToCreate elementNameToCreate
         * @param previousSibling previousSibling
         * @return new element
         */
        DOMUtilities.createFollowingSibling = function (elementNameToCreate, previousSibling) {
            var newElement = previousSibling.ownerDocument.createElement(elementNameToCreate);
            return DOMUtilities.insertAfter(newElement, previousSibling);
        };
        /**
         * Insert newElement directly after previousSibling.
         * @param newElement newElement
         * @param previousSibling previousSibling
         */
        DOMUtilities.insertAfter = function (newElement, previousSibling) {
            if (previousSibling.nextSibling !== null) {
                previousSibling.parentNode.insertBefore(newElement, previousSibling.nextSibling);
            }
            else {
                previousSibling.parentNode.appendChild(newElement);
            }
            return newElement;
        };
        /**
         * Insert newElement directly before nextSibling.
         * @param newElement newElement
         * @param nextSibling nextSibling
         */
        DOMUtilities.insertBefore = function (newElement, nextSibling) {
            nextSibling.parentNode.insertBefore(newElement, nextSibling);
            return newElement;
        };
        return DOMUtilities;
    }());

    /**
     * An XmlSerializer that supports formatting.
     * Original code is based on [xmldom](https://www.npmjs.com/package/xmldom)
     * It is extended to support formatting including handling of elements with mixed content.
     * Example formatted output:
     * <pre>
     *     <doc>
     *         <element>An element with
     *             <b>mixed</b>
     *              content
     *         </element>
     *     </doc>
     * </pre>
     * Same when "element" is indicated as "mixedContentElement":
     * <pre>
     *     <doc>
     *         <element>An element with <b>mixed</b> content</element>
     *     </doc>
     * </pre>
     */
    var DEFAULT_INDENT_STRING = '  ';
    var XmlSerializer = /** @class */ (function () {
        function XmlSerializer() {
        }
        /**
         * Serialze xml document to string.
         * @param document the document
         * @param options can be used to activate beautifying.
         */
        XmlSerializer.prototype.serializeToString = function (document, options) {
            var buf = [];
            var visibleNamespaces = [];
            var refNode = document.documentElement;
            var prefix = refNode.prefix;
            var uri = refNode.namespaceURI;
            if (uri && prefix == null) {
                prefix = refNode.lookupPrefix(uri);
                if (prefix == null) {
                    visibleNamespaces = [
                        { namespace: uri, prefix: null }
                        // {namespace:uri,prefix:''}
                    ];
                }
            }
            if (!options) {
                options = {};
            }
            if (options.indentString) {
                if (!this.containsOnlyWhiteSpace(options.indentString)) {
                    throw new Error('indentString must not contain non white characters');
                }
            }
            this.doSerializeToString(document, options, buf, 0, false, visibleNamespaces);
            return buf.join('');
        };
        /**
         * Main format method that does all the work.
         * Outputs a node to the outputbuffer.
         * @param node the node to be formatted.
         * @param options options
         * @param buf outputbuffer, new output will be appended to this array.
         * @param indentLevel Lever of indentation for formatted output.
         * @param partOfMixedContent true, if node is a subelement of an element containind mixed content.
         * @param visibleNamespaces visibleNamespaces
         */
        XmlSerializer.prototype.doSerializeToString = function (node, options, buf, indentLevel, partOfMixedContent, visibleNamespaces) {
            var child;
            switch (node.nodeType) {
                case node.ELEMENT_NODE:
                    var elementNode = node;
                    var attrs = elementNode.attributes;
                    var len = attrs.length;
                    child = elementNode.firstChild;
                    var nodeName = elementNode.tagName;
                    var elementHasMixedContent = this.isMixedContentElement(nodeName, options);
                    if (partOfMixedContent) {
                        buf.push('<', nodeName);
                    }
                    else {
                        this.outputIndented(options, buf, indentLevel, '<', nodeName);
                    }
                    for (var i = 0; i < len; i++) {
                        // add namespaces for attributes
                        var attr = attrs.item(i);
                        if (attr.prefix === 'xmlns') {
                            visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
                        }
                        else if (attr.nodeName === 'xmlns') {
                            visibleNamespaces.push({ prefix: '', namespace: attr.value });
                        }
                    }
                    for (var i = 0; i < len; i++) {
                        var attr = attrs.item(i);
                        if (this.needNamespaceDefine(attr, visibleNamespaces)) {
                            var prefix = attr.prefix || '';
                            var uri = attr.namespaceURI;
                            var ns = prefix ? ' xmlns:' + prefix : ' xmlns';
                            buf.push(ns, '="', uri, '"');
                            visibleNamespaces.push({ prefix: prefix, namespace: uri });
                        }
                        this.doSerializeToString(attr, options, buf, indentLevel, false, visibleNamespaces);
                    }
                    // add namespace for current node
                    if (this.needNamespaceDefine(elementNode, visibleNamespaces)) {
                        var prefix = elementNode.prefix || '';
                        var uri = node.namespaceURI;
                        var ns = prefix ? ' xmlns:' + prefix : ' xmlns';
                        buf.push(ns, '="', uri, '"');
                        visibleNamespaces.push({ prefix: prefix, namespace: uri });
                    }
                    if (child) {
                        buf.push('>');
                        // if is cdata child node
                        var hasComplexContent = false;
                        while (child) {
                            if (child.nodeType === child.ELEMENT_NODE) {
                                hasComplexContent = true;
                            }
                            this.doSerializeToString(child, options, buf, indentLevel + 1, partOfMixedContent || elementHasMixedContent, visibleNamespaces);
                            child = child.nextSibling;
                        }
                        if (!partOfMixedContent && !elementHasMixedContent && hasComplexContent) {
                            this.outputIndented(options, buf, indentLevel, '</', nodeName, '>');
                        }
                        else {
                            buf.push('</', nodeName, '>');
                        }
                    }
                    else {
                        buf.push('/>');
                    }
                    return;
                case node.DOCUMENT_NODE:
                case node.DOCUMENT_FRAGMENT_NODE:
                    child = node.firstChild;
                    while (child) {
                        this.doSerializeToString(child, options, buf, indentLevel, false, visibleNamespaces);
                        child = child.nextSibling;
                    }
                    return;
                case node.ATTRIBUTE_NODE:
                    var attrNode = node;
                    return buf.push(' ', attrNode.name, '="', attrNode.value.replace(/[<&"]/g, this._xmlEncoder), '"');
                case node.TEXT_NODE:
                    var textNode = node;
                    if (!options.beautify || partOfMixedContent || !this.containsOnlyWhiteSpace(textNode.data)) {
                        return buf.push(textNode.data.replace(/[<&]/g, this._xmlEncoder));
                    }
                    return;
                case node.CDATA_SECTION_NODE:
                    var cdatasectionNode = node;
                    return buf.push('<![CDATA[', cdatasectionNode.data, ']]>');
                case node.COMMENT_NODE:
                    var commentNode = node;
                    return buf.push('<!--', commentNode.data, '-->');
                case node.DOCUMENT_TYPE_NODE:
                    var documenttypeNode = node;
                    var pubid = documenttypeNode.publicId;
                    var sysid = documenttypeNode.systemId;
                    buf.push('<!DOCTYPE ', documenttypeNode.name);
                    if (pubid) {
                        buf.push(' PUBLIC "', pubid);
                        if (sysid && sysid !== '.') {
                            buf.push('" "', sysid);
                        }
                        buf.push('">');
                    }
                    else if (sysid && sysid !== '.') {
                        buf.push(' SYSTEM "', sysid, '">');
                    }
                    else {
                        buf.push('>');
                    }
                    return;
                case node.PROCESSING_INSTRUCTION_NODE:
                    var piNode = node;
                    return buf.push('<?', piNode.target, ' ', piNode.data, '?>');
                case node.ENTITY_REFERENCE_NODE:
                    return buf.push('&', node.nodeName, ';');
                // case ENTITY_NODE:
                // case NOTATION_NODE:
                default:
                    buf.push('??', node.nodeName);
            }
        };
        XmlSerializer.prototype.needNamespaceDefine = function (node, visibleNamespaces) {
            var prefix = node.prefix || '';
            var uri = node.namespaceURI;
            if (!prefix && !uri) {
                return false;
            }
            if (prefix === 'xml' && uri === 'http://www.w3.org/XML/1998/namespace'
                || uri === 'http://www.w3.org/2000/xmlns/') {
                return false;
            }
            var i = visibleNamespaces.length;
            while (i--) {
                var ns = visibleNamespaces[i];
                // get namespace prefix
                if (ns.prefix === prefix) {
                    return ns.namespace !== uri;
                }
            }
            return true;
        };
        XmlSerializer.prototype._xmlEncoder = function (c) {
            return c === '<' && '&lt;' ||
                c === '>' && '&gt;' ||
                c === '&' && '&amp;' ||
                c === '"' && '&quot;' ||
                '&#' + c.charCodeAt(0) + ';';
        };
        XmlSerializer.prototype.outputIndented = function (options, buf, indentLevel) {
            var outputParts = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                outputParts[_i - 3] = arguments[_i];
            }
            if (options.beautify) {
                buf.push('\n');
                if (indentLevel > 0) {
                    buf.push(this.indentationString(options, indentLevel));
                }
            }
            buf.push.apply(buf, __spread(outputParts));
        };
        XmlSerializer.prototype.indentationString = function (options, indentLevel) {
            var indent = (options.indentString) ? options.indentString : DEFAULT_INDENT_STRING;
            var result = '';
            for (var i = 0; i < indentLevel; i++) {
                result = result + indent;
            }
            return result;
        };
        /**
         * Test, wether tagName is an element containing mixed content.
         * @param tagName tagName
         * @param options options
         */
        XmlSerializer.prototype.isMixedContentElement = function (tagName, options) {
            if (options && options.mixedContentElements) {
                return !!options.mixedContentElements.find(function (tag) { return tag === tagName; });
            }
            else {
                return false;
            }
        };
        XmlSerializer.prototype.containsOnlyWhiteSpace = function (text) {
            for (var i = 0; i < text.length; i++) {
                var c = text.charAt(i);
                if (!(c === ' ' || c === '\t' || c === '\r' || c === '\n')) {
                    return false;
                }
            }
            return true;
        };
        return XmlSerializer;
    }());

    /**
     * Created by roobm on 09.05.2017.
     * Abstract superclass for all implementations of ITranslationMessagesFile.
     */
    var AbstractTranslationMessagesFile = /** @class */ (function () {
        function AbstractTranslationMessagesFile() {
            this.transUnits = null;
            this._warnings = [];
        }
        /**
         * Parse file content.
         * Sets _parsedDocument, line ending, encoding, etc.
         * @param xmlString xmlString
         * @param path path
         * @param encoding encoding
         * @param optionalMaster optionalMaster
         */
        AbstractTranslationMessagesFile.prototype.parseContent = function (xmlString, path, encoding, optionalMaster) {
            this._filename = path;
            this._encoding = encoding;
            this._parsedDocument = new xmldom.DOMParser().parseFromString(xmlString, 'text/xml');
            this._fileEndsWithEOL = xmlString.endsWith('\n');
        };
        AbstractTranslationMessagesFile.prototype.lazyInitializeTransUnits = function () {
            if (util.isNullOrUndefined(this.transUnits)) {
                this.initializeTransUnits();
                this.countNumbers();
            }
        };
        /**
         * count units after changes of trans units
         */
        AbstractTranslationMessagesFile.prototype.countNumbers = function () {
            var _this = this;
            this._numberOfTransUnitsWithMissingId = 0;
            this._numberOfUntranslatedTransUnits = 0;
            this._numberOfReviewedTransUnits = 0;
            this.forEachTransUnit(function (tu) {
                if (util.isNullOrUndefined(tu.id) || tu.id === '') {
                    _this._numberOfTransUnitsWithMissingId++;
                }
                var state = tu.targetState();
                if (util.isNullOrUndefined(state) || state === STATE_NEW) {
                    _this._numberOfUntranslatedTransUnits++;
                }
                if (state === STATE_TRANSLATED) {
                    _this._numberOfReviewedTransUnits++;
                }
            });
        };
        AbstractTranslationMessagesFile.prototype.warnings = function () {
            this.lazyInitializeTransUnits();
            return this._warnings;
        };
        /**
         * Total number of translation units found in the file.
         */
        AbstractTranslationMessagesFile.prototype.numberOfTransUnits = function () {
            this.lazyInitializeTransUnits();
            return this.transUnits.length;
        };
        /**
         * Number of translation units without translation found in the file.
         * These units have state 'translated'.
         */
        AbstractTranslationMessagesFile.prototype.numberOfUntranslatedTransUnits = function () {
            this.lazyInitializeTransUnits();
            return this._numberOfUntranslatedTransUnits;
        };
        /**
         * Number of translation units with state 'final'.
         */
        AbstractTranslationMessagesFile.prototype.numberOfReviewedTransUnits = function () {
            this.lazyInitializeTransUnits();
            return this._numberOfReviewedTransUnits;
        };
        /**
         * Number of translation units without translation found in the file.
         * These units have state 'translated'.
         */
        AbstractTranslationMessagesFile.prototype.numberOfTransUnitsWithMissingId = function () {
            this.lazyInitializeTransUnits();
            return this._numberOfTransUnitsWithMissingId;
        };
        /**
         * Loop over all Translation Units.
         * @param callback callback
         */
        AbstractTranslationMessagesFile.prototype.forEachTransUnit = function (callback) {
            this.lazyInitializeTransUnits();
            this.transUnits.forEach(function (tu) { return callback(tu); });
        };
        /**
         * Get trans-unit with given id.
         * @param id id
         * @return trans-unit with given id.
         */
        AbstractTranslationMessagesFile.prototype.transUnitWithId = function (id) {
            this.lazyInitializeTransUnits();
            return this.transUnits.find(function (tu) { return tu.id === id; });
        };
        /**
         * Set the praefix used when copying source to target.
         * This is used by importNewTransUnit and createTranslationFileForLang methods.
         * (since 1.8.0)
         * @param targetPraefix targetPraefix
         */
        AbstractTranslationMessagesFile.prototype.setNewTransUnitTargetPraefix = function (targetPraefix) {
            this.targetPraefix = targetPraefix;
        };
        /**
         * Get the praefix used when copying source to target.
         * (since 1.8.0)
         * @return the praefix used when copying source to target.
         */
        AbstractTranslationMessagesFile.prototype.getNewTransUnitTargetPraefix = function () {
            return util.isNullOrUndefined(this.targetPraefix) ? '' : this.targetPraefix;
        };
        /**
         * Set the suffix used when copying source to target.
         * This is used by importNewTransUnit and createTranslationFileForLang methods.
         * (since 1.8.0)
         * @param targetSuffix targetSuffix
         */
        AbstractTranslationMessagesFile.prototype.setNewTransUnitTargetSuffix = function (targetSuffix) {
            this.targetSuffix = targetSuffix;
        };
        /**
         * Get the suffix used when copying source to target.
         * (since 1.8.0)
         * @return the suffix used when copying source to target.
         */
        AbstractTranslationMessagesFile.prototype.getNewTransUnitTargetSuffix = function () {
            return util.isNullOrUndefined(this.targetSuffix) ? '' : this.targetSuffix;
        };
        /**
         * Remove the trans-unit with the given id.
         * @param id id
         */
        AbstractTranslationMessagesFile.prototype.removeTransUnitWithId = function (id) {
            var tuNode = this._parsedDocument.getElementById(id);
            if (tuNode) {
                tuNode.parentNode.removeChild(tuNode);
                this.lazyInitializeTransUnits();
                this.transUnits = this.transUnits.filter(function (tu) { return tu.id !== id; });
                this.countNumbers();
            }
        };
        /**
         * The filename where the data is read from.
         */
        AbstractTranslationMessagesFile.prototype.filename = function () {
            return this._filename;
        };
        /**
         * The encoding if the xml content (UTF-8, ISO-8859-1, ...)
         */
        AbstractTranslationMessagesFile.prototype.encoding = function () {
            return this._encoding;
        };
        /**
         * The xml content to be saved after changes are made.
         * @param beautifyOutput Flag whether to use pretty-data to format the output.
         * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
         * See issue #64 for details.
         * Default is false.
         */
        AbstractTranslationMessagesFile.prototype.editedContent = function (beautifyOutput) {
            var options = {};
            if (beautifyOutput === true) {
                options.beautify = true;
                options.indentString = '  ';
                options.mixedContentElements = this.elementsWithMixedContent();
            }
            var result = new XmlSerializer().serializeToString(this._parsedDocument, options);
            if (this._fileEndsWithEOL) {
                // add eol if there was eol in original source
                return result + '\n';
            }
            else {
                return result;
            }
        };
        return AbstractTranslationMessagesFile;
    }());

    /**
     * Created by roobm on 10.05.2017.
     * Abstract superclass for all implementations of ITransUnit.
     */
    var AbstractTransUnit = /** @class */ (function () {
        function AbstractTransUnit(_element, _id, _translationMessagesFile) {
            this._element = _element;
            this._id = _id;
            this._translationMessagesFile = _translationMessagesFile;
        }
        Object.defineProperty(AbstractTransUnit.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * The file the unit belongs to.,
         */
        AbstractTransUnit.prototype.translationMessagesFile = function () {
            return this._translationMessagesFile;
        };
        /**
         * Test, wether setting of source content is supported.
         * If not, setSourceContent in trans-unit will do nothing.
         * xtb does not support this, all other formats do.
         */
        AbstractTransUnit.prototype.supportsSetSourceContent = function () {
            return true;
        };
        /**
         * The original text value, that is to be translated, as normalized message.
         */
        AbstractTransUnit.prototype.sourceContentNormalized = function () {
            if (util.isNullOrUndefined(this._sourceContentNormalized)) {
                this._sourceContentNormalized = this.createSourceContentNormalized();
            }
            return this._sourceContentNormalized;
        };
        /**
         * State of the translation.
         * (on of new, translated, final)
         * Return values are defined as Constants STATE_...
         */
        AbstractTransUnit.prototype.targetState = function () {
            var nativeState = this.nativeTargetState();
            return this.mapNativeStateToState(nativeState);
        };
        /**
         * Modify the target state.
         * @param newState one of the 3 allowed target states new, translated, final.
         * Constants STATE_...
         * Invalid states throw an error.
         */
        AbstractTransUnit.prototype.setTargetState = function (newState) {
            this.setNativeTargetState(this.mapStateToNativeState(newState));
            if (this.translationMessagesFile() instanceof AbstractTranslationMessagesFile) {
                this.translationMessagesFile().countNumbers();
            }
        };
        /**
         * Test, wether setting of source refs is supported.
         * If not, setSourceReferences will do nothing.
         * xtb does not support this, all other formats do.
         */
        AbstractTransUnit.prototype.supportsSetSourceReferences = function () {
            return true;
        };
        /**
         * Test, wether setting of description and meaning is supported.
         * If not, setDescription and setMeaning will do nothing.
         * xtb does not support this, all other formats do.
         */
        AbstractTransUnit.prototype.supportsSetDescriptionAndMeaning = function () {
            return true;
        };
        /**
         * Check notes
         * @param newNotes the notes to add.
         * @throws an Error if any note contains description or meaning as from attribute.
         */
        AbstractTransUnit.prototype.checkNotes = function (newNotes) {
            // check from values
            var errorInFromNote = newNotes.find(function (note) { return note.from === 'description' || note.from === 'meaning'; });
            if (!util.isNullOrUndefined(errorInFromNote)) {
                throw new Error('description or meaning are not allowed as from atttribute');
            }
        };
        /**
         * The real xml element used for the trans unit.
         * (internal usage only, a client should never need this)
         * @return real xml element used for the trans unit.
         */
        AbstractTransUnit.prototype.asXmlElement = function () {
            return this._element;
        };
        /**
         * Translate the trans unit.
         * @param translation the translated string or (preferred) a normalized message.
         * The pure string can contain any markup and will not be checked.
         * So it can damage the document.
         * A normalized message prevents this.
         */
        AbstractTransUnit.prototype.translate = function (translation) {
            var translationNative;
            if (util.isString(translation)) {
                translationNative = translation;
            }
            else {
                translationNative = translation.asNativeString();
            }
            this.translateNative(translationNative);
            this.setTargetState(STATE_TRANSLATED);
        };
        /**
         * Test, wether message looks like ICU message.
         * @param message message
         * @return wether message looks like ICU message.
         */
        AbstractTransUnit.prototype.isICUMessage = function (message) {
            return this.messageParser().isICUMessageStart(message);
        };
        return AbstractTransUnit;
    }());

    /**
     * Created by martin on 05.05.2017.
     * A part of a parsed message.
     * Can be a text, a placeholder, a tag
     */
    var ParsedMessagePartType;
    (function (ParsedMessagePartType) {
        ParsedMessagePartType[ParsedMessagePartType["TEXT"] = 0] = "TEXT";
        ParsedMessagePartType[ParsedMessagePartType["PLACEHOLDER"] = 1] = "PLACEHOLDER";
        ParsedMessagePartType[ParsedMessagePartType["START_TAG"] = 2] = "START_TAG";
        ParsedMessagePartType[ParsedMessagePartType["END_TAG"] = 3] = "END_TAG";
        ParsedMessagePartType[ParsedMessagePartType["EMPTY_TAG"] = 4] = "EMPTY_TAG";
        ParsedMessagePartType[ParsedMessagePartType["ICU_MESSAGE"] = 5] = "ICU_MESSAGE";
        ParsedMessagePartType[ParsedMessagePartType["ICU_MESSAGE_REF"] = 6] = "ICU_MESSAGE_REF";
    })(ParsedMessagePartType || (ParsedMessagePartType = {}));
    var ParsedMessagePart = /** @class */ (function () {
        function ParsedMessagePart(type) {
            this.type = type;
        }
        return ParsedMessagePart;
    }());

    /**
     * Created by martin on 05.05.2017.
     * A message part consisting of just simple text.
     */
    var ParsedMessagePartText = /** @class */ (function (_super) {
        __extends(ParsedMessagePartText, _super);
        function ParsedMessagePartText(text) {
            var _this = _super.call(this, ParsedMessagePartType.TEXT) || this;
            _this.text = text;
            return _this;
        }
        ParsedMessagePartText.prototype.asDisplayString = function (format) {
            return this.text;
        };
        return ParsedMessagePartText;
    }(ParsedMessagePart));

    /**
     * Created by martin on 05.05.2017.
     * A message part consisting of a placeholder.
     * Placeholders are numbered from 0 to n.
     */
    var ParsedMessagePartPlaceholder = /** @class */ (function (_super) {
        __extends(ParsedMessagePartPlaceholder, _super);
        function ParsedMessagePartPlaceholder(index, disp) {
            var _this = _super.call(this, ParsedMessagePartType.PLACEHOLDER) || this;
            _this._index = index;
            _this._disp = disp;
            return _this;
        }
        ParsedMessagePartPlaceholder.prototype.asDisplayString = function (format) {
            if (format === NORMALIZATION_FORMAT_NGXTRANSLATE) {
                return '{{' + this._index + '}}';
            }
            return '{{' + this._index + '}}';
        };
        ParsedMessagePartPlaceholder.prototype.index = function () {
            return this._index;
        };
        ParsedMessagePartPlaceholder.prototype.disp = function () {
            return this._disp;
        };
        return ParsedMessagePartPlaceholder;
    }(ParsedMessagePart));

    /**
     * Created by martin on 05.05.2017.
     * A message part consisting of an opening tag like <b> or <strange>.
     */
    var ParsedMessagePartStartTag = /** @class */ (function (_super) {
        __extends(ParsedMessagePartStartTag, _super);
        function ParsedMessagePartStartTag(tagname, idcounter) {
            var _this = _super.call(this, ParsedMessagePartType.START_TAG) || this;
            _this._tagname = tagname;
            _this._idcounter = idcounter;
            return _this;
        }
        ParsedMessagePartStartTag.prototype.asDisplayString = function (format) {
            if (this._idcounter === 0) {
                return '<' + this._tagname + '>';
            }
            else {
                return '<' + this._tagname + ' id="' + this._idcounter.toString() + '">';
            }
        };
        ParsedMessagePartStartTag.prototype.tagName = function () {
            return this._tagname;
        };
        ParsedMessagePartStartTag.prototype.idCounter = function () {
            return this._idcounter;
        };
        return ParsedMessagePartStartTag;
    }(ParsedMessagePart));

    /**
     * Created by martin on 05.05.2017.
     * A message part consisting of a closing tag like </b> or </strange>.
     */
    var ParsedMessagePartEndTag = /** @class */ (function (_super) {
        __extends(ParsedMessagePartEndTag, _super);
        function ParsedMessagePartEndTag(tagname) {
            var _this = _super.call(this, ParsedMessagePartType.END_TAG) || this;
            _this._tagname = tagname;
            return _this;
        }
        ParsedMessagePartEndTag.prototype.asDisplayString = function (format) {
            return '</' + this._tagname + '>';
        };
        ParsedMessagePartEndTag.prototype.tagName = function () {
            return this._tagname;
        };
        return ParsedMessagePartEndTag;
    }(ParsedMessagePart));

    /**
     * Created by martin on 04.06.2017.
     * A tokenizer for ICU messages.
     */
    // Tokens
    var TEXT = 'TEXT';
    var CURLY_BRACE_OPEN = 'CURLY_BRACE_OPEN';
    var CURLY_BRACE_CLOSE = 'CURLY_BRACE_CLOSE';
    var COMMA = 'COMMA';
    var PLURAL = 'PLURAL';
    var SELECT = 'SELECT';
    // states: default normal in_message
    var STATE_DEFAULT = 'default';
    var STATE_NORMAL = 'normal';
    var STATE_IN_MESSAGE = 'in_message';
    var ICUMessageTokenizer = /** @class */ (function () {
        function ICUMessageTokenizer() {
        }
        ICUMessageTokenizer.prototype.getLexer = function () {
            var _this = this;
            var lexer = new Tokenizr__namespace();
            var plaintext = '';
            var openedCurlyBracesInTextCounter = 0;
            lexer.before(function (ctx, match, rule) {
                if (rule.name !== TEXT) {
                    if (_this.containsNonWhiteSpace(plaintext)) {
                        ctx.accept(TEXT, plaintext);
                        plaintext = '';
                    }
                    else {
                        ctx.ignore();
                    }
                }
            });
            lexer.finish(function (ctx) {
                if (_this.containsNonWhiteSpace(plaintext)) {
                    ctx.accept(TEXT, plaintext);
                }
            });
            // curly brace
            lexer.rule(STATE_DEFAULT, /{/, function (ctx, match) {
                ctx.accept(CURLY_BRACE_OPEN, match[0]);
                ctx.push(STATE_NORMAL);
            }, CURLY_BRACE_OPEN);
            lexer.rule(STATE_NORMAL, /{/, function (ctx, match) {
                ctx.accept(CURLY_BRACE_OPEN, match[0]);
                ctx.push(STATE_IN_MESSAGE);
            }, CURLY_BRACE_OPEN);
            lexer.rule(STATE_NORMAL, /}/, function (ctx, match) {
                ctx.pop();
                ctx.accept(CURLY_BRACE_CLOSE, match[0]);
            }, CURLY_BRACE_CLOSE);
            // masked ' { and }
            lexer.rule(STATE_IN_MESSAGE, /'[{}]?'/, function (ctx, match) {
                if (match[0] === '\'\'') {
                    plaintext += '\'';
                }
                else if (match[0] === '\'{\'') {
                    plaintext += '{';
                }
                else if (match[0] === '\'}\'') {
                    plaintext += '}';
                }
                ctx.ignore();
            }, TEXT);
            lexer.rule(STATE_IN_MESSAGE, /./, function (ctx, match) {
                var char = match[0];
                if (char === '{') {
                    openedCurlyBracesInTextCounter++;
                    plaintext += match[0];
                    ctx.ignore();
                }
                else if (char === '}') {
                    if (openedCurlyBracesInTextCounter > 0) {
                        openedCurlyBracesInTextCounter--;
                        plaintext += match[0];
                        ctx.ignore();
                    }
                    else {
                        ctx.pop();
                        ctx.accept(TEXT, plaintext);
                        plaintext = '';
                        ctx.accept(CURLY_BRACE_CLOSE, match[0]);
                    }
                }
                else {
                    plaintext += match[0];
                    ctx.ignore();
                }
            }, TEXT);
            // comma
            lexer.rule(STATE_NORMAL, /,/, function (ctx, match) {
                ctx.accept(COMMA, match[0]);
            }, COMMA);
            // keywords plural and select
            lexer.rule(STATE_NORMAL, /plural/, function (ctx, match) {
                ctx.accept(PLURAL, match[0]);
            }, PLURAL);
            lexer.rule(STATE_NORMAL, /select/, function (ctx, match) {
                ctx.accept(SELECT, match[0]);
            }, SELECT);
            // text
            lexer.rule(/./, function (ctx, match) {
                plaintext += match[0];
                ctx.ignore();
            }, TEXT);
            lexer.rule(/[\s]+/, function (ctx, match) {
                plaintext += match[0];
                ctx.ignore();
            }, TEXT);
            return lexer;
        };
        ICUMessageTokenizer.prototype.containsNonWhiteSpace = function (text) {
            for (var i = 0; i < text.length; i++) {
                if (!/\s/.test(text.charAt(i))) {
                    return true;
                }
            }
            return false;
        };
        ICUMessageTokenizer.prototype.tokenize = function (normalizedMessage) {
            var lexer = this.getLexer();
            lexer.input(normalizedMessage);
            return lexer.tokens();
        };
        ICUMessageTokenizer.prototype.input = function (normalizedMessage) {
            this.lexer = this.getLexer();
            this.lexer.input(normalizedMessage);
        };
        ICUMessageTokenizer.prototype.next = function () {
            return this.lexer.token();
        };
        ICUMessageTokenizer.prototype.peek = function () {
            return this.lexer.peek();
        };
        return ICUMessageTokenizer;
    }());

    var MessageCategory = /** @class */ (function () {
        function MessageCategory(_category, _message) {
            this._category = _category;
            this._message = _message;
        }
        MessageCategory.prototype.getCategory = function () {
            return this._category;
        };
        MessageCategory.prototype.getMessageNormalized = function () {
            return this._message;
        };
        return MessageCategory;
    }());
    /**
     * Implementation of an ICU Message.
     * Created by martin on 05.06.2017.
     */
    var ICUMessage = /** @class */ (function () {
        function ICUMessage(_parser, isPluralMessage) {
            this._parser = _parser;
            this._isPluralMessage = isPluralMessage;
            this._categories = [];
        }
        ICUMessage.prototype.addCategory = function (category, message) {
            this._categories.push(new MessageCategory(category, message));
        };
        /**
         * ICU message as native string.
         * This is, how it is stored, something like '{x, plural, =0 {..}'
         * @return ICU message as native string.
         */
        ICUMessage.prototype.asNativeString = function () {
            var varname = (this.isPluralMessage()) ? 'VAR_PLURAL' : 'VAR_SELECT';
            var type = (this.isPluralMessage()) ? 'plural' : 'select';
            var choiceString = '';
            this._categories.forEach(function (category) {
                choiceString = choiceString + util.format(' %s {%s}', category.getCategory(), category.getMessageNormalized().asNativeString());
            });
            return util.format('{%s, %s,%s}', varname, type, choiceString);
        };
        /**
         * Is it a plural message?
         */
        ICUMessage.prototype.isPluralMessage = function () {
            return this._isPluralMessage;
        };
        /**
         * Is it a select message?
         */
        ICUMessage.prototype.isSelectMessage = function () {
            return !this._isPluralMessage;
        };
        /**
         * All the parts of the message.
         * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
         * has 4 category objects with the categories =0, =1, =2, other.
         */
        ICUMessage.prototype.getCategories = function () {
            return this._categories;
        };
        /**
         * Translate message and return a new, translated message
         * @param translation the translation (hashmap of categories and translations).
         * @return new message wit translated content.
         * @throws an error if translation does not match the message.
         * This is the case, if there are categories not contained in the original message.
         */
        ICUMessage.prototype.translate = function (translation) {
            var _this = this;
            var message = new ICUMessage(this._parser, this.isPluralMessage());
            var translatedCategories = new Set();
            this._categories.forEach(function (category) {
                var translatedMessage;
                var translationForCategory = translation[category.getCategory()];
                if (util.isNullOrUndefined(translationForCategory)) {
                    translatedMessage = category.getMessageNormalized();
                }
                else if (util.isString(translationForCategory)) {
                    translatedCategories.add(category.getCategory());
                    translatedMessage = _this._parser.parseNormalizedString(translationForCategory, null);
                }
                else {
                    // TODO embedded ICU Message
                    translatedMessage = null;
                }
                message.addCategory(category.getCategory(), translatedMessage);
            });
            // new categories, which are not part of the original message
            Object.keys(translation).forEach(function (categoryName) {
                if (!translatedCategories.has(categoryName)) {
                    if (_this.isSelectMessage()) {
                        throw new Error(util.format('adding a new category not allowed for select messages ("%s" is not part of message)', categoryName));
                    }
                    else {
                        _this.checkValidPluralCategory(categoryName);
                        // TODO embedded ICU Message
                        var translatedMessage = _this._parser.parseNormalizedString(translation[categoryName], null);
                        message.addCategory(categoryName, translatedMessage);
                    }
                }
            });
            return message;
        };
        /**
         * Check, wether category is valid plural category.
         * Allowed are =n, 'zero', 'one', 'two', 'few', 'many' and 'other'
         * @param categoryName category
         * @throws an error, if it is not a valid category name
         */
        ICUMessage.prototype.checkValidPluralCategory = function (categoryName) {
            var allowedKeywords = ['zero', 'one', 'two', 'few', 'many', 'other'];
            if (categoryName.match(/=\d+/)) {
                return;
            }
            if (allowedKeywords.find(function (key) { return key === categoryName; })) {
                return;
            }
            throw new Error(util.format('invalid plural category "%s", allowed are =<n> and %s', categoryName, allowedKeywords));
        };
        return ICUMessage;
    }());

    /**
     * Created by martin on 02.06.2017.
     * A message part consisting of an icu message.
     * There can only be one icu message in a parsed message.
     * Syntax of ICU message is '{' <keyname> ',' 'select'|'plural' ',' (<category> '{' text '}')+ '}'
     */
    var ParsedMessagePartICUMessage = /** @class */ (function (_super) {
        __extends(ParsedMessagePartICUMessage, _super);
        function ParsedMessagePartICUMessage(icuMessageText, _parser) {
            var _this = _super.call(this, ParsedMessagePartType.ICU_MESSAGE) || this;
            _this._parser = _parser;
            if (icuMessageText) {
                _this.parseICUMessage(icuMessageText);
            }
            return _this;
        }
        /**
         * Test wether text might be an ICU message.
         * Should at least start with something like '{<name>, select, ..' or '{<name>, plural, ...'
         * @param icuMessageText icuMessageText
         * @return wether text might be an ICU message.
         */
        ParsedMessagePartICUMessage.looksLikeICUMessage = function (icuMessageText) {
            var part = new ParsedMessagePartICUMessage(null, null);
            return part.looksLikeICUMessage(icuMessageText);
        };
        ParsedMessagePartICUMessage.prototype.asDisplayString = function (displayFormat) {
            return '<ICU-Message/>';
        };
        /**
         * return the parsed message.
         * @return parsed message
         */
        ParsedMessagePartICUMessage.prototype.getICUMessage = function () {
            return this._message;
        };
        /**
         * Parse the message.
         * @param text message text to parse
         * @throws an error if the syntax is not ok in any way.
         */
        ParsedMessagePartICUMessage.prototype.parseICUMessage = function (text) {
            // console.log('message ', text);
            // const tokens = new ICUMessageTokenizer().tokenize(text);
            // tokens.forEach((tok) => {
            //     console.log('Token', tok.type, tok.value);
            // });
            this._messageText = text;
            this._tokenizer = new ICUMessageTokenizer();
            this._tokenizer.input(text);
            this.expectNext(CURLY_BRACE_OPEN);
            this.expectNext(TEXT); // varname, not used currently, ng always used VAR_PLURAL or VAR_SELECT
            this.expectNext(COMMA);
            var token = this._tokenizer.next();
            if (token.type === PLURAL) {
                this._message = new ICUMessage(this._parser, true);
            }
            else if (token.type === SELECT) {
                this._message = new ICUMessage(this._parser, false);
            }
            this.expectNext(COMMA);
            token = this._tokenizer.peek();
            while (token.type !== CURLY_BRACE_CLOSE) {
                var category = this.expectNext(TEXT).value.trim();
                this.expectNext(CURLY_BRACE_OPEN);
                var message = this.expectNext(TEXT).value;
                this._message.addCategory(category, this.parseNativeSubMessage(message));
                this.expectNext(CURLY_BRACE_CLOSE);
                token = this._tokenizer.peek();
            }
            this.expectNext(CURLY_BRACE_CLOSE);
            this.expectNext('EOF');
        };
        /**
         * Parse the message to check, wether it might be an ICU message.
         * Should at least start with something like '{<name>, select, ..' or '{<name>, plural, ...'
         * @param text message text to parse
         */
        ParsedMessagePartICUMessage.prototype.looksLikeICUMessage = function (text) {
            // console.log('message ', text);
            // const tokens = new ICUMessageTokenizer().tokenize(text);
            // tokens.forEach((tok) => {
            //     console.log('Token', tok.type, tok.value);
            // });
            this._tokenizer = new ICUMessageTokenizer();
            this._tokenizer.input(text);
            try {
                this.expectNext(CURLY_BRACE_OPEN);
                this.expectNext(TEXT); // varname, not used currently, ng always used VAR_PLURAL or VAR_SELECT
                this.expectNext(COMMA);
                var token = this._tokenizer.next();
                if (token.type !== PLURAL && token.type !== SELECT) {
                    return false;
                }
                this.expectNext(COMMA);
                return true;
            }
            catch (error) {
                return false;
            }
        };
        /**
         * Read next token and expect, that it is of the given type.
         * @param tokentype expected type.
         * @return Token
         * @throws error, if next token has wrong type.
         */
        ParsedMessagePartICUMessage.prototype.expectNext = function (tokentype) {
            var token = this._tokenizer.next();
            if (token.type !== tokentype) {
                throw new Error(util.format('Error parsing ICU Message: expected %s, found %s (%s) (message %s)', tokentype, token.type, token.value, this._messageText));
            }
            return token;
        };
        /**
         * Parse XML text to normalized message.
         * @param message message in format dependent xml syntax.
         * @return normalized message
         */
        ParsedMessagePartICUMessage.prototype.parseNativeSubMessage = function (message) {
            return this._parser.createNormalizedMessageFromXMLString(message, null);
        };
        return ParsedMessagePartICUMessage;
    }(ParsedMessagePart));

    /**
     * Created by martin on 05.05.2017.
     * A reference to an ICU message
     * icu references are numbered from 0 to n.
     */
    var ParsedMessagePartICUMessageRef = /** @class */ (function (_super) {
        __extends(ParsedMessagePartICUMessageRef, _super);
        function ParsedMessagePartICUMessageRef(index, disp) {
            var _this = _super.call(this, ParsedMessagePartType.ICU_MESSAGE_REF) || this;
            _this._index = index;
            _this._disp = disp;
            return _this;
        }
        ParsedMessagePartICUMessageRef.prototype.asDisplayString = function (format) {
            return '<ICU-Message-Ref_' + this._index + '/>';
        };
        ParsedMessagePartICUMessageRef.prototype.index = function () {
            return this._index;
        };
        ParsedMessagePartICUMessageRef.prototype.disp = function () {
            return this._disp;
        };
        return ParsedMessagePartICUMessageRef;
    }(ParsedMessagePart));

    /**
     * Created by martin on 14.06.2017.
     * A message part consisting of an empty tag like <br/>.
     */
    var ParsedMessagePartEmptyTag = /** @class */ (function (_super) {
        __extends(ParsedMessagePartEmptyTag, _super);
        function ParsedMessagePartEmptyTag(tagname, idcounter) {
            var _this = _super.call(this, ParsedMessagePartType.EMPTY_TAG) || this;
            _this._tagname = tagname;
            _this._idcounter = idcounter;
            return _this;
        }
        ParsedMessagePartEmptyTag.prototype.asDisplayString = function (format) {
            if (this._idcounter === 0) {
                return '<' + this._tagname + '>';
            }
            else {
                return '<' + this._tagname + ' id="' + this._idcounter.toString() + '">';
            }
        };
        ParsedMessagePartEmptyTag.prototype.tagName = function () {
            return this._tagname;
        };
        ParsedMessagePartEmptyTag.prototype.idCounter = function () {
            return this._idcounter;
        };
        return ParsedMessagePartEmptyTag;
    }(ParsedMessagePart));

    /**
     * Created by martin on 05.05.2017.
     * A message text read from a translation file.
     * Can contain placeholders, tags, text.
     * This class is a representation independent of the concrete format.
     */
    var ParsedMessage = /** @class */ (function () {
        function ParsedMessage(parser, sourceMessage) {
            this._parser = parser;
            this.sourceMessage = sourceMessage;
            this._parts = [];
        }
        /**
         * Get the parser (for tests only, not part of API)
         * @return parser
         */
        ParsedMessage.prototype.getParser = function () {
            return this._parser;
        };
        /**
         * Create a new normalized message as a translation of this one.
         * @param normalizedString the translation in normalized form.
         * If the message is an ICUMessage (getICUMessage returns a value), use translateICUMessage instead.
         * @throws an error if normalized string is not well formed.
         * Throws an error too, if this is an ICU message.
         */
        ParsedMessage.prototype.translate = function (normalizedString) {
            if (util.isNullOrUndefined(this.getICUMessage())) {
                return this._parser.parseNormalizedString(normalizedString, this);
            }
            else {
                throw new Error(util.format('cannot translate ICU message with simple string, use translateICUMessage() instead ("%s", "%s")', normalizedString, this.asNativeString()));
            }
        };
        /**
         * Create a new normalized icu message as a translation of this one.
         * @param icuTranslation the translation, this is the translation of the ICU message,
         * which is not a string, but a collections of the translations of the different categories.
         * The message must be an ICUMessage (getICUMessage returns a value)
         * @throws an error if normalized string is not well formed.
         * Throws an error too, if this is not an ICU message.
         */
        ParsedMessage.prototype.translateICUMessage = function (icuTranslation) {
            var icuMessage = this.getICUMessage();
            if (util.isNullOrUndefined(icuMessage)) {
                throw new Error(util.format('this is not an ICU message, use translate() instead ("%s", "%s")', icuTranslation, this.asNativeString()));
            }
            else {
                var translatedICUMessage = icuMessage.translate(icuTranslation);
                return this._parser.parseICUMessage(translatedICUMessage.asNativeString(), this);
            }
        };
        /**
         * Create a new normalized message from a native xml string as a translation of this one.
         * @param nativeString xml string in the format of the underlying file format.
         * Throws an error if native string is not acceptable.
         */
        ParsedMessage.prototype.translateNativeString = function (nativeString) {
            return this._parser.createNormalizedMessageFromXMLString(nativeString, this);
        };
        /**
         * normalized message as string.
         * @param displayFormat optional way to determine the exact syntax.
         * Allowed formats are defined as constants NORMALIZATION_FORMAT...
         */
        ParsedMessage.prototype.asDisplayString = function (displayFormat) {
            return this._parts.map(function (part) { return part.asDisplayString(displayFormat); }).join('');
        };
        /**
         * Returns the message content as format dependent native string.
         * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
         */
        ParsedMessage.prototype.asNativeString = function () {
            if (util.isNullOrUndefined(this.getICUMessage())) {
                return DOMUtilities.getXMLContent(this._xmlRepresentation);
            }
            else {
                return this.getICUMessage().asNativeString();
            }
        };
        /**
         * Validate the message.
         * @return null, if ok, error object otherwise.
         */
        ParsedMessage.prototype.validate = function () {
            var hasErrors = false;
            var errors = {};
            var e;
            e = this.checkPlaceholderAdded();
            if (!util.isNullOrUndefined(e)) {
                errors.placeholderAdded = e;
                hasErrors = true;
            }
            e = this.checkICUMessageRefRemoved();
            if (!util.isNullOrUndefined(e)) {
                errors.icuMessageRefRemoved = e;
                hasErrors = true;
            }
            e = this.checkICUMessageRefAdded();
            if (!util.isNullOrUndefined(e)) {
                errors.icuMessageRefAdded = e;
                hasErrors = true;
            }
            return hasErrors ? errors : null;
        };
        /**
         * Validate the message, check for warnings only.
         * A warning shows, that the message is acceptable, but misses something.
         * E.g. if you remove a placeholder or a special tag from the original message, this generates a warning.
         * @return null, if no warning, warnings as error object otherwise.
         */
        ParsedMessage.prototype.validateWarnings = function () {
            var hasWarnings = false;
            var warnings = {};
            var w;
            w = this.checkPlaceholderRemoved();
            if (!util.isNullOrUndefined(w)) {
                warnings.placeholderRemoved = w;
                hasWarnings = true;
            }
            w = this.checkTagRemoved();
            if (!util.isNullOrUndefined(w)) {
                warnings.tagRemoved = w;
                hasWarnings = true;
            }
            w = this.checkTagAdded();
            if (!util.isNullOrUndefined(w)) {
                warnings.tagAdded = w;
                hasWarnings = true;
            }
            return hasWarnings ? warnings : null;
        };
        /**
         * Test wether this message is an ICU message.
         * @return true, if it is an ICU message.
         */
        ParsedMessage.prototype.isICUMessage = function () {
            return this._parts.length === 1 && this._parts[0].type === ParsedMessagePartType.ICU_MESSAGE;
        };
        /**
         * Test wether this message contains an ICU message reference.
         * ICU message references are something like <x ID="ICU"../>.
         * @return true, if there is an ICU message reference in the message.
         */
        ParsedMessage.prototype.containsICUMessageRef = function () {
            return this._parts.findIndex(function (part) { return part.type === ParsedMessagePartType.ICU_MESSAGE_REF; }) >= 0;
        };
        /**
         * If this message is an ICU message, returns its structure.
         * Otherwise this method returns null.
         * @return ICUMessage or null.
         */
        ParsedMessage.prototype.getICUMessage = function () {
            if (this._parts.length === 1 && this._parts[0].type === ParsedMessagePartType.ICU_MESSAGE) {
                var icuPart = this._parts[0];
                return icuPart.getICUMessage();
            }
            else {
                return null;
            }
        };
        /**
         * Check for added placeholder.
         * @return null or message, if fulfilled.
         */
        ParsedMessage.prototype.checkPlaceholderAdded = function () {
            var e = null;
            var suspiciousIndexes = [];
            if (this.sourceMessage) {
                var sourcePlaceholders_1 = this.sourceMessage.allPlaceholders();
                var myPlaceholders = this.allPlaceholders();
                myPlaceholders.forEach(function (index) {
                    if (!sourcePlaceholders_1.has(index)) {
                        suspiciousIndexes.push(index);
                    }
                });
            }
            if (suspiciousIndexes.length === 1) {
                e = 'added placeholder ' + suspiciousIndexes[0] + ', which is not in original message';
            }
            else if (suspiciousIndexes.length > 1) {
                var allSuspiciousIndexes_1 = '';
                var first_1 = true;
                suspiciousIndexes.forEach(function (index) {
                    if (!first_1) {
                        allSuspiciousIndexes_1 = allSuspiciousIndexes_1 + ', ';
                    }
                    allSuspiciousIndexes_1 = allSuspiciousIndexes_1 + index;
                    first_1 = false;
                });
                e = 'added placeholders ' + allSuspiciousIndexes_1 + ', which are not in original message';
            }
            return e;
        };
        /**
         * Check for removed placeholder.
         * @return null or message, if fulfilled.
         */
        ParsedMessage.prototype.checkPlaceholderRemoved = function () {
            var w = null;
            var suspiciousIndexes = [];
            if (this.sourceMessage) {
                var sourcePlaceholders = this.sourceMessage.allPlaceholders();
                var myPlaceholders_1 = this.allPlaceholders();
                sourcePlaceholders.forEach(function (index) {
                    if (!myPlaceholders_1.has(index)) {
                        suspiciousIndexes.push(index);
                    }
                });
            }
            if (suspiciousIndexes.length === 1) {
                w = 'removed placeholder ' + suspiciousIndexes[0] + ' from original message';
            }
            else if (suspiciousIndexes.length > 1) {
                var allSuspiciousIndexes_2 = '';
                var first_2 = true;
                suspiciousIndexes.forEach(function (index) {
                    if (!first_2) {
                        allSuspiciousIndexes_2 = allSuspiciousIndexes_2 + ', ';
                    }
                    allSuspiciousIndexes_2 = allSuspiciousIndexes_2 + index;
                    first_2 = false;
                });
                w = 'removed placeholders ' + allSuspiciousIndexes_2 + ' from original message';
            }
            return w;
        };
        /**
         * Check for added ICU Message Refs.
         * @return null or message, if fulfilled.
         */
        ParsedMessage.prototype.checkICUMessageRefAdded = function () {
            var e = null;
            var suspiciousIndexes = [];
            if (this.sourceMessage) {
                var sourceICURefs_1 = this.sourceMessage.allICUMessageRefs();
                var myICURefs = this.allICUMessageRefs();
                myICURefs.forEach(function (index) {
                    if (!sourceICURefs_1.has(index)) {
                        suspiciousIndexes.push(index);
                    }
                });
            }
            if (suspiciousIndexes.length === 1) {
                e = 'added ICU message reference ' + suspiciousIndexes[0] + ', which is not in original message';
            }
            else if (suspiciousIndexes.length > 1) {
                var allSuspiciousIndexes_3 = '';
                var first_3 = true;
                suspiciousIndexes.forEach(function (index) {
                    if (!first_3) {
                        allSuspiciousIndexes_3 = allSuspiciousIndexes_3 + ', ';
                    }
                    allSuspiciousIndexes_3 = allSuspiciousIndexes_3 + index;
                    first_3 = false;
                });
                e = 'added ICU message references ' + allSuspiciousIndexes_3 + ', which are not in original message';
            }
            return e;
        };
        /**
         * Check for removed ICU Message Refs.
         * @return null or message, if fulfilled.
         */
        ParsedMessage.prototype.checkICUMessageRefRemoved = function () {
            var e = null;
            var suspiciousIndexes = [];
            if (this.sourceMessage) {
                var sourceICURefs = this.sourceMessage.allICUMessageRefs();
                var myICURefs_1 = this.allICUMessageRefs();
                sourceICURefs.forEach(function (index) {
                    if (!myICURefs_1.has(index)) {
                        suspiciousIndexes.push(index);
                    }
                });
            }
            if (suspiciousIndexes.length === 1) {
                e = 'removed ICU message reference ' + suspiciousIndexes[0] + ' from original message';
            }
            else if (suspiciousIndexes.length > 1) {
                var allSuspiciousIndexes_4 = '';
                var first_4 = true;
                suspiciousIndexes.forEach(function (index) {
                    if (!first_4) {
                        allSuspiciousIndexes_4 = allSuspiciousIndexes_4 + ', ';
                    }
                    allSuspiciousIndexes_4 = allSuspiciousIndexes_4 + index;
                    first_4 = false;
                });
                e = 'removed ICU message references ' + allSuspiciousIndexes_4 + ' from original message';
            }
            return e;
        };
        /**
         * Get all indexes of placeholders used in the message.
         */
        ParsedMessage.prototype.allPlaceholders = function () {
            var result = new Set();
            this.parts().forEach(function (part) {
                if (part.type === ParsedMessagePartType.PLACEHOLDER) {
                    var index = part.index();
                    result.add(index);
                }
            });
            return result;
        };
        /**
         * Return the disp-Attribute of placeholder
         * @param index index of placeholder
         * @return disp or null
         */
        ParsedMessage.prototype.getPlaceholderDisp = function (index) {
            var placeHolder = null;
            this.parts().forEach(function (part) {
                if (part.type === ParsedMessagePartType.PLACEHOLDER) {
                    var phPart = part;
                    if (phPart.index() === index) {
                        placeHolder = phPart;
                    }
                }
            });
            return placeHolder ? placeHolder.disp() : null;
        };
        /**
         * Get all indexes of ICU message refs used in the message.
         */
        ParsedMessage.prototype.allICUMessageRefs = function () {
            var result = new Set();
            this.parts().forEach(function (part) {
                if (part.type === ParsedMessagePartType.ICU_MESSAGE_REF) {
                    var index = part.index();
                    result.add(index);
                }
            });
            return result;
        };
        /**
         * Return the disp-Attribute of icu message ref
         * @param index of ref
         * @return disp or null
         */
        ParsedMessage.prototype.getICUMessageRefDisp = function (index) {
            var icuMessageRefPart = null;
            this.parts().forEach(function (part) {
                if (part.type === ParsedMessagePartType.ICU_MESSAGE_REF) {
                    var refPart = part;
                    if (refPart.index() === index) {
                        icuMessageRefPart = refPart;
                    }
                }
            });
            return icuMessageRefPart ? icuMessageRefPart.disp() : null;
        };
        /**
         * Check for added tags.
         * @return null or message, if fulfilled.
         */
        ParsedMessage.prototype.checkTagAdded = function () {
            var e = null;
            var suspiciousTags = [];
            if (this.sourceMessage) {
                var sourceTags_1 = this.sourceMessage.allTags();
                var myTags = this.allTags();
                myTags.forEach(function (tagName) {
                    if (!sourceTags_1.has(tagName)) {
                        suspiciousTags.push(tagName);
                    }
                });
            }
            if (suspiciousTags.length === 1) {
                e = 'added tag <' + suspiciousTags[0] + '>, which is not in original message';
            }
            else if (suspiciousTags.length > 1) {
                var allSuspiciousTags_1 = '';
                var first_5 = true;
                suspiciousTags.forEach(function (tag) {
                    if (!first_5) {
                        allSuspiciousTags_1 = allSuspiciousTags_1 + ', ';
                    }
                    allSuspiciousTags_1 = allSuspiciousTags_1 + '<' + tag + '>';
                    first_5 = false;
                });
                e = 'added tags ' + allSuspiciousTags_1 + ', which are not in original message';
            }
            return e;
        };
        /**
         * Check for removed tags.
         * @return null or message, if fulfilled.
         */
        ParsedMessage.prototype.checkTagRemoved = function () {
            var w = null;
            var suspiciousTags = [];
            if (this.sourceMessage) {
                var sourceTags = this.sourceMessage.allTags();
                var myTags_1 = this.allTags();
                sourceTags.forEach(function (tagName) {
                    if (!myTags_1.has(tagName)) {
                        suspiciousTags.push(tagName);
                    }
                });
            }
            if (suspiciousTags.length === 1) {
                w = 'removed tag <' + suspiciousTags[0] + '> from original message';
            }
            else if (suspiciousTags.length > 1) {
                var allSuspiciousTags_2 = '';
                var first_6 = true;
                suspiciousTags.forEach(function (tag) {
                    if (!first_6) {
                        allSuspiciousTags_2 = allSuspiciousTags_2 + ', ';
                    }
                    allSuspiciousTags_2 = allSuspiciousTags_2 + '<' + tag + '>';
                    first_6 = false;
                });
                w = 'removed tags ' + allSuspiciousTags_2 + ' from original message';
            }
            return w;
        };
        /**
         * Get all tag names used in the message.
         */
        ParsedMessage.prototype.allTags = function () {
            var result = new Set();
            this.parts().forEach(function (part) {
                if (part.type === ParsedMessagePartType.START_TAG || part.type === ParsedMessagePartType.EMPTY_TAG) {
                    var tagName = part.tagName();
                    result.add(tagName);
                }
            });
            return result;
        };
        ParsedMessage.prototype.parts = function () {
            return this._parts;
        };
        ParsedMessage.prototype.setXmlRepresentation = function (xmlRepresentation) {
            this._xmlRepresentation = xmlRepresentation;
        };
        ParsedMessage.prototype.addText = function (text) {
            this._parts.push(new ParsedMessagePartText(text));
        };
        ParsedMessage.prototype.addPlaceholder = function (index, disp) {
            this._parts.push(new ParsedMessagePartPlaceholder(index, disp));
        };
        ParsedMessage.prototype.addStartTag = function (tagname, idcounter) {
            this._parts.push(new ParsedMessagePartStartTag(tagname, idcounter));
        };
        ParsedMessage.prototype.addEndTag = function (tagname) {
            // check if well formed
            var openTag = this.calculateOpenTagName();
            if (!openTag || openTag !== tagname) {
                // oops, not well formed
                throw new Error(util.format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagname, openTag, this.asNativeString()));
            }
            this._parts.push(new ParsedMessagePartEndTag(tagname));
        };
        ParsedMessage.prototype.addEmptyTag = function (tagname, idcounter) {
            this._parts.push(new ParsedMessagePartEmptyTag(tagname, idcounter));
        };
        ParsedMessage.prototype.addICUMessageRef = function (index, disp) {
            this._parts.push(new ParsedMessagePartICUMessageRef(index, disp));
        };
        ParsedMessage.prototype.addICUMessage = function (text) {
            this._parts.push(new ParsedMessagePartICUMessage(text, this._parser));
        };
        /**
         * Determine, wether there is an open tag, that is not closed.
         * Returns the latest one or null, if there is no open tag.
         */
        ParsedMessage.prototype.calculateOpenTagName = function () {
            var _this = this;
            var openTags = [];
            this._parts.forEach(function (part) {
                switch (part.type) {
                    case ParsedMessagePartType.START_TAG:
                        openTags.push(part.tagName());
                        break;
                    case ParsedMessagePartType.END_TAG:
                        var tagName = part.tagName();
                        if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                            // oops, not well formed
                            var openTag = (openTags.length === 0) ? 'nothing' : openTags[openTags.length - 1];
                            throw new Error(util.format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagName, openTag, _this.asNativeString()));
                        }
                        openTags.pop();
                }
            });
            return openTags.length === 0 ? null : openTags[openTags.length - 1];
        };
        return ParsedMessage;
    }());

    /**
     * Created by martin on 14.05.2017.
     * A tokenizer for normalized messages.
     */
    // Tokens
    var TEXT$1 = 'TEXT';
    var START_TAG = 'START_TAG';
    var END_TAG = 'END_TAG';
    var EMPTY_TAG = 'EMPTY_TAG';
    var PLACEHOLDER = 'PLACEHOLDER';
    var ICU_MESSAGE_REF = 'ICU_MESSAGE_REF';
    var ICU_MESSAGE = 'ICU_MESSAGE';
    var ParsedMesageTokenizer = /** @class */ (function () {
        function ParsedMesageTokenizer() {
        }
        ParsedMesageTokenizer.prototype.getLexer = function () {
            var lexer = new Tokenizr__namespace();
            var plaintext = '';
            lexer.before(function (ctx, match, rule) {
                if (rule.name !== TEXT$1 && plaintext !== '') {
                    ctx.accept(TEXT$1, { text: plaintext });
                    plaintext = '';
                }
            });
            lexer.finish(function (ctx) {
                if (plaintext !== '') {
                    ctx.accept(TEXT$1, { text: plaintext });
                }
            });
            // empty tag, there are only a few allowed (see tag-mappings): ['BR', 'HR', 'IMG', 'AREA', 'LINK', 'WBR']
            // format is <name id="nr">, nr ist optional, z.B. <img> oder <img id="2">
            lexer.rule(/<(br|hr|img|area|link|wbr)( id="([0-9])*")?\>/, function (ctx, match) {
                var idcount = util.isNullOrUndefined(match[3]) ? 0 : parseInt(match[3], 10);
                ctx.accept(EMPTY_TAG, { name: match[1], idcounter: idcount });
            }, EMPTY_TAG);
            // start tag, Format <name id="nr">, nr ist optional, z.B. <mytag> oder <mytag id="2">
            lexer.rule(/<([a-zA-Z][a-zA-Z-0-9]*)( id="([0-9]*)")?>/, function (ctx, match) {
                var idcount = util.isNullOrUndefined(match[3]) ? 0 : parseInt(match[3], 10);
                ctx.accept(START_TAG, { name: match[1], idcounter: idcount });
            }, START_TAG);
            // end tag
            lexer.rule(/<\/([a-zA-Z][a-zA-Z-0-9]*)>/, function (ctx, match) {
                ctx.accept(END_TAG, { name: match[1] });
            }, END_TAG);
            // placeholder
            lexer.rule(/{{([0-9]+)}}/, function (ctx, match) {
                ctx.accept(PLACEHOLDER, { idcounter: parseInt(match[1], 10) });
            }, PLACEHOLDER);
            // icu message ref
            lexer.rule(/<ICU-Message-Ref_([0-9]+)\/>/, function (ctx, match) {
                ctx.accept(ICU_MESSAGE_REF, { idcounter: parseInt(match[1], 10) });
            }, ICU_MESSAGE_REF);
            // icu message
            lexer.rule(/<ICU-Message\/>/, function (ctx, match) {
                ctx.accept(ICU_MESSAGE, { message: match[0] });
            }, ICU_MESSAGE);
            // text
            lexer.rule(/./, function (ctx, match) {
                plaintext += match[0];
                ctx.ignore();
            }, TEXT$1);
            lexer.rule(/[\t\r\n]+/, function (ctx, match) {
                plaintext += match[0];
                ctx.ignore();
            }, TEXT$1);
            return lexer;
        };
        ParsedMesageTokenizer.prototype.tokenize = function (normalizedMessage) {
            var lexer = this.getLexer();
            lexer.reset();
            lexer.input(normalizedMessage);
            return lexer.tokens();
        };
        return ParsedMesageTokenizer;
    }());

    /**
     * Created by roobm on 10.05.2017.
     * A message parser can parse the xml content of a translatable message.
     * It generates a ParsedMessage from it.
     */
    var AbstractMessageParser = /** @class */ (function () {
        function AbstractMessageParser() {
        }
        /**
         * Parse XML to ParsedMessage.
         * @param xmlElement the xml representation
         * @param sourceMessage optional original message that will be translated by normalized new one
         * Throws an error if normalized xml is not well formed.
         */
        AbstractMessageParser.prototype.createNormalizedMessageFromXML = function (xmlElement, sourceMessage) {
            var message = new ParsedMessage(this, sourceMessage);
            if (xmlElement) {
                message.setXmlRepresentation(xmlElement);
                this.addPartsOfNodeToMessage(xmlElement, message, false);
            }
            return message;
        };
        /**
         * Parse XML string to ParsedMessage.
         * @param xmlString the xml representation without root element, e.g. this is <ph x></ph> an example.
         * @param sourceMessage optional original message that will be translated by normalized new one
         * Throws an error if normalized xml is not well formed.
         */
        AbstractMessageParser.prototype.createNormalizedMessageFromXMLString = function (xmlString, sourceMessage) {
            var doc = new xmldom.DOMParser().parseFromString('<dummy>' + xmlString + '</dummy>', 'text/xml');
            var xmlElement = doc.childNodes.item(0);
            return this.createNormalizedMessageFromXML(xmlElement, sourceMessage);
        };
        /**
         * recursively run through a node and add all identified parts to the message.
         * @param node node
         * @param message message to be generated.
         * @param includeSelf if true, add node by itself, otherwise only children.
         */
        AbstractMessageParser.prototype.addPartsOfNodeToMessage = function (node, message, includeSelf) {
            var processChildren = true;
            if (includeSelf) {
                if (node.nodeType === node.TEXT_NODE) {
                    message.addText(node.textContent);
                    return;
                }
                if (node.nodeType === node.ELEMENT_NODE) {
                    processChildren = this.processStartElement(node, message);
                }
            }
            if (processChildren) {
                var icuMessageText = this.getICUMessageText(node);
                var isICU = !util.isNullOrUndefined(icuMessageText);
                if (isICU) {
                    try {
                        message.addICUMessage(icuMessageText);
                    }
                    catch (error) {
                        // if it is not parsable, handle it as non ICU
                        console.log('non ICU message: ', icuMessageText, error);
                        isICU = false;
                    }
                }
                if (!isICU) {
                    var children = node.childNodes;
                    for (var i = 0; i < children.length; i++) {
                        this.addPartsOfNodeToMessage(children.item(i), message, true);
                    }
                }
            }
            if (node.nodeType === node.ELEMENT_NODE) {
                this.processEndElement(node, message);
            }
        };
        /**
         * Return the ICU message content of the node, if it is an ICU Message.
         * @param node node
         * @return message or null, if it is no ICU Message.
         */
        AbstractMessageParser.prototype.getICUMessageText = function (node) {
            var children = node.childNodes;
            if (children.length === 0) {
                return null;
            }
            var firstChild = children.item(0);
            if (firstChild.nodeType === firstChild.TEXT_NODE) {
                if (this.isICUMessageStart(firstChild.textContent)) {
                    return DOMUtilities.getXMLContent(node);
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        /**
         * Test, wether text is beginning of ICU Message.
         * @param text text
         */
        AbstractMessageParser.prototype.isICUMessageStart = function (text) {
            return ParsedMessagePartICUMessage.looksLikeICUMessage(text);
            //        return text.startsWith('{VAR_PLURAL') || text.startsWith('{VAR_SELECT');
        };
        /**
         * Parse normalized string to ParsedMessage.
         * @param normalizedString normalized string
         * @param sourceMessage optional original message that will be translated by normalized new one
         * @return a new parsed message.
         * Throws an error if normalized string is not well formed.
         */
        AbstractMessageParser.prototype.parseNormalizedString = function (normalizedString, sourceMessage) {
            var message = new ParsedMessage(this, sourceMessage);
            var openTags = [];
            var tokens;
            try {
                tokens = new ParsedMesageTokenizer().tokenize(normalizedString);
            }
            catch (error) {
                throw new Error(util.format('unexpected error while parsing message: "%s" (parsed "%")', error.message, normalizedString));
            }
            tokens.forEach(function (token) {
                var disp = null;
                switch (token.type) {
                    case TEXT$1:
                        message.addText(token.value.text);
                        break;
                    case START_TAG:
                        message.addStartTag(token.value.name, token.value.idcounter);
                        openTags.push(token.value.name);
                        break;
                    case END_TAG:
                        message.addEndTag(token.value.name);
                        if (openTags.length === 0 || openTags[openTags.length - 1] !== token.value.name) {
                            // oops, not well formed
                            throw new Error(util.format('unexpected close tag "%s" (parsed "%s")', token.value.name, normalizedString));
                        }
                        openTags.pop();
                        break;
                    case EMPTY_TAG:
                        message.addEmptyTag(token.value.name, token.value.idcounter);
                        break;
                    case PLACEHOLDER:
                        disp = (sourceMessage) ? sourceMessage.getPlaceholderDisp(token.value.idcounter) : null;
                        message.addPlaceholder(token.value.idcounter, disp);
                        break;
                    case ICU_MESSAGE_REF:
                        disp = (sourceMessage) ? sourceMessage.getICUMessageRefDisp(token.value.idcounter) : null;
                        message.addICUMessageRef(token.value.idcounter, disp);
                        break;
                    case ICU_MESSAGE:
                        throw new Error(util.format('<ICUMessage/> not allowed here, use parseICUMessage instead (parsed "%")', normalizedString));
                    default:
                        break;
                }
            });
            if (openTags.length > 0) {
                // oops, not well closed tags
                throw new Error(util.format('missing close tag "%s" (parsed "%s")', openTags[openTags.length - 1], normalizedString));
            }
            message.setXmlRepresentation(this.createXmlRepresentation(message));
            return message;
        };
        /**
         * Parse a string, that is an ICU message, to ParsedMessage.
         * @param icuMessageString the message, like '{x, plural, =0 {nothing} =1 {one} other {many}}'.
         * @param sourceMessage optional original message that will be translated by normalized new one
         * @return a new parsed message.
         * Throws an error if icuMessageString has not the correct syntax.
         */
        AbstractMessageParser.prototype.parseICUMessage = function (icuMessageString, sourceMessage) {
            var message = new ParsedMessage(this, sourceMessage);
            message.addICUMessage(icuMessageString);
            return message;
        };
        /**
         * Helper function: Parse ID from a name.
         * name optionally ends with _<number>. This is the idcount.
         * E.g. name="TAG_IMG" returns 0
         * name = "TAG_IMG_1" returns 1
         * @param name name
         * @return id count
         */
        AbstractMessageParser.prototype.parseIdCountFromName = function (name) {
            var regex = /.*_([0-9]*)/;
            var match = regex.exec(name);
            if (util.isNullOrUndefined(match) || match[1] === '') {
                return 0;
            }
            else {
                var num = match[1];
                return parseInt(num, 10);
            }
        };
        /**
         * Create the native xml for a message.
         * Parts are already set here.
         * @param message message
         */
        AbstractMessageParser.prototype.createXmlRepresentation = function (message) {
            var root = new xmldom.DOMParser().parseFromString('<dummy/>', 'text/xml');
            var rootElem = root.getElementsByTagName('dummy').item(0);
            this.addXmlRepresentationToRoot(message, rootElem);
            return rootElem;
        };
        AbstractMessageParser.prototype.createXmlRepresentationOfTextPart = function (part, rootElem) {
            return rootElem.ownerDocument.createTextNode(part.asDisplayString());
        };
        return AbstractMessageParser;
    }());

    /**
     * Created by roobm on 16.05.2017.
     * Mapping from normalized tag names to placeholder names.
     */
    /*
    copied from https://github.com/angular/angular/blob/master/packages/compiler/src/i18n/serializers/placeholder.ts
     */
    var TAG_TO_PLACEHOLDER_NAMES = {
        'A': 'LINK',
        'B': 'BOLD_TEXT',
        'BR': 'LINE_BREAK',
        'EM': 'EMPHASISED_TEXT',
        'H1': 'HEADING_LEVEL1',
        'H2': 'HEADING_LEVEL2',
        'H3': 'HEADING_LEVEL3',
        'H4': 'HEADING_LEVEL4',
        'H5': 'HEADING_LEVEL5',
        'H6': 'HEADING_LEVEL6',
        'HR': 'HORIZONTAL_RULE',
        'I': 'ITALIC_TEXT',
        'LI': 'LIST_ITEM',
        'LINK': 'MEDIA_LINK',
        'OL': 'ORDERED_LIST',
        'P': 'PARAGRAPH',
        'Q': 'QUOTATION',
        'S': 'STRIKETHROUGH_TEXT',
        'SMALL': 'SMALL_TEXT',
        'SUB': 'SUBSTRIPT',
        'SUP': 'SUPERSCRIPT',
        'TBODY': 'TABLE_BODY',
        'TD': 'TABLE_CELL',
        'TFOOT': 'TABLE_FOOTER',
        'TH': 'TABLE_HEADER_CELL',
        'THEAD': 'TABLE_HEADER',
        'TR': 'TABLE_ROW',
        'TT': 'MONOSPACED_TEXT',
        'U': 'UNDERLINED_TEXT',
        'UL': 'UNORDERED_LIST',
    };
    /**
     * HTML Tags (in uppercase) that are empty, they have no content, but do not need a close tag, e.g. <br>, <img>, <hr>.
     */
    var VOID_TAGS = ['BR', 'HR', 'IMG', 'AREA', 'LINK', 'WBR'];
    var TagMapping = /** @class */ (function () {
        function TagMapping() {
        }
        TagMapping.prototype.getStartTagPlaceholderName = function (tag, id) {
            var upperTag = tag.toUpperCase();
            var baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || "TAG_" + upperTag;
            return "START_" + baseName + this.counterString(id);
        };
        TagMapping.prototype.getCloseTagPlaceholderName = function (tag) {
            var upperTag = tag.toUpperCase();
            var baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || "TAG_" + upperTag;
            return "CLOSE_" + baseName;
        };
        TagMapping.prototype.getEmptyTagPlaceholderName = function (tag, id) {
            var upperTag = tag.toUpperCase();
            var baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || "TAG_" + upperTag;
            return baseName + this.counterString(id);
        };
        TagMapping.prototype.getCtypeForTag = function (tag) {
            switch (tag.toLowerCase()) {
                case 'br':
                    return 'lb';
                case 'img':
                    return 'image';
                default:
                    return "x-" + tag;
            }
        };
        TagMapping.prototype.getTagnameFromStartTagPlaceholderName = function (placeholderName) {
            if (placeholderName.startsWith('START_TAG_')) {
                return this.stripCounter(placeholderName.substring('START_TAG_'.length)).toLowerCase();
            }
            else if (placeholderName.startsWith('START_')) {
                var ph_1 = this.stripCounter(placeholderName.substring('START_'.length));
                var matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find(function (key) { return TAG_TO_PLACEHOLDER_NAMES[key] === ph_1; });
                return matchKey ? matchKey.toLowerCase() : null;
            }
            return null;
        };
        TagMapping.prototype.getTagnameFromCloseTagPlaceholderName = function (placeholderName) {
            if (placeholderName.startsWith('CLOSE_TAG_')) {
                return this.stripCounter(placeholderName.substring('CLOSE_TAG_'.length)).toLowerCase();
            }
            else if (placeholderName.startsWith('CLOSE_')) {
                var ph_2 = this.stripCounter(placeholderName.substring('CLOSE_'.length));
                var matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find(function (key) { return TAG_TO_PLACEHOLDER_NAMES[key] === ph_2; });
                return matchKey ? matchKey.toLowerCase() : null;
            }
            return null;
        };
        /**
         * Test, wether placeholder name stands for empty html tag.
         * @param placeholderName can be TAG_<name> or just <name>
         */
        TagMapping.prototype.isEmptyTagPlaceholderName = function (placeholderName) {
            var ph = this.stripCounter(placeholderName);
            var matchKey;
            if (ph.startsWith('TAG_')) {
                matchKey = ph.substring(4).toUpperCase();
            }
            else {
                matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find(function (key) { return TAG_TO_PLACEHOLDER_NAMES[key] === ph; });
            }
            if (matchKey) {
                if (VOID_TAGS.indexOf(matchKey) >= 0) {
                    return true;
                }
            }
            return false;
        };
        /**
         * tagname of empty tag placeholder.
         * @param placeholderName can be TAG_<name> or just <name>
         */
        TagMapping.prototype.getTagnameFromEmptyTagPlaceholderName = function (placeholderName) {
            var ph = this.stripCounter(placeholderName);
            var matchKey;
            if (ph.startsWith('TAG_')) {
                matchKey = ph.substring(4).toUpperCase();
            }
            else {
                matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find(function (key) { return TAG_TO_PLACEHOLDER_NAMES[key] === ph; });
            }
            if (matchKey) {
                if (VOID_TAGS.indexOf(matchKey) >= 0) {
                    return matchKey.toLowerCase();
                }
                else {
                    return null;
                }
            }
            return null;
        };
        /**
         * If placeholder ends with _[0-9]+, strip that number.
         * @param placeholderName placeholderName
         * @return placeholderName without counter at end.
         */
        TagMapping.prototype.stripCounter = function (placeholderName) {
            if (placeholderName) {
                var re = /(.*)_[0-9]+$/;
                if (placeholderName.match(re)) {
                    return placeholderName.replace(re, '$1');
                }
            }
            return placeholderName;
        };
        /**
         * String suffix for counter.
         * If counter is 0, it is empty, otherwise _<id>.
         * @param id id
         * @return suffix for counter.
         */
        TagMapping.prototype.counterString = function (id) {
            if (id === 0) {
                return '';
            }
            else {
                return '_' + id.toString(10);
            }
        };
        return TagMapping;
    }());

    /**
     * Created by roobm on 10.05.2017.
     * A message parser for XLIFF 1.2
     */
    var XliffMessageParser = /** @class */ (function (_super) {
        __extends(XliffMessageParser, _super);
        function XliffMessageParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Handle this element node.
         * This is called before the children are done.
         * @param elementNode elementNode
         * @param message message to be altered
         * @return true, if children should be processed too, false otherwise (children ignored then)
         */
        XliffMessageParser.prototype.processStartElement = function (elementNode, message) {
            var tagName = elementNode.tagName;
            var tagMapping = new TagMapping();
            if (tagName === 'x') {
                // placeholder are like <x id="INTERPOLATION"/> or <x id="INTERPOLATION_1">
                var id = elementNode.getAttribute('id');
                if (!id) {
                    return; // should not happen
                }
                if (id.startsWith('INTERPOLATION')) {
                    var index = this.parsePlaceholderIndexFromId(id);
                    message.addPlaceholder(index, null);
                }
                else if (id.startsWith('ICU')) {
                    var index = this.parseICUMessageRefIndexFromId(id);
                    message.addICUMessageRef(index, null);
                }
                else if (id.startsWith('START_')) {
                    var normalizedTagName = tagMapping.getTagnameFromStartTagPlaceholderName(id);
                    if (normalizedTagName) {
                        var idcount = this.parseIdCountFromName(id);
                        message.addStartTag(normalizedTagName, idcount);
                    }
                }
                else if (id.startsWith('CLOSE_')) {
                    var normalizedTagName = tagMapping.getTagnameFromCloseTagPlaceholderName(id);
                    if (normalizedTagName) {
                        message.addEndTag(normalizedTagName);
                    }
                }
                else if (tagMapping.isEmptyTagPlaceholderName(id)) {
                    var normalizedTagName = tagMapping.getTagnameFromEmptyTagPlaceholderName(id);
                    if (normalizedTagName) {
                        var idcount = this.parseIdCountFromName(id);
                        message.addEmptyTag(normalizedTagName, idcount);
                    }
                }
            }
            return true;
        };
        /**
         * Handle end of this element node.
         * This is called after all children are processed.
         * @param elementNode elementNode
         * @param message message to be altered
         */
        XliffMessageParser.prototype.processEndElement = function (elementNode, message) {
        };
        /**
         * Parse id attribute of x element as placeholder index.
         * id can be "INTERPOLATION" or "INTERPOLATION_n"
         * @param id id
         * @return index
         */
        XliffMessageParser.prototype.parsePlaceholderIndexFromId = function (id) {
            var indexString = '';
            if (id === 'INTERPOLATION') {
                indexString = '0';
            }
            else {
                indexString = id.substring('INTERPOLATION_'.length);
            }
            return Number.parseInt(indexString, 10);
        };
        /**
         * Parse id attribute of x element as placeholder index.
         * id can be "INTERPOLATION" or "INTERPOLATION_n"
         * @param id id
         * @return id as number
         */
        XliffMessageParser.prototype.parseICUMessageRefIndexFromId = function (id) {
            var indexString = '';
            if (id === 'ICU') {
                indexString = '0';
            }
            else {
                indexString = id.substring('ICU_'.length);
            }
            return Number.parseInt(indexString, 10);
        };
        XliffMessageParser.prototype.addXmlRepresentationToRoot = function (message, rootElem) {
            var _this = this;
            message.parts().forEach(function (part) {
                var child;
                switch (part.type) {
                    case ParsedMessagePartType.TEXT:
                        child = _this.createXmlRepresentationOfTextPart(part, rootElem);
                        break;
                    case ParsedMessagePartType.START_TAG:
                        child = _this.createXmlRepresentationOfStartTagPart(part, rootElem);
                        break;
                    case ParsedMessagePartType.END_TAG:
                        child = _this.createXmlRepresentationOfEndTagPart(part, rootElem);
                        break;
                    case ParsedMessagePartType.EMPTY_TAG:
                        child = _this.createXmlRepresentationOfEmptyTagPart(part, rootElem);
                        break;
                    case ParsedMessagePartType.PLACEHOLDER:
                        child = _this.createXmlRepresentationOfPlaceholderPart(part, rootElem);
                        break;
                    case ParsedMessagePartType.ICU_MESSAGE_REF:
                        child = _this.createXmlRepresentationOfICUMessageRefPart(part, rootElem);
                        break;
                }
                if (child) {
                    rootElem.appendChild(child);
                }
            });
        };
        /**
         * the xml used for start tag in the message.
         * Returns an empty <x/>-Element with attributes id and ctype
         * @param part part
         * @param rootElem rootElem
         */
        XliffMessageParser.prototype.createXmlRepresentationOfStartTagPart = function (part, rootElem) {
            var xElem = rootElem.ownerDocument.createElement('x');
            var tagMapping = new TagMapping();
            var idAttrib = tagMapping.getStartTagPlaceholderName(part.tagName(), part.idCounter());
            var ctypeAttrib = tagMapping.getCtypeForTag(part.tagName());
            var equivTextAttr = '<' + part.tagName() + '>';
            xElem.setAttribute('id', idAttrib);
            xElem.setAttribute('ctype', ctypeAttrib);
            xElem.setAttribute('equiv-text', equivTextAttr);
            return xElem;
        };
        /**
         * the xml used for end tag in the message.
         * Returns an empty <x/>-Element with attributes id and ctype
         * @param part part
         * @param rootElem rootElem
         */
        XliffMessageParser.prototype.createXmlRepresentationOfEndTagPart = function (part, rootElem) {
            var xElem = rootElem.ownerDocument.createElement('x');
            var tagMapping = new TagMapping();
            var idAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
            var ctypeAttrib = 'x-' + part.tagName();
            xElem.setAttribute('id', idAttrib);
            xElem.setAttribute('ctype', ctypeAttrib);
            return xElem;
        };
        /**
         * the xml used for empty tag in the message.
         * Returns an empty <x/>-Element with attributes id and ctype
         * @param part part
         * @param rootElem rootElem
         */
        XliffMessageParser.prototype.createXmlRepresentationOfEmptyTagPart = function (part, rootElem) {
            var xElem = rootElem.ownerDocument.createElement('x');
            var tagMapping = new TagMapping();
            var idAttrib = tagMapping.getEmptyTagPlaceholderName(part.tagName(), part.idCounter());
            var ctypeAttrib = tagMapping.getCtypeForTag(part.tagName());
            var equivTextAttr = '<' + part.tagName() + '/>';
            xElem.setAttribute('id', idAttrib);
            xElem.setAttribute('ctype', ctypeAttrib);
            xElem.setAttribute('equiv-text', equivTextAttr);
            return xElem;
        };
        /**
         * the xml used for placeholder in the message.
         * Returns an empty <x/>-Element with attribute id="INTERPOLATION" or id="INTERPOLATION_n"
         * @param part part
         * @param rootElem rootElem
         */
        XliffMessageParser.prototype.createXmlRepresentationOfPlaceholderPart = function (part, rootElem) {
            var xElem = rootElem.ownerDocument.createElement('x');
            var idAttrib = 'INTERPOLATION';
            if (part.index() > 0) {
                idAttrib = 'INTERPOLATION_' + part.index().toString(10);
            }
            var equivTextAttr = part.disp();
            xElem.setAttribute('id', idAttrib);
            if (equivTextAttr) {
                xElem.setAttribute('equiv-text', equivTextAttr);
            }
            return xElem;
        };
        /**
         * the xml used for icu message refs in the message.
         * @param part part
         * @param rootElem rootElem
         */
        XliffMessageParser.prototype.createXmlRepresentationOfICUMessageRefPart = function (part, rootElem) {
            var xElem = rootElem.ownerDocument.createElement('x');
            var idAttrib = 'ICU';
            if (part.index() > 0) {
                idAttrib = 'ICU_' + part.index().toString(10);
            }
            xElem.setAttribute('id', idAttrib);
            return xElem;
        };
        return XliffMessageParser;
    }(AbstractMessageParser));

    /**
     * Created by martin on 01.05.2017.
     * A Translation Unit in an XLIFF 1.2 file.
     */
    var XliffTransUnit = /** @class */ (function (_super) {
        __extends(XliffTransUnit, _super);
        function XliffTransUnit(_element, _id, _translationMessagesFile) {
            return _super.call(this, _element, _id, _translationMessagesFile) || this;
        }
        XliffTransUnit.prototype.sourceContent = function () {
            var sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            return DOMUtilities.getXMLContent(sourceElement);
        };
        /**
         * Set new source content in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing changed source content.
         * @param newContent the new content.
         */
        XliffTransUnit.prototype.setSourceContent = function (newContent) {
            var source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            if (!source) {
                // should not happen, there always has to be a source, but who knows..
                source = this._element.appendChild(this._element.ownerDocument.createElement('source'));
            }
            DOMUtilities.replaceContentWithXMLContent(source, newContent);
        };
        /**
         * Return a parser used for normalized messages.
         */
        XliffTransUnit.prototype.messageParser = function () {
            return new XliffMessageParser();
        };
        /**
         * The original text value, that is to be translated, as normalized message.
         */
        XliffTransUnit.prototype.createSourceContentNormalized = function () {
            var sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            if (sourceElement) {
                return this.messageParser().createNormalizedMessageFromXML(sourceElement, null);
            }
            else {
                return null;
            }
        };
        /**
         * the translated value (containing all markup, depends on the concrete format used).
         */
        XliffTransUnit.prototype.targetContent = function () {
            var targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            return DOMUtilities.getXMLContent(targetElement);
        };
        /**
         * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
         * and all embedded html is replaced by direct html markup.
         */
        XliffTransUnit.prototype.targetContentNormalized = function () {
            var targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            return new XliffMessageParser().createNormalizedMessageFromXML(targetElement, this.sourceContentNormalized());
        };
        /**
         * State of the translation as stored in the xml.
         */
        XliffTransUnit.prototype.nativeTargetState = function () {
            var targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            if (targetElement) {
                return targetElement.getAttribute('state');
            }
            else {
                return null;
            }
        };
        /**
         * set state in xml.
         * @param nativeState nativeState
         */
        XliffTransUnit.prototype.setNativeTargetState = function (nativeState) {
            var targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            if (targetElement) {
                targetElement.setAttribute('state', nativeState);
            }
        };
        /**
         * Map an abstract state (new, translated, final) to a concrete state used in the xml.
         * Returns the state to be used in the xml.
         * @param state one of Constants.STATE...
         * @returns a native state (depends on concrete format)
         * @throws error, if state is invalid.
         */
        XliffTransUnit.prototype.mapStateToNativeState = function (state) {
            switch (state) {
                case STATE_NEW:
                    return 'new';
                case STATE_TRANSLATED:
                    return 'translated';
                case STATE_FINAL:
                    return 'final';
                default:
                    throw new Error('unknown state ' + state);
            }
        };
        /**
         * Map a native state (found in the document) to an abstract state (new, translated, final).
         * Returns the abstract state.
         * @param nativeState nativeState
         */
        XliffTransUnit.prototype.mapNativeStateToState = function (nativeState) {
            switch (nativeState) {
                case 'new':
                    return STATE_NEW;
                case 'needs-translation':
                    return STATE_NEW;
                case 'translated':
                    return STATE_TRANSLATED;
                case 'needs-adaptation':
                    return STATE_TRANSLATED;
                case 'needs-l10n':
                    return STATE_TRANSLATED;
                case 'needs-review-adaptation':
                    return STATE_TRANSLATED;
                case 'needs-review-l10n':
                    return STATE_TRANSLATED;
                case 'needs-review-translation':
                    return STATE_TRANSLATED;
                case 'final':
                    return STATE_FINAL;
                case 'signed-off':
                    return STATE_FINAL;
                default:
                    return STATE_NEW;
            }
        };
        /**
         * All the source elements in the trans unit.
         * The source element is a reference to the original template.
         * It contains the name of the template file and a line number with the position inside the template.
         * It is just a help for translators to find the context for the translation.
         * This is set when using Angular 4.0 or greater.
         * Otherwise it just returns an empty array.
         */
        XliffTransUnit.prototype.sourceReferences = function () {
            var sourceElements = this._element.getElementsByTagName('context-group');
            var sourceRefs = [];
            for (var i = 0; i < sourceElements.length; i++) {
                var elem = sourceElements.item(i);
                if (elem.getAttribute('purpose') === 'location') {
                    var contextElements = elem.getElementsByTagName('context');
                    var sourcefile = null;
                    var linenumber = 0;
                    for (var j = 0; j < contextElements.length; j++) {
                        var contextElem = contextElements.item(j);
                        if (contextElem.getAttribute('context-type') === 'sourcefile') {
                            sourcefile = DOMUtilities.getPCDATA(contextElem);
                        }
                        if (contextElem.getAttribute('context-type') === 'linenumber') {
                            linenumber = Number.parseInt(DOMUtilities.getPCDATA(contextElem), 10);
                        }
                    }
                    sourceRefs.push({ sourcefile: sourcefile, linenumber: linenumber });
                }
            }
            return sourceRefs;
        };
        /**
         * Set source ref elements in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing source refs.
         * @param sourceRefs the sourcerefs to set. Old ones are removed.
         */
        XliffTransUnit.prototype.setSourceReferences = function (sourceRefs) {
            var _this = this;
            this.removeAllSourceReferences();
            sourceRefs.forEach(function (ref) {
                var contextGroup = _this._element.ownerDocument.createElement('context-group');
                contextGroup.setAttribute('purpose', 'location');
                var contextSource = _this._element.ownerDocument.createElement('context');
                contextSource.setAttribute('context-type', 'sourcefile');
                contextSource.appendChild(_this._element.ownerDocument.createTextNode(ref.sourcefile));
                var contextLine = _this._element.ownerDocument.createElement('context');
                contextLine.setAttribute('context-type', 'linenumber');
                contextLine.appendChild(_this._element.ownerDocument.createTextNode(ref.linenumber.toString(10)));
                contextGroup.appendChild(contextSource);
                contextGroup.appendChild(contextLine);
                _this._element.appendChild(contextGroup);
            });
        };
        XliffTransUnit.prototype.removeAllSourceReferences = function () {
            var sourceElements = this._element.getElementsByTagName('context-group');
            var toBeRemoved = [];
            for (var i = 0; i < sourceElements.length; i++) {
                var elem = sourceElements.item(i);
                if (elem.getAttribute('purpose') === 'location') {
                    toBeRemoved.push(elem);
                }
            }
            toBeRemoved.forEach(function (elem) { elem.parentNode.removeChild(elem); });
        };
        /**
         * The description set in the template as value of the i18n-attribute.
         * e.g. i18n="mydescription".
         * In xliff this is stored as a note element with attribute from="description".
         */
        XliffTransUnit.prototype.description = function () {
            var noteElem = this.findNoteElementWithFromAttribute('description');
            if (noteElem) {
                return DOMUtilities.getPCDATA(noteElem);
            }
            else {
                return null;
            }
        };
        /**
         * Change description property of trans-unit.
         * @param description description
         */
        XliffTransUnit.prototype.setDescription = function (description) {
            var noteElem = this.findNoteElementWithFromAttribute('description');
            if (description) {
                if (util.isNullOrUndefined(noteElem)) {
                    // create it
                    noteElem = this.createNoteElementWithFromAttribute('description', description);
                }
                else {
                    DOMUtilities.replaceContentWithXMLContent(noteElem, description);
                }
            }
            else {
                if (!util.isNullOrUndefined(noteElem)) {
                    // remove node
                    this.removeNoteElementWithFromAttribute('description');
                }
            }
        };
        /**
         * Find a note element with attribute from='<attrValue>'
         * @param attrValue attrValue
         * @return element or null is absent
         */
        XliffTransUnit.prototype.findNoteElementWithFromAttribute = function (attrValue) {
            var noteElements = this._element.getElementsByTagName('note');
            for (var i = 0; i < noteElements.length; i++) {
                var noteElem = noteElements.item(i);
                if (noteElem.getAttribute('from') === attrValue) {
                    return noteElem;
                }
            }
            return null;
        };
        /**
         * Get all note elements where from attribute is not description or meaning
         * @return elements
         */
        XliffTransUnit.prototype.findAllAdditionalNoteElements = function () {
            var noteElements = this._element.getElementsByTagName('note');
            var result = [];
            for (var i = 0; i < noteElements.length; i++) {
                var noteElem = noteElements.item(i);
                var fromAttribute = noteElem.getAttribute('from');
                if (fromAttribute !== 'description' && fromAttribute !== 'meaning') {
                    result.push(noteElem);
                }
            }
            return result;
        };
        /**
         * Create a new note element with attribute from='<attrValue>'
         * @param fromAttrValue value of "from" attribute
         * @param content text value of note element
         * @return the new created element
         */
        XliffTransUnit.prototype.createNoteElementWithFromAttribute = function (fromAttrValue, content) {
            var noteElement = this._element.ownerDocument.createElement('note');
            if (fromAttrValue) {
                noteElement.setAttribute('from', fromAttrValue);
            }
            noteElement.setAttribute('priority', '1');
            if (content) {
                DOMUtilities.replaceContentWithXMLContent(noteElement, content);
            }
            this._element.appendChild(noteElement);
            return noteElement;
        };
        /**
         * Remove note element with attribute from='<attrValue>'
         * @param attrValue attrValue
         */
        XliffTransUnit.prototype.removeNoteElementWithFromAttribute = function (attrValue) {
            var noteElement = this.findNoteElementWithFromAttribute(attrValue);
            if (noteElement) {
                this._element.removeChild(noteElement);
            }
        };
        /**
         * Remove all note elements where attribute "from" is not description or meaning.
         */
        XliffTransUnit.prototype.removeAllAdditionalNoteElements = function () {
            var _this = this;
            var noteElements = this.findAllAdditionalNoteElements();
            noteElements.forEach(function (noteElement) {
                _this._element.removeChild(noteElement);
            });
        };
        /**
         * The meaning (intent) set in the template as value of the i18n-attribute.
         * This is the part in front of the | symbol.
         * e.g. i18n="meaning|mydescription".
         * In xliff this is stored as a note element with attribute from="meaning".
         */
        XliffTransUnit.prototype.meaning = function () {
            var noteElem = this.findNoteElementWithFromAttribute('meaning');
            if (noteElem) {
                return DOMUtilities.getPCDATA(noteElem);
            }
            else {
                return null;
            }
        };
        /**
         * Change meaning property of trans-unit.
         * @param  meaning meaning
         */
        XliffTransUnit.prototype.setMeaning = function (meaning) {
            var noteElem = this.findNoteElementWithFromAttribute('meaning');
            if (meaning) {
                if (util.isNullOrUndefined(noteElem)) {
                    // create it
                    noteElem = this.createNoteElementWithFromAttribute('meaning', meaning);
                }
                else {
                    DOMUtilities.replaceContentWithXMLContent(noteElem, meaning);
                }
            }
            else {
                if (!util.isNullOrUndefined(noteElem)) {
                    // remove node
                    this.removeNoteElementWithFromAttribute('meaning');
                }
            }
        };
        /**
         * Get all notes of the trans-unit.
         * Notes are remarks made by a translator.
         * (description and meaning are not included here!)
         */
        XliffTransUnit.prototype.notes = function () {
            var noteElememts = this.findAllAdditionalNoteElements();
            return noteElememts.map(function (elem) {
                return {
                    from: elem.getAttribute('from'),
                    text: DOMUtilities.getPCDATA(elem)
                };
            });
        };
        /**
         * Test, wether setting of notes is supported.
         * If not, setNotes will do nothing.
         * xtb does not support this, all other formats do.
         */
        XliffTransUnit.prototype.supportsSetNotes = function () {
            return true;
        };
        /**
         * Add notes to trans unit.
         * @param newNotes the notes to add.
         * @throws an Error if any note contains description or meaning as from attribute.
         */
        XliffTransUnit.prototype.setNotes = function (newNotes) {
            var _this = this;
            if (!util.isNullOrUndefined(newNotes)) {
                this.checkNotes(newNotes);
            }
            this.removeAllAdditionalNoteElements();
            if (!util.isNullOrUndefined(newNotes)) {
                newNotes.forEach(function (note) {
                    var noteElem = _this.createNoteElementWithFromAttribute(note.from, note.text);
                });
            }
        };
        /**
         * Set the translation to a given string (including markup).
         * @param translation translation
         */
        XliffTransUnit.prototype.translateNative = function (translation) {
            var target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            if (!target) {
                var source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
                target = DOMUtilities.createFollowingSibling('target', source);
            }
            DOMUtilities.replaceContentWithXMLContent(target, translation);
            this.setTargetState(STATE_TRANSLATED);
        };
        /**
         * Copy source to target to use it as dummy translation.
         * Returns a changed copy of this trans unit.
         * receiver is not changed.
         * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
         */
        XliffTransUnit.prototype.cloneWithSourceAsTarget = function (isDefaultLang, copyContent, targetFile) {
            var element = this._element.cloneNode(true);
            var clone = new XliffTransUnit(element, this._id, targetFile);
            clone.useSourceAsTarget(isDefaultLang, copyContent);
            return clone;
        };
        /**
         * Copy source to target to use it as dummy translation.
         * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
         */
        XliffTransUnit.prototype.useSourceAsTarget = function (isDefaultLang, copyContent) {
            var source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            var target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            if (!target) {
                target = DOMUtilities.createFollowingSibling('target', source);
            }
            if (isDefaultLang || copyContent) {
                var sourceString = DOMUtilities.getXMLContent(source);
                var newTargetString = sourceString;
                if (!this.isICUMessage(sourceString)) {
                    newTargetString = this.translationMessagesFile().getNewTransUnitTargetPraefix()
                        + sourceString
                        + this.translationMessagesFile().getNewTransUnitTargetSuffix();
                }
                DOMUtilities.replaceContentWithXMLContent(target, newTargetString);
            }
            else {
                DOMUtilities.replaceContentWithXMLContent(target, '');
            }
            if (isDefaultLang) {
                target.setAttribute('state', this.mapStateToNativeState(STATE_FINAL));
            }
            else {
                target.setAttribute('state', this.mapStateToNativeState(STATE_NEW));
            }
        };
        return XliffTransUnit;
    }(AbstractTransUnit));

    /**
     * Created by martin on 23.02.2017.
     * Ab xliff file read from a source file.
     * Defines some relevant get and set method for reading and modifying such a file.
     */
    var XliffFile = /** @class */ (function (_super) {
        __extends(XliffFile, _super);
        /**
         * Create an xlf-File from source.
         * @param xmlString source read from file.
         * @param path Path to file
         * @param encoding optional encoding of the xml.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @return XliffFile
         */
        function XliffFile(xmlString, path, encoding) {
            var _this = _super.call(this) || this;
            _this._warnings = [];
            _this._numberOfTransUnitsWithMissingId = 0;
            _this.initializeFromContent(xmlString, path, encoding);
            return _this;
        }
        XliffFile.prototype.initializeFromContent = function (xmlString, path, encoding) {
            this.parseContent(xmlString, path, encoding);
            var xliffList = this._parsedDocument.getElementsByTagName('xliff');
            if (xliffList.length !== 1) {
                throw new Error(util.format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
            }
            else {
                var version = xliffList.item(0).getAttribute('version');
                var expectedVersion = '1.2';
                if (version !== expectedVersion) {
                    throw new Error(util.format('File "%s" seems to be no xliff 1.2 file, version should be %s, found %s', path, expectedVersion, version));
                }
            }
            return this;
        };
        /**
         * File format as it is used in config files.
         * Currently 'xlf', 'xmb', 'xmb2'
         * Returns one of the constants FORMAT_..
         */
        XliffFile.prototype.i18nFormat = function () {
            return FORMAT_XLIFF12;
        };
        /**
         * File type.
         * Here 'XLIFF 1.2'
         */
        XliffFile.prototype.fileType = function () {
            return FILETYPE_XLIFF12;
        };
        /**
         * return tag names of all elements that have mixed content.
         * These elements will not be beautified.
         * Typical candidates are source and target.
         */
        XliffFile.prototype.elementsWithMixedContent = function () {
            return ['source', 'target', 'tool', 'seg-source', 'g', 'ph', 'bpt', 'ept', 'it', 'sub', 'mrk'];
        };
        XliffFile.prototype.initializeTransUnits = function () {
            this.transUnits = [];
            var transUnitsInFile = this._parsedDocument.getElementsByTagName('trans-unit');
            for (var i = 0; i < transUnitsInFile.length; i++) {
                var transunit = transUnitsInFile.item(i);
                var id = transunit.getAttribute('id');
                if (!id) {
                    this._warnings.push(util.format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
                }
                this.transUnits.push(new XliffTransUnit(transunit, id, this));
            }
        };
        /**
         * Get source language.
         * @return source language.
         */
        XliffFile.prototype.sourceLanguage = function () {
            var fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
            if (fileElem) {
                return fileElem.getAttribute('source-language');
            }
            else {
                return null;
            }
        };
        /**
         * Edit the source language.
         * @param language language
         */
        XliffFile.prototype.setSourceLanguage = function (language) {
            var fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
            if (fileElem) {
                fileElem.setAttribute('source-language', language);
            }
        };
        /**
         * Get target language.
         * @return target language.
         */
        XliffFile.prototype.targetLanguage = function () {
            var fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
            if (fileElem) {
                return fileElem.getAttribute('target-language');
            }
            else {
                return null;
            }
        };
        /**
         * Edit the target language.
         * @param language language
         */
        XliffFile.prototype.setTargetLanguage = function (language) {
            var fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
            if (fileElem) {
                fileElem.setAttribute('target-language', language);
            }
        };
        /**
         * Add a new trans-unit to this file.
         * The trans unit stems from another file.
         * It copies the source content of the tu to the target content too,
         * depending on the values of isDefaultLang and copyContent.
         * So the source can be used as a dummy translation.
         * (used by xliffmerge)
         * @param foreignTransUnit the trans unit to be imported.
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         * @param importAfterElement optional (since 1.10) other transunit (part of this file), that should be used as ancestor.
         * Newly imported trans unit is then inserted directly after this element.
         * If not set or not part of this file, new unit will be imported at the end.
         * If explicity set to null, new unit will be imported at the start.
         * @return the newly imported trans unit (since version 1.7.0)
         * @throws an error if trans-unit with same id already is in the file.
         */
        XliffFile.prototype.importNewTransUnit = function (foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
            if (this.transUnitWithId(foreignTransUnit.id)) {
                throw new Error(util.format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
            }
            var newTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
            var bodyElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'body');
            if (!bodyElement) {
                throw new Error(util.format('File "%s" seems to be no xliff 1.2 file (should contain a body element)', this._filename));
            }
            var inserted = false;
            var isAfterElementPartOfFile = false;
            if (!!importAfterElement) {
                var insertionPoint = this.transUnitWithId(importAfterElement.id);
                if (!!insertionPoint) {
                    isAfterElementPartOfFile = true;
                }
            }
            if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
                bodyElement.appendChild(newTu.asXmlElement());
                inserted = true;
            }
            else if (importAfterElement === null) {
                var firstUnitElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'trans-unit');
                if (firstUnitElement) {
                    DOMUtilities.insertBefore(newTu.asXmlElement(), firstUnitElement);
                    inserted = true;
                }
                else {
                    // no trans-unit, empty file, so add to body
                    bodyElement.appendChild(newTu.asXmlElement());
                    inserted = true;
                }
            }
            else {
                var refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'trans-unit', importAfterElement.id);
                if (refUnitElement) {
                    DOMUtilities.insertAfter(newTu.asXmlElement(), refUnitElement);
                    inserted = true;
                }
            }
            if (inserted) {
                this.lazyInitializeTransUnits();
                this.transUnits.push(newTu);
                this.countNumbers();
                return newTu;
            }
            else {
                return null;
            }
        };
        /**
         * Create a new translation file for this file for a given language.
         * Normally, this is just a copy of the original one.
         * But for XMB the translation file has format 'XTB'.
         * @param lang Language code
         * @param filename expected filename to store file
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         */
        XliffFile.prototype.createTranslationFileForLang = function (lang, filename, isDefaultLang, copyContent) {
            var translationFile = new XliffFile(this.editedContent(), filename, this.encoding());
            translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
            translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
            translationFile.setTargetLanguage(lang);
            translationFile.forEachTransUnit(function (transUnit) {
                transUnit.useSourceAsTarget(isDefaultLang, copyContent);
            });
            return translationFile;
        };
        return XliffFile;
    }(AbstractTranslationMessagesFile));

    /**
     * Created by roobm on 10.05.2017.
     * A message parser for XMB
     */
    var XmbMessageParser = /** @class */ (function (_super) {
        __extends(XmbMessageParser, _super);
        function XmbMessageParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Handle this element node.
         * This is called before the children are done.
         * @param elementNode elementNode
         * @param message message to be altered
         * @return true, if children should be processed too, false otherwise (children ignored then)
         */
        XmbMessageParser.prototype.processStartElement = function (elementNode, message) {
            var tagName = elementNode.tagName;
            if (tagName === 'ph') {
                // There are 4 different usages of ph element:
                // 1. placeholders are like <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph>
                // or <ph name="INTERPOLATION_1"><ex>INTERPOLATION_1</ex></ph>
                // 2. start tags:
                // <ph name="START_LINK"><ex>&lt;a&gt;</ex></ph>
                // 3. empty tags:
                // <ph name="TAG_IMG"><ex>&lt;img&gt;</ex></ph>
                // 4. ICU:
                // <ph name="ICU"><ex>ICU</ex></ph>
                var name = elementNode.getAttribute('name');
                if (!name) {
                    return true; // should not happen
                }
                if (name.startsWith('INTERPOLATION')) {
                    var index = this.parsePlaceholderIndexFromName(name);
                    message.addPlaceholder(index, null);
                    return false; // ignore children
                }
                else if (name.startsWith('START_')) {
                    var tag = this.parseTagnameFromPhElement(elementNode);
                    var idcounter = this.parseIdCountFromName(name);
                    if (tag) {
                        message.addStartTag(tag, idcounter);
                    }
                    return false; // ignore children
                }
                else if (name.startsWith('CLOSE_')) {
                    var tag = this.parseTagnameFromPhElement(elementNode);
                    if (tag) {
                        message.addEndTag(tag);
                    }
                    return false; // ignore children
                }
                else if (new TagMapping().isEmptyTagPlaceholderName(name)) {
                    var emptyTagName = new TagMapping().getTagnameFromEmptyTagPlaceholderName(name);
                    var idcounter = this.parseIdCountFromName(name);
                    message.addEmptyTag(emptyTagName, idcounter);
                    return false; // ignore children
                }
                else if (name.startsWith('ICU')) {
                    var index = this.parseICUMessageIndexFromName(name);
                    message.addICUMessageRef(index, null);
                    return false; // ignore children
                }
            }
            else if (tagName === 'source') {
                // ignore source
                return false;
            }
            return true;
        };
        /**
         * Return the ICU message content of the node, if it is an ICU Message.
         * @param node node
         * @return message or null, if it is no ICU Message.
         */
        XmbMessageParser.prototype.getICUMessageText = function (node) {
            var children = node.childNodes;
            if (children.length === 0) {
                return null;
            }
            var firstChild = null;
            // find first child that is no source element.
            var i;
            for (i = 0; i < children.length; i++) {
                var child = children.item(i);
                if (child.nodeType !== child.ELEMENT_NODE || child.tagName !== 'source') {
                    firstChild = child;
                    break;
                }
            }
            if (firstChild && firstChild.nodeType === firstChild.TEXT_NODE) {
                if (this.isICUMessageStart(firstChild.textContent)) {
                    var messageText = DOMUtilities.getXMLContent(node);
                    if (i > 0) {
                        // drop <source> elements
                        var reSource = new RegExp('<source[^>]*>.*</source>', 'g');
                        return messageText.replace(reSource, '');
                    }
                    else {
                        return messageText;
                    }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        /**
         * Handle end of this element node.
         * This is called after all children are processed.
         * @param elementNode elementNode
         * @param message message to be altered
         */
        XmbMessageParser.prototype.processEndElement = function (elementNode, message) {
        };
        /**
         * Parse id attribute of x element as placeholder index.
         * id can be "INTERPOLATION" or "INTERPOLATION_n"
         * @param name name
         * @return id as number
         */
        XmbMessageParser.prototype.parsePlaceholderIndexFromName = function (name) {
            var indexString = '';
            if (name === 'INTERPOLATION') {
                indexString = '0';
            }
            else {
                indexString = name.substring('INTERPOLATION_'.length);
            }
            return Number.parseInt(indexString, 10);
        };
        /**
         * Parse id attribute of x element as ICU message ref index.
         * id can be "ICU" or "ICU_n"
         * @param name name
         * @return id as number
         */
        XmbMessageParser.prototype.parseICUMessageIndexFromName = function (name) {
            var indexString = '';
            if (name === 'ICU') {
                indexString = '0';
            }
            else {
                indexString = name.substring('ICU_'.length);
            }
            return Number.parseInt(indexString, 10);
        };
        /**
         * Parse the tag name from a ph element.
         * It contained in the <ex> subelements value and enclosed in <>.
         * Example: <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>
         * @param phElement phElement
         */
        XmbMessageParser.prototype.parseTagnameFromPhElement = function (phElement) {
            var exElement = DOMUtilities.getFirstElementByTagName(phElement, 'ex');
            if (exElement) {
                var value = DOMUtilities.getPCDATA(exElement);
                if (!value || !value.startsWith('<') || !value.endsWith('>')) {
                    // oops
                    return null;
                }
                if (value.charAt(1) === '/') {
                    return value.substring(2, value.length - 1);
                }
                else {
                    return value.substring(1, value.length - 1);
                }
            }
            else {
                return null;
            }
        };
        XmbMessageParser.prototype.addXmlRepresentationToRoot = function (message, rootElem) {
            var _this = this;
            message.parts().forEach(function (part) {
                var child = _this.createXmlRepresentationOfPart(part, rootElem);
                if (child) {
                    rootElem.appendChild(child);
                }
            });
        };
        XmbMessageParser.prototype.createXmlRepresentationOfPart = function (part, rootElem) {
            switch (part.type) {
                case ParsedMessagePartType.TEXT:
                    return this.createXmlRepresentationOfTextPart(part, rootElem);
                case ParsedMessagePartType.START_TAG:
                    return this.createXmlRepresentationOfStartTagPart(part, rootElem);
                case ParsedMessagePartType.END_TAG:
                    return this.createXmlRepresentationOfEndTagPart(part, rootElem);
                case ParsedMessagePartType.EMPTY_TAG:
                    return this.createXmlRepresentationOfEmptyTagPart(part, rootElem);
                case ParsedMessagePartType.PLACEHOLDER:
                    return this.createXmlRepresentationOfPlaceholderPart(part, rootElem);
                case ParsedMessagePartType.ICU_MESSAGE_REF:
                    return this.createXmlRepresentationOfICUMessageRefPart(part, rootElem);
            }
        };
        /**
         * the xml used for start tag in the message.
         * Returns an <ph>-Element with attribute name and subelement ex
         * @param part part
         * @param rootElem rootElem
         */
        XmbMessageParser.prototype.createXmlRepresentationOfStartTagPart = function (part, rootElem) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var tagMapping = new TagMapping();
            var nameAttrib = tagMapping.getStartTagPlaceholderName(part.tagName(), part.idCounter());
            phElem.setAttribute('name', nameAttrib);
            var exElem = rootElem.ownerDocument.createElement('ex');
            exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
            phElem.appendChild(exElem);
            return phElem;
        };
        /**
         * the xml used for end tag in the message.
         * Returns an <ph>-Element with attribute name and subelement ex
         * @param part part
         * @param rootElem rootElem
         */
        XmbMessageParser.prototype.createXmlRepresentationOfEndTagPart = function (part, rootElem) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var tagMapping = new TagMapping();
            var nameAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
            phElem.setAttribute('name', nameAttrib);
            var exElem = rootElem.ownerDocument.createElement('ex');
            exElem.appendChild(rootElem.ownerDocument.createTextNode('</' + part.tagName() + '>'));
            phElem.appendChild(exElem);
            return phElem;
        };
        /**
         * the xml used for empty tag in the message.
         * Returns an <ph>-Element with attribute name and subelement ex
         * @param part part
         * @param rootElem rootElem
         */
        XmbMessageParser.prototype.createXmlRepresentationOfEmptyTagPart = function (part, rootElem) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var tagMapping = new TagMapping();
            var nameAttrib = tagMapping.getEmptyTagPlaceholderName(part.tagName(), part.idCounter());
            phElem.setAttribute('name', nameAttrib);
            var exElem = rootElem.ownerDocument.createElement('ex');
            exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
            phElem.appendChild(exElem);
            return phElem;
        };
        /**
         * the xml used for placeholder in the message.
         * Returns an <ph>-Element with attribute name and subelement ex
         * @param part part
         * @param rootElem rootElem
         */
        XmbMessageParser.prototype.createXmlRepresentationOfPlaceholderPart = function (part, rootElem) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var nameAttrib = 'INTERPOLATION';
            if (part.index() > 0) {
                nameAttrib = 'INTERPOLATION_' + part.index().toString(10);
            }
            phElem.setAttribute('name', nameAttrib);
            var exElem = rootElem.ownerDocument.createElement('ex');
            exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
            phElem.appendChild(exElem);
            return phElem;
        };
        /**
         * the xml used for icu message refs in the message.
         * @param part part
         * @param rootElem rootElem
         */
        XmbMessageParser.prototype.createXmlRepresentationOfICUMessageRefPart = function (part, rootElem) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var nameAttrib = 'ICU';
            if (part.index() > 0) {
                nameAttrib = 'ICU_' + part.index().toString(10);
            }
            phElem.setAttribute('name', nameAttrib);
            var exElem = rootElem.ownerDocument.createElement('ex');
            exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
            phElem.appendChild(exElem);
            return phElem;
        };
        return XmbMessageParser;
    }(AbstractMessageParser));

    /**
     * Created by martin on 01.05.2017.
     * A Translation Unit in an XMB file.
     */
    var XmbTransUnit = /** @class */ (function (_super) {
        __extends(XmbTransUnit, _super);
        function XmbTransUnit(_element, _id, _translationMessagesFile) {
            return _super.call(this, _element, _id, _translationMessagesFile) || this;
        }
        /**
         * Parses something like 'c:\xxx:7' and returns source and linenumber.
         * @param sourceAndPos something like 'c:\xxx:7', last colon is the separator
         * @return source and linenumber
         */
        XmbTransUnit.parseSourceAndPos = function (sourceAndPos) {
            var index = sourceAndPos.lastIndexOf(':');
            if (index < 0) {
                return {
                    sourcefile: sourceAndPos,
                    linenumber: 0
                };
            }
            else {
                return {
                    sourcefile: sourceAndPos.substring(0, index),
                    linenumber: XmbTransUnit.parseLineNumber(sourceAndPos.substring(index + 1))
                };
            }
        };
        XmbTransUnit.parseLineNumber = function (lineNumberString) {
            return Number.parseInt(lineNumberString, 10);
        };
        /**
         * Get content to translate.
         * Source parts are excluded here.
         * @return source content
         */
        XmbTransUnit.prototype.sourceContent = function () {
            var msgContent = DOMUtilities.getXMLContent(this._element);
            var reSourceElem = /<source>.*<\/source>/g;
            msgContent = msgContent.replace(reSourceElem, '');
            return msgContent;
        };
        /**
         * Test, wether setting of source content is supported.
         * If not, setSourceContent in trans-unit will do nothing.
         * xtb does not support this, all other formats do.
         */
        XmbTransUnit.prototype.supportsSetSourceContent = function () {
            return false;
        };
        /**
         * Set new source content in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing changed source content.
         * @param newContent the new content.
         */
        XmbTransUnit.prototype.setSourceContent = function (newContent) {
            // not supported
        };
        /**
         * Return a parser used for normalized messages.
         */
        XmbTransUnit.prototype.messageParser = function () {
            return new XmbMessageParser();
        };
        /**
         * The original text value, that is to be translated, as normalized message.
         */
        XmbTransUnit.prototype.createSourceContentNormalized = function () {
            return this.messageParser().createNormalizedMessageFromXML(this._element, null);
        };
        /**
         * the translated value (containing all markup, depends on the concrete format used).
         */
        XmbTransUnit.prototype.targetContent = function () {
            // in fact, target and source are just the same in xmb
            return this.sourceContent();
        };
        /**
         * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
         * and all embedded html is replaced by direct html markup.
         */
        XmbTransUnit.prototype.targetContentNormalized = function () {
            return new XmbMessageParser().createNormalizedMessageFromXML(this._element, this.sourceContentNormalized());
        };
        /**
         * State of the translation.
         * (not supported in xmb)
         */
        XmbTransUnit.prototype.nativeTargetState = function () {
            return null; // not supported in xmb
        };
        /**
         * Map an abstract state (new, translated, final) to a concrete state used in the xml.
         * Returns the state to be used in the xml.
         * @param state one of Constants.STATE...
         * @returns a native state (depends on concrete format)
         * @throws error, if state is invalid.
         */
        XmbTransUnit.prototype.mapStateToNativeState = function (state) {
            return state;
        };
        /**
         * Map a native state (found in the document) to an abstract state (new, translated, final).
         * Returns the abstract state.
         * @param nativeState nativeState
         */
        XmbTransUnit.prototype.mapNativeStateToState = function (nativeState) {
            return nativeState;
        };
        /**
         * set state in xml.
         * (not supported in xmb)
         * @param nativeState nativeState
         */
        XmbTransUnit.prototype.setNativeTargetState = function (nativeState) {
            // not supported for xmb
        };
        /**
         * All the source elements in the trans unit.
         * The source element is a reference to the original template.
         * It contains the name of the template file and a line number with the position inside the template.
         * It is just a help for translators to find the context for the translation.
         * This is set when using Angular 4.0 or greater.
         * Otherwise it just returns an empty array.
         */
        XmbTransUnit.prototype.sourceReferences = function () {
            var sourceElements = this._element.getElementsByTagName('source');
            var sourceRefs = [];
            for (var i = 0; i < sourceElements.length; i++) {
                var elem = sourceElements.item(i);
                var sourceAndPos = DOMUtilities.getPCDATA(elem);
                sourceRefs.push(XmbTransUnit.parseSourceAndPos(sourceAndPos));
            }
            return sourceRefs;
        };
        /**
         * Set source ref elements in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing source refs.
         * @param sourceRefs the sourcerefs to set. Old ones are removed.
         */
        XmbTransUnit.prototype.setSourceReferences = function (sourceRefs) {
            this.removeAllSourceReferences();
            var insertPosition = this._element.childNodes.item(0);
            for (var i = sourceRefs.length - 1; i >= 0; i--) {
                var ref = sourceRefs[i];
                var source = this._element.ownerDocument.createElement('source');
                source.appendChild(this._element.ownerDocument.createTextNode(ref.sourcefile + ':' + ref.linenumber.toString(10)));
                this._element.insertBefore(source, insertPosition);
                insertPosition = source;
            }
        };
        XmbTransUnit.prototype.removeAllSourceReferences = function () {
            var sourceElements = this._element.getElementsByTagName('source');
            var toBeRemoved = [];
            for (var i = 0; i < sourceElements.length; i++) {
                var elem = sourceElements.item(i);
                toBeRemoved.push(elem);
            }
            toBeRemoved.forEach(function (elem) { elem.parentNode.removeChild(elem); });
        };
        /**
         * The description set in the template as value of the i18n-attribute.
         * e.g. i18n="mydescription".
         * In xmb this is stored in the attribute "desc".
         */
        XmbTransUnit.prototype.description = function () {
            return this._element.getAttribute('desc');
        };
        /**
         * The meaning (intent) set in the template as value of the i18n-attribute.
         * This is the part in front of the | symbol.
         * e.g. i18n="meaning|mydescription".
         * In xmb this is stored in the attribute "meaning".
         */
        XmbTransUnit.prototype.meaning = function () {
            return this._element.getAttribute('meaning');
        };
        /**
         * Test, wether setting of description and meaning is supported.
         * If not, setDescription and setMeaning will do nothing.
         * xtb does not support this, all other formats do.
         */
        XmbTransUnit.prototype.supportsSetDescriptionAndMeaning = function () {
            return false;
        };
        /**
         * Change description property of trans-unit.
         * @param description description
         */
        XmbTransUnit.prototype.setDescription = function (description) {
            // not supported, do nothing
        };
        /**
         * Change meaning property of trans-unit.
         * @param meaning meaning
         */
        XmbTransUnit.prototype.setMeaning = function (meaning) {
            // not supported, do nothing
        };
        /**
         * Get all notes of the trans-unit.
         * There are NO notes in xmb/xtb
         */
        XmbTransUnit.prototype.notes = function () {
            return [];
        };
        /**
         * Test, wether setting of notes is supported.
         * If not, setNotes will do nothing.
         * xtb does not support this, all other formats do.
         */
        XmbTransUnit.prototype.supportsSetNotes = function () {
            return false;
        };
        /**
         * Add notes to trans unit.
         * @param newNotes the notes to add.
         * NOT Supported in xmb/xtb
         */
        XmbTransUnit.prototype.setNotes = function (newNotes) {
            // not supported, do nothing
        };
        /**
         * Copy source to target to use it as dummy translation.
         * Returns a changed copy of this trans unit.
         * receiver is not changed.
         * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
         * In xmb there is nothing to do, because there is only a target, no source.
         */
        XmbTransUnit.prototype.cloneWithSourceAsTarget = function (isDefaultLang, copyContent, targetFile) {
            return this;
        };
        /**
         * Copy source to target to use it as dummy translation.
         * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
         */
        XmbTransUnit.prototype.useSourceAsTarget = function (isDefaultLang, copyContent) {
            // do nothing
        };
        /**
         * Set the translation to a given string (including markup).
         * In fact, xmb cannot be translated.
         * So this throws an error.
         * @param translation translation
         */
        XmbTransUnit.prototype.translateNative = function (translation) {
            throw new Error('You cannot translate xmb files, use xtb instead.');
        };
        return XmbTransUnit;
    }(AbstractTransUnit));

    /**
     * Created by martin on 10.03.2017.
     * xmb-File access.
     */
    /**
     * Doctype of xtb translation file corresponding with thos xmb file.
     */
    var XTB_DOCTYPE = "<!DOCTYPE translationbundle [\n  <!ELEMENT translationbundle (translation)*>\n  <!ATTLIST translationbundle lang CDATA #REQUIRED>\n  <!ELEMENT translation (#PCDATA|ph)*>\n  <!ATTLIST translation id CDATA #REQUIRED>\n  <!ELEMENT ph EMPTY>\n  <!ATTLIST ph name CDATA #REQUIRED>\n]>";
    var XmbFile = /** @class */ (function (_super) {
        __extends(XmbFile, _super);
        /**
         * Create an xmb-File from source.
         * @param _translationMessageFileFactory factory to create a translation file (xtb) for the xmb file
         * @param xmlString file content
         * @param path Path to file
         * @param encoding optional encoding of the xml.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @return XmbFile
         */
        function XmbFile(_translationMessageFileFactory, xmlString, path, encoding) {
            var _this = _super.call(this) || this;
            _this._translationMessageFileFactory = _translationMessageFileFactory;
            _this._warnings = [];
            _this._numberOfTransUnitsWithMissingId = 0;
            _this.initializeFromContent(xmlString, path, encoding);
            return _this;
        }
        XmbFile.prototype.initializeFromContent = function (xmlString, path, encoding) {
            this.parseContent(xmlString, path, encoding);
            if (this._parsedDocument.getElementsByTagName('messagebundle').length !== 1) {
                throw new Error(util.format('File "%s" seems to be no xmb file (should contain a messagebundle element)', path));
            }
            return this;
        };
        XmbFile.prototype.initializeTransUnits = function () {
            this.transUnits = [];
            var transUnitsInFile = this._parsedDocument.getElementsByTagName('msg');
            for (var i = 0; i < transUnitsInFile.length; i++) {
                var msg = transUnitsInFile.item(i);
                var id = msg.getAttribute('id');
                if (!id) {
                    this._warnings.push(util.format('oops, msg without "id" found in master, please check file %s', this._filename));
                }
                this.transUnits.push(new XmbTransUnit(msg, id, this));
            }
        };
        /**
         * File format as it is used in config files.
         * Currently 'xlf', 'xmb', 'xmb2'
         * Returns one of the constants FORMAT_..
         */
        XmbFile.prototype.i18nFormat = function () {
            return FORMAT_XMB;
        };
        /**
         * File type.
         * Here 'XMB'
         */
        XmbFile.prototype.fileType = function () {
            return FILETYPE_XMB;
        };
        /**
         * return tag names of all elements that have mixed content.
         * These elements will not be beautified.
         * Typical candidates are source and target.
         */
        XmbFile.prototype.elementsWithMixedContent = function () {
            return ['message'];
        };
        /**
         * Guess language from filename.
         * If filename is foo.xy.xmb, than language is assumed to be xy.
         * @return Language or null
         */
        XmbFile.prototype.guessLanguageFromFilename = function () {
            if (this._filename) {
                var parts = this._filename.split('.');
                if (parts.length > 2 && parts[parts.length - 1].toLowerCase() === 'xmb') {
                    return parts[parts.length - 2];
                }
            }
            return null;
        };
        /**
         * Get source language.
         * Unsupported in xmb.
         * Try to guess it from filename if any..
         * @return source language.
         */
        XmbFile.prototype.sourceLanguage = function () {
            return this.guessLanguageFromFilename();
        };
        /**
         * Edit the source language.
         * Unsupported in xmb.
         * @param language language
         */
        XmbFile.prototype.setSourceLanguage = function (language) {
            // do nothing, xmb has no notation for this.
        };
        /**
         * Get target language.
         * Unsupported in xmb.
         * Try to guess it from filename if any..
         * @return target language.
         */
        XmbFile.prototype.targetLanguage = function () {
            return this.guessLanguageFromFilename();
        };
        /**
         * Edit the target language.
         * Unsupported in xmb.
         * @param language language
         */
        XmbFile.prototype.setTargetLanguage = function (language) {
            // do nothing, xmb has no notation for this.
        };
        /**
         * Add a new trans-unit to this file.
         * The trans unit stems from another file.
         * It copies the source content of the tu to the target content too,
         * depending on the values of isDefaultLang and copyContent.
         * So the source can be used as a dummy translation.
         * (used by xliffmerge)
         * @param foreignTransUnit the trans unit to be imported.
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         * @param importAfterElement optional (since 1.10) other transunit (part of this file), that should be used as ancestor.
         * Newly imported trans unit is then inserted directly after this element.
         * If not set or not part of this file, new unit will be imported at the end.
         * If explicity set to null, new unit will be imported at the start.
         * @return the newly imported trans unit (since version 1.7.0)
         * @throws an error if trans-unit with same id already is in the file.
         */
        XmbFile.prototype.importNewTransUnit = function (foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
            throw Error('xmb file cannot be used to store translations, use xtb file');
        };
        /**
         * Create a new translation file for this file for a given language.
         * Normally, this is just a copy of the original one.
         * But for XMB the translation file has format 'XTB'.
         * @param lang Language code
         * @param filename expected filename to store file
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         */
        XmbFile.prototype.createTranslationFileForLang = function (lang, filename, isDefaultLang, copyContent) {
            var translationbundleXMLSource = '<?xml version="1.0" encoding="UTF-8"?>\n' + XTB_DOCTYPE + '\n<translationbundle>\n</translationbundle>\n';
            var translationFile = this._translationMessageFileFactory.createFileFromFileContent(FORMAT_XTB, translationbundleXMLSource, filename, this.encoding(), { xmlContent: this.editedContent(), path: this.filename(), encoding: this.encoding() });
            translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
            translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
            translationFile.setTargetLanguage(lang);
            translationFile.setNewTransUnitTargetPraefix(this.getNewTransUnitTargetPraefix());
            translationFile.setNewTransUnitTargetSuffix(this.getNewTransUnitTargetSuffix());
            this.forEachTransUnit(function (tu) {
                translationFile.importNewTransUnit(tu, isDefaultLang, copyContent);
            });
            return translationFile;
        };
        return XmbFile;
    }(AbstractTranslationMessagesFile));

    /**
     * Created by roobm on 10.05.2017.
     * A message parser for XLIFF 2.0
     */
    var Xliff2MessageParser = /** @class */ (function (_super) {
        __extends(Xliff2MessageParser, _super);
        function Xliff2MessageParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Handle this element node.
         * This is called before the children are done.
         * @param elementNode elementNode
         * @param message message to be altered
         * @return true, if children should be processed too, false otherwise (children ignored then)
         */
        Xliff2MessageParser.prototype.processStartElement = function (elementNode, message) {
            var tagName = elementNode.tagName;
            if (tagName === 'ph') {
                // placeholder are like <ph id="0" equiv="INTERPOLATION" disp="{{number()}}"/>
                // They contain the id and also a name (number in the example)
                // TODO make some use of the name (but it is not available in XLIFF 1.2)
                // ICU message are handled with the same tag
                // Before 4.3.2 they did not have an equiv and disp (Bug #17344):
                // e.g. <ph id="0"/>
                // Beginning with 4.3.2 they do have an equiv ICU and disp:
                // e.g. <ph id="0" equiv="ICU" disp="{count, plural, =0 {...} =1 {...} other {...}}"/>
                // and empty tags have equiv other then INTERPOLATION:
                // e.g. <ph id="3" equiv="TAG_IMG" type="image" disp="&lt;img/>"/>
                // or <ph equiv="LINE_BREAK" type="lb" disp="&lt;br/>"/>
                var isInterpolation = false;
                var isICU = false;
                var isEmptyTag = false;
                var equiv = elementNode.getAttribute('equiv');
                var disp = elementNode.getAttribute('disp');
                var indexString = null;
                var index = 0;
                var emptyTagName = null;
                if (!equiv) {
                    // old ICU syntax, fixed with #17344
                    isICU = true;
                    indexString = elementNode.getAttribute('id');
                    index = Number.parseInt(indexString, 10);
                }
                else if (equiv.startsWith('ICU')) {
                    // new ICU syntax, fixed with #17344
                    isICU = true;
                    if (equiv === 'ICU') {
                        indexString = '0';
                    }
                    else {
                        indexString = equiv.substring('ICU_'.length);
                    }
                    index = Number.parseInt(indexString, 10);
                }
                else if (equiv.startsWith('INTERPOLATION')) {
                    isInterpolation = true;
                    if (equiv === 'INTERPOLATION') {
                        indexString = '0';
                    }
                    else {
                        indexString = equiv.substring('INTERPOLATION_'.length);
                    }
                    index = Number.parseInt(indexString, 10);
                }
                else if (new TagMapping().isEmptyTagPlaceholderName(equiv)) {
                    isEmptyTag = true;
                    emptyTagName = new TagMapping().getTagnameFromEmptyTagPlaceholderName(equiv);
                }
                else {
                    return true;
                }
                if (isInterpolation) {
                    message.addPlaceholder(index, disp);
                }
                else if (isICU) {
                    message.addICUMessageRef(index, disp);
                }
                else if (isEmptyTag) {
                    message.addEmptyTag(emptyTagName, this.parseIdCountFromName(equiv));
                }
            }
            else if (tagName === 'pc') {
                // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt"
                // dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
                var embeddedTagName = this.tagNameFromPCElement(elementNode);
                if (embeddedTagName) {
                    message.addStartTag(embeddedTagName, this.parseIdCountFromName(elementNode.getAttribute('equivStart')));
                }
            }
            return true;
        };
        /**
         * Handle end of this element node.
         * This is called after all children are processed.
         * @param elementNode elementNode
         * @param message message to be altered
         */
        Xliff2MessageParser.prototype.processEndElement = function (elementNode, message) {
            var tagName = elementNode.tagName;
            if (tagName === 'pc') {
                // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt"
                // dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
                var embeddedTagName = this.tagNameFromPCElement(elementNode);
                if (embeddedTagName) {
                    message.addEndTag(embeddedTagName);
                }
                return;
            }
        };
        Xliff2MessageParser.prototype.tagNameFromPCElement = function (pcNode) {
            var dispStart = pcNode.getAttribute('dispStart');
            if (dispStart.startsWith('<')) {
                dispStart = dispStart.substring(1);
            }
            if (dispStart.endsWith('>')) {
                dispStart = dispStart.substring(0, dispStart.length - 1);
            }
            return dispStart;
        };
        /**
         * reimplemented here, because XLIFF 2.0 uses a deeper xml model.
         * So we cannot simply replace the message parts by xml parts.
         * @param message message
         * @param rootElem rootElem
         */
        Xliff2MessageParser.prototype.addXmlRepresentationToRoot = function (message, rootElem) {
            var _this = this;
            var stack = [{ element: rootElem, tagName: 'root' }];
            var id = 0;
            message.parts().forEach(function (part) {
                switch (part.type) {
                    case ParsedMessagePartType.TEXT:
                        stack[stack.length - 1].element.appendChild(_this.createXmlRepresentationOfTextPart(part, rootElem));
                        break;
                    case ParsedMessagePartType.PLACEHOLDER:
                        stack[stack.length - 1].element.appendChild(_this.createXmlRepresentationOfPlaceholderPart(part, rootElem, id++));
                        break;
                    case ParsedMessagePartType.ICU_MESSAGE_REF:
                        stack[stack.length - 1].element.appendChild(_this.createXmlRepresentationOfICUMessageRefPart(part, rootElem));
                        break;
                    case ParsedMessagePartType.START_TAG:
                        var newTagElem = _this.createXmlRepresentationOfStartTagPart(part, rootElem, id++);
                        stack[stack.length - 1].element.appendChild(newTagElem);
                        stack.push({ element: newTagElem, tagName: part.tagName() });
                        break;
                    case ParsedMessagePartType.END_TAG:
                        var closeTagName = part.tagName();
                        if (stack.length <= 1 || stack[stack.length - 1].tagName !== closeTagName) {
                            // oops, not well formed
                            throw new Error('unexpected close tag ' + closeTagName);
                        }
                        stack.pop();
                        break;
                    case ParsedMessagePartType.EMPTY_TAG:
                        var emptyTagElem = _this.createXmlRepresentationOfEmptyTagPart(part, rootElem, id++);
                        stack[stack.length - 1].element.appendChild(emptyTagElem);
                        break;
                }
            });
            if (stack.length !== 1) {
                // oops, not well closed tags
                throw new Error('missing close tag ' + stack[stack.length - 1].tagName);
            }
        };
        /**
         * the xml used for start tag in the message.
         * Returns an empty pc-Element.
         * e.g. <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">
         * Text content will be added later.
         * @param part part
         * @param rootElem rootElem
         * @param id id number in xliff2
         */
        Xliff2MessageParser.prototype.createXmlRepresentationOfStartTagPart = function (part, rootElem, id) {
            var tagMapping = new TagMapping();
            var pcElem = rootElem.ownerDocument.createElement('pc');
            var tagName = part.tagName();
            var equivStart = tagMapping.getStartTagPlaceholderName(tagName, part.idCounter());
            var equivEnd = tagMapping.getCloseTagPlaceholderName(tagName);
            var dispStart = '<' + tagName + '>';
            var dispEnd = '</' + tagName + '>';
            pcElem.setAttribute('id', id.toString(10));
            pcElem.setAttribute('equivStart', equivStart);
            pcElem.setAttribute('equivEnd', equivEnd);
            pcElem.setAttribute('type', this.getTypeForTag(tagName));
            pcElem.setAttribute('dispStart', dispStart);
            pcElem.setAttribute('dispEnd', dispEnd);
            return pcElem;
        };
        /**
         * the xml used for end tag in the message.
         * Not used here, because content is child of start tag.
         * @param part part
         * @param rootElem rootElem
         */
        Xliff2MessageParser.prototype.createXmlRepresentationOfEndTagPart = function (part, rootElem) {
            // not used
            return null;
        };
        /**
         * the xml used for empty tag in the message.
         * Returns an empty ph-Element.
         * e.g. <ph id="3" equiv="TAG_IMG" type="image" disp="&lt;img/>"/>
         * @param part part
         * @param rootElem rootElem
         * @param id id number in xliff2
         */
        Xliff2MessageParser.prototype.createXmlRepresentationOfEmptyTagPart = function (part, rootElem, id) {
            var tagMapping = new TagMapping();
            var phElem = rootElem.ownerDocument.createElement('ph');
            var tagName = part.tagName();
            var equiv = tagMapping.getEmptyTagPlaceholderName(tagName, part.idCounter());
            var disp = '<' + tagName + '/>';
            phElem.setAttribute('id', id.toString(10));
            phElem.setAttribute('equiv', equiv);
            phElem.setAttribute('type', this.getTypeForTag(tagName));
            phElem.setAttribute('disp', disp);
            return phElem;
        };
        Xliff2MessageParser.prototype.getTypeForTag = function (tag) {
            switch (tag.toLowerCase()) {
                case 'br':
                case 'b':
                case 'i':
                case 'u':
                    return 'fmt';
                case 'img':
                    return 'image';
                case 'a':
                    return 'link';
                default:
                    return 'other';
            }
        };
        /**
         * the xml used for placeholder in the message.
         * Returns e.g. <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/>
         * @param part part
         * @param rootElem rootElem
         * @param id id number in xliff2
         */
        Xliff2MessageParser.prototype.createXmlRepresentationOfPlaceholderPart = function (part, rootElem, id) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var equivAttrib = 'INTERPOLATION';
            if (part.index() > 0) {
                equivAttrib = 'INTERPOLATION_' + part.index().toString(10);
            }
            phElem.setAttribute('id', id.toString(10));
            phElem.setAttribute('equiv', equivAttrib);
            var disp = part.disp();
            if (disp) {
                phElem.setAttribute('disp', disp);
            }
            return phElem;
        };
        /**
         * the xml used for icu message refs in the message.
         * @param part part
         * @param rootElem rootElem
         */
        Xliff2MessageParser.prototype.createXmlRepresentationOfICUMessageRefPart = function (part, rootElem) {
            var phElem = rootElem.ownerDocument.createElement('ph');
            var equivAttrib = 'ICU';
            if (part.index() > 0) {
                equivAttrib = 'ICU_' + part.index().toString(10);
            }
            phElem.setAttribute('id', part.index().toString(10));
            phElem.setAttribute('equiv', equivAttrib);
            var disp = part.disp();
            if (disp) {
                phElem.setAttribute('disp', disp);
            }
            return phElem;
        };
        return Xliff2MessageParser;
    }(AbstractMessageParser));

    /**
     * Created by martin on 04.05.2017.
     * A Translation Unit in an XLIFF 2.0 file.
     */
    var Xliff2TransUnit = /** @class */ (function (_super) {
        __extends(Xliff2TransUnit, _super);
        function Xliff2TransUnit(_element, _id, _translationMessagesFile) {
            return _super.call(this, _element, _id, _translationMessagesFile) || this;
        }
        Xliff2TransUnit.prototype.sourceContent = function () {
            var sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            return DOMUtilities.getXMLContent(sourceElement);
        };
        /**
         * Set new source content in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing changed source content.
         * @param newContent the new content.
         */
        Xliff2TransUnit.prototype.setSourceContent = function (newContent) {
            var source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            if (!source) {
                // should not happen, there always has to be a source, but who knows..
                var segment = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
                source = segment.parentNode.appendChild(this._element.ownerDocument.createElement('source'));
            }
            DOMUtilities.replaceContentWithXMLContent(source, newContent);
        };
        /**
         * Return a parser used for normalized messages.
         */
        Xliff2TransUnit.prototype.messageParser = function () {
            return new Xliff2MessageParser();
        };
        /**
         * The original text value, that is to be translated, as normalized message.
         */
        Xliff2TransUnit.prototype.createSourceContentNormalized = function () {
            var sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            if (sourceElement) {
                return this.messageParser().createNormalizedMessageFromXML(sourceElement, null);
            }
            else {
                return null;
            }
        };
        /**
         * the translated value (containing all markup, depends on the concrete format used).
         */
        Xliff2TransUnit.prototype.targetContent = function () {
            var targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            return DOMUtilities.getXMLContent(targetElement);
        };
        /**
         * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
         * and all embedded html is replaced by direct html markup.
         */
        Xliff2TransUnit.prototype.targetContentNormalized = function () {
            var targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            return new Xliff2MessageParser().createNormalizedMessageFromXML(targetElement, this.sourceContentNormalized());
        };
        /**
         * State of the translation as stored in the xml.
         */
        Xliff2TransUnit.prototype.nativeTargetState = function () {
            var segmentElement = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
            if (segmentElement) {
                return segmentElement.getAttribute('state');
            }
            else {
                return null;
            }
        };
        /**
         * set state in xml.
         * @param nativeState nativeState
         */
        Xliff2TransUnit.prototype.setNativeTargetState = function (nativeState) {
            var segmentElement = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
            if (segmentElement) {
                segmentElement.setAttribute('state', nativeState);
            }
        };
        /**
         * Map an abstract state (new, translated, final) to a concrete state used in the xml.
         * Returns the state to be used in the xml.
         * @param state one of Constants.STATE...
         * @returns a native state (depends on concrete format)
         * @throws error, if state is invalid.
         */
        Xliff2TransUnit.prototype.mapStateToNativeState = function (state) {
            switch (state) {
                case STATE_NEW:
                    return 'initial';
                case STATE_TRANSLATED:
                    return 'translated';
                case STATE_FINAL:
                    return 'final';
                default:
                    throw new Error('unknown state ' + state);
            }
        };
        /**
         * Map a native state (found in the document) to an abstract state (new, translated, final).
         * Returns the abstract state.
         * @param nativeState nativeState
         */
        Xliff2TransUnit.prototype.mapNativeStateToState = function (nativeState) {
            switch (nativeState) {
                case 'initial':
                    return STATE_NEW;
                case 'translated':
                    return STATE_TRANSLATED;
                case 'reviewed': // same as translated
                    return STATE_TRANSLATED;
                case 'final':
                    return STATE_FINAL;
                default:
                    return STATE_NEW;
            }
        };
        /**
         * All the source elements in the trans unit.
         * The source element is a reference to the original template.
         * It contains the name of the template file and a line number with the position inside the template.
         * It is just a help for translators to find the context for the translation.
         * This is set when using Angular 4.0 or greater.
         * Otherwise it just returns an empty array.
         */
        Xliff2TransUnit.prototype.sourceReferences = function () {
            // Source is found as <file>:<line> in <note category="location">...
            var noteElements = this._element.getElementsByTagName('note');
            var sourceRefs = [];
            for (var i = 0; i < noteElements.length; i++) {
                var noteElem = noteElements.item(i);
                if (noteElem.getAttribute('category') === 'location') {
                    var sourceAndPos = DOMUtilities.getPCDATA(noteElem);
                    sourceRefs.push(this.parseSourceAndPos(sourceAndPos));
                }
            }
            return sourceRefs;
        };
        /**
         * Parses something like 'c:\xxx:7' and returns source and linenumber.
         * @param sourceAndPos something like 'c:\xxx:7', last colon is the separator
         * @return source and line number
         */
        Xliff2TransUnit.prototype.parseSourceAndPos = function (sourceAndPos) {
            var index = sourceAndPos.lastIndexOf(':');
            if (index < 0) {
                return {
                    sourcefile: sourceAndPos,
                    linenumber: 0
                };
            }
            else {
                return {
                    sourcefile: sourceAndPos.substring(0, index),
                    linenumber: this.parseLineNumber(sourceAndPos.substring(index + 1))
                };
            }
        };
        Xliff2TransUnit.prototype.parseLineNumber = function (lineNumberString) {
            return Number.parseInt(lineNumberString, 10);
        };
        /**
         * Set source ref elements in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing source refs.
         * @param sourceRefs the sourcerefs to set. Old ones are removed.
         */
        Xliff2TransUnit.prototype.setSourceReferences = function (sourceRefs) {
            var _this = this;
            this.removeAllSourceReferences();
            var notesElement = DOMUtilities.getFirstElementByTagName(this._element, 'notes');
            if (sourceRefs.length === 0 && !util.isNullOrUndefined(notesElement) && notesElement.childNodes.length === 0) {
                // remove empty notes element
                notesElement.parentNode.removeChild(notesElement);
                return;
            }
            if (util.isNullOrUndefined(notesElement)) {
                notesElement = this._element.ownerDocument.createElement('notes');
                this._element.insertBefore(notesElement, this._element.childNodes.item(0));
            }
            sourceRefs.forEach(function (ref) {
                var note = _this._element.ownerDocument.createElement('note');
                note.setAttribute('category', 'location');
                note.appendChild(_this._element.ownerDocument.createTextNode(ref.sourcefile + ':' + ref.linenumber.toString(10)));
                notesElement.appendChild(note);
            });
        };
        Xliff2TransUnit.prototype.removeAllSourceReferences = function () {
            var noteElements = this._element.getElementsByTagName('note');
            var toBeRemoved = [];
            for (var i = 0; i < noteElements.length; i++) {
                var elem = noteElements.item(i);
                if (elem.getAttribute('category') === 'location') {
                    toBeRemoved.push(elem);
                }
            }
            toBeRemoved.forEach(function (elem) { elem.parentNode.removeChild(elem); });
        };
        /**
         * The description set in the template as value of the i18n-attribute.
         * e.g. i18n="mydescription".
         * In xliff 2.0 this is stored as a note element with attribute category="description".
         */
        Xliff2TransUnit.prototype.description = function () {
            var noteElem = this.findNoteElementWithCategoryAttribute('description');
            if (noteElem) {
                return DOMUtilities.getPCDATA(noteElem);
            }
            else {
                return null;
            }
        };
        /**
         * Change description property of trans-unit.
         * @param description description
         */
        Xliff2TransUnit.prototype.setDescription = function (description) {
            var noteElem = this.findNoteElementWithCategoryAttribute('description');
            if (description) {
                if (util.isNullOrUndefined(noteElem)) {
                    // create it
                    this.createNoteElementWithCategoryAttribute('description', description);
                }
                else {
                    DOMUtilities.replaceContentWithXMLContent(noteElem, description);
                }
            }
            else {
                if (!util.isNullOrUndefined(noteElem)) {
                    // remove node
                    this.removeNoteElementWithCategoryAttribute('description');
                }
            }
        };
        /**
         * Find a note element with attribute category='<attrValue>'
         * @param attrValue value of category attribute
         * @return element or null is absent
         */
        Xliff2TransUnit.prototype.findNoteElementWithCategoryAttribute = function (attrValue) {
            var noteElements = this._element.getElementsByTagName('note');
            for (var i = 0; i < noteElements.length; i++) {
                var noteElem = noteElements.item(i);
                if (noteElem.getAttribute('category') === attrValue) {
                    return noteElem;
                }
            }
            return null;
        };
        /**
         * Get all note elements where from attribute is not description or meaning
         * @return elements
         */
        Xliff2TransUnit.prototype.findAllAdditionalNoteElements = function () {
            var noteElements = this._element.getElementsByTagName('note');
            var result = [];
            for (var i = 0; i < noteElements.length; i++) {
                var noteElem = noteElements.item(i);
                var fromAttribute = noteElem.getAttribute('category');
                if (fromAttribute !== 'description' && fromAttribute !== 'meaning') {
                    result.push(noteElem);
                }
            }
            return result;
        };
        /**
         * Create a new note element with attribute from='<attrValue>'
         * @param attrValue category attribute value
         * @param content content of note element
         * @return the new created element
         */
        Xliff2TransUnit.prototype.createNoteElementWithCategoryAttribute = function (attrValue, content) {
            var notesElement = DOMUtilities.getFirstElementByTagName(this._element, 'notes');
            if (util.isNullOrUndefined(notesElement)) {
                // create it
                notesElement = this._element.ownerDocument.createElement('notes');
                this._element.appendChild(notesElement);
            }
            var noteElement = this._element.ownerDocument.createElement('note');
            if (attrValue) {
                noteElement.setAttribute('category', attrValue);
            }
            if (content) {
                DOMUtilities.replaceContentWithXMLContent(noteElement, content);
            }
            notesElement.appendChild(noteElement);
            return noteElement;
        };
        Xliff2TransUnit.prototype.removeNotesElementIfEmpty = function () {
            var notesElement = DOMUtilities.getFirstElementByTagName(this._element, 'notes');
            if (notesElement) {
                var childNote = DOMUtilities.getFirstElementByTagName(this._element, 'note');
                if (!childNote) {
                    // remove notes element
                    notesElement.parentNode.removeChild(notesElement);
                }
            }
        };
        /**
         * Remove note element with attribute from='<attrValue>'
         * @param attrValue attrValue
         */
        Xliff2TransUnit.prototype.removeNoteElementWithCategoryAttribute = function (attrValue) {
            var noteElement = this.findNoteElementWithCategoryAttribute(attrValue);
            if (noteElement) {
                noteElement.parentNode.removeChild(noteElement);
            }
            this.removeNotesElementIfEmpty();
        };
        /**
         * Remove all note elements where attribute "from" is not description or meaning.
         */
        Xliff2TransUnit.prototype.removeAllAdditionalNoteElements = function () {
            var noteElements = this.findAllAdditionalNoteElements();
            noteElements.forEach(function (noteElement) {
                noteElement.parentNode.removeChild(noteElement);
            });
            this.removeNotesElementIfEmpty();
        };
        /**
         * The meaning (intent) set in the template as value of the i18n-attribute.
         * This is the part in front of the | symbol.
         * e.g. i18n="meaning|mydescription".
         * In xliff 2.0 this is stored as a note element with attribute category="meaning".
         */
        Xliff2TransUnit.prototype.meaning = function () {
            var noteElem = this.findNoteElementWithCategoryAttribute('meaning');
            if (noteElem) {
                return DOMUtilities.getPCDATA(noteElem);
            }
            else {
                return null;
            }
        };
        /**
         * Change meaning property of trans-unit.
         * @param meaning meaning
         */
        Xliff2TransUnit.prototype.setMeaning = function (meaning) {
            var noteElem = this.findNoteElementWithCategoryAttribute('meaning');
            if (meaning) {
                if (util.isNullOrUndefined(noteElem)) {
                    // create it
                    this.createNoteElementWithCategoryAttribute('meaning', meaning);
                }
                else {
                    DOMUtilities.replaceContentWithXMLContent(noteElem, meaning);
                }
            }
            else {
                if (!util.isNullOrUndefined(noteElem)) {
                    // remove node
                    this.removeNoteElementWithCategoryAttribute('meaning');
                }
            }
        };
        /**
         * Get all notes of the trans-unit.
         * Notes are remarks made by a translator.
         * (description and meaning are not included here!)
         */
        Xliff2TransUnit.prototype.notes = function () {
            var noteElememts = this.findAllAdditionalNoteElements();
            return noteElememts.map(function (elem) {
                return {
                    from: elem.getAttribute('category'),
                    text: DOMUtilities.getPCDATA(elem)
                };
            });
        };
        /**
         * Test, wether setting of notes is supported.
         * If not, setNotes will do nothing.
         * xtb does not support this, all other formats do.
         */
        Xliff2TransUnit.prototype.supportsSetNotes = function () {
            return true;
        };
        /**
         * Add notes to trans unit.
         * @param newNotes the notes to add.
         */
        Xliff2TransUnit.prototype.setNotes = function (newNotes) {
            var _this = this;
            if (!util.isNullOrUndefined(newNotes)) {
                this.checkNotes(newNotes);
            }
            this.removeAllAdditionalNoteElements();
            if (!util.isNullOrUndefined(newNotes)) {
                newNotes.forEach(function (note) {
                    _this.createNoteElementWithCategoryAttribute(note.from, note.text);
                });
            }
        };
        /**
         * Set the translation to a given string (including markup).
         * @param translation translation
         */
        Xliff2TransUnit.prototype.translateNative = function (translation) {
            var target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            if (!target) {
                var source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
                target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
            }
            DOMUtilities.replaceContentWithXMLContent(target, translation);
            this.setTargetState(STATE_TRANSLATED);
        };
        /**
         * Copy source to target to use it as dummy translation.
         * Returns a changed copy of this trans unit.
         * receiver is not changed.
         * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
         */
        Xliff2TransUnit.prototype.cloneWithSourceAsTarget = function (isDefaultLang, copyContent, targetFile) {
            var element = this._element.cloneNode(true);
            var clone = new Xliff2TransUnit(element, this._id, targetFile);
            clone.useSourceAsTarget(isDefaultLang, copyContent);
            return clone;
        };
        /**
         * Copy source to target to use it as dummy translation.
         * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
         */
        Xliff2TransUnit.prototype.useSourceAsTarget = function (isDefaultLang, copyContent) {
            var source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            var target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
            if (!target) {
                target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
            }
            if (isDefaultLang || copyContent) {
                var sourceString = DOMUtilities.getXMLContent(source);
                var newTargetString = sourceString;
                if (!this.isICUMessage(sourceString)) {
                    newTargetString = this.translationMessagesFile().getNewTransUnitTargetPraefix()
                        + sourceString
                        + this.translationMessagesFile().getNewTransUnitTargetSuffix();
                }
                DOMUtilities.replaceContentWithXMLContent(target, newTargetString);
            }
            else {
                DOMUtilities.replaceContentWithXMLContent(target, '');
            }
            var segment = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
            if (segment) {
                if (isDefaultLang) {
                    segment.setAttribute('state', this.mapStateToNativeState(STATE_FINAL));
                }
                else {
                    segment.setAttribute('state', this.mapStateToNativeState(STATE_NEW));
                }
            }
        };
        return Xliff2TransUnit;
    }(AbstractTransUnit));

    /**
     * Created by martin on 04.05.2017.
     * An XLIFF 2.0 file read from a source file.
     * Format definition is: http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
     *
     * Defines some relevant get and set method for reading and modifying such a file.
     */
    var Xliff2File = /** @class */ (function (_super) {
        __extends(Xliff2File, _super);
        /**
         * Create an XLIFF 2.0-File from source.
         * @param xmlString source read from file.
         * @param path Path to file
         * @param encoding optional encoding of the xml.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @return xliff file
         */
        function Xliff2File(xmlString, path, encoding) {
            var _this = _super.call(this) || this;
            _this._warnings = [];
            _this._numberOfTransUnitsWithMissingId = 0;
            _this.initializeFromContent(xmlString, path, encoding);
            return _this;
        }
        Xliff2File.prototype.initializeFromContent = function (xmlString, path, encoding) {
            this.parseContent(xmlString, path, encoding);
            var xliffList = this._parsedDocument.getElementsByTagName('xliff');
            if (xliffList.length !== 1) {
                throw new Error(util.format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
            }
            else {
                var version = xliffList.item(0).getAttribute('version');
                var expectedVersion = '2.0';
                if (version !== expectedVersion) {
                    throw new Error(util.format('File "%s" seems to be no xliff 2 file, version should be %s, found %s', path, expectedVersion, version));
                }
            }
            return this;
        };
        /**
         * File format as it is used in config files.
         * Currently 'xlf', 'xmb', 'xmb2'
         * Returns one of the constants FORMAT_..
         */
        Xliff2File.prototype.i18nFormat = function () {
            return FORMAT_XLIFF20;
        };
        /**
         * File type.
         * Here 'XLIFF 2.0'
         */
        Xliff2File.prototype.fileType = function () {
            return FILETYPE_XLIFF20;
        };
        /**
         * return tag names of all elements that have mixed content.
         * These elements will not be beautified.
         * Typical candidates are source and target.
         */
        Xliff2File.prototype.elementsWithMixedContent = function () {
            return ['skeleton', 'note', 'data', 'source', 'target', 'pc', 'mrk'];
        };
        Xliff2File.prototype.initializeTransUnits = function () {
            this.transUnits = [];
            var transUnitsInFile = this._parsedDocument.getElementsByTagName('unit');
            for (var i = 0; i < transUnitsInFile.length; i++) {
                var transunit = transUnitsInFile.item(i);
                var id = transunit.getAttribute('id');
                if (!id) {
                    this._warnings.push(util.format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
                }
                this.transUnits.push(new Xliff2TransUnit(transunit, id, this));
            }
        };
        /**
         * Get source language.
         * @return source language.
         */
        Xliff2File.prototype.sourceLanguage = function () {
            var xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
            if (xliffElem) {
                return xliffElem.getAttribute('srcLang');
            }
            else {
                return null;
            }
        };
        /**
         * Edit the source language.
         * @param language language
         */
        Xliff2File.prototype.setSourceLanguage = function (language) {
            var xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
            if (xliffElem) {
                xliffElem.setAttribute('srcLang', language);
            }
        };
        /**
         * Get target language.
         * @return target language.
         */
        Xliff2File.prototype.targetLanguage = function () {
            var xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
            if (xliffElem) {
                return xliffElem.getAttribute('trgLang');
            }
            else {
                return null;
            }
        };
        /**
         * Edit the target language.
         * @param language language
         */
        Xliff2File.prototype.setTargetLanguage = function (language) {
            var xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
            if (xliffElem) {
                xliffElem.setAttribute('trgLang', language);
            }
        };
        /**
         * Add a new trans-unit to this file.
         * The trans unit stems from another file.
         * It copies the source content of the tu to the target content too,
         * depending on the values of isDefaultLang and copyContent.
         * So the source can be used as a dummy translation.
         * (used by xliffmerge)
         * @param foreignTransUnit the trans unit to be imported.
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         * @param importAfterElement optional (since 1.10) other transunit (part of this file), that should be used as ancestor.
         * Newly imported trans unit is then inserted directly after this element.
         * If not set or not part of this file, new unit will be imported at the end.
         * If explicity set to null, new unit will be imported at the start.
         * @return the newly imported trans unit (since version 1.7.0)
         * @throws an error if trans-unit with same id already is in the file.
         */
        Xliff2File.prototype.importNewTransUnit = function (foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
            if (this.transUnitWithId(foreignTransUnit.id)) {
                throw new Error(util.format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
            }
            var newTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
            var fileElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
            if (!fileElement) {
                throw new Error(util.format('File "%s" seems to be no xliff 2.0 file (should contain a file element)', this._filename));
            }
            var inserted = false;
            var isAfterElementPartOfFile = false;
            if (!!importAfterElement) {
                var insertionPoint = this.transUnitWithId(importAfterElement.id);
                if (!!insertionPoint) {
                    isAfterElementPartOfFile = true;
                }
            }
            if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
                fileElement.appendChild(newTu.asXmlElement());
                inserted = true;
            }
            else if (importAfterElement === null) {
                var firstUnitElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'unit');
                if (firstUnitElement) {
                    DOMUtilities.insertBefore(newTu.asXmlElement(), firstUnitElement);
                    inserted = true;
                }
                else {
                    // no trans-unit, empty file, so add to first file element
                    fileElement.appendChild(newTu.asXmlElement());
                    inserted = true;
                }
            }
            else {
                var refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'unit', importAfterElement.id);
                if (refUnitElement) {
                    DOMUtilities.insertAfter(newTu.asXmlElement(), refUnitElement);
                    inserted = true;
                }
            }
            if (inserted) {
                this.lazyInitializeTransUnits();
                this.transUnits.push(newTu);
                this.countNumbers();
                return newTu;
            }
            else {
                return null;
            }
        };
        /**
         * Create a new translation file for this file for a given language.
         * Normally, this is just a copy of the original one.
         * But for XMB the translation file has format 'XTB'.
         * @param lang Language code
         * @param filename expected filename to store file
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         */
        Xliff2File.prototype.createTranslationFileForLang = function (lang, filename, isDefaultLang, copyContent) {
            var translationFile = new Xliff2File(this.editedContent(), filename, this.encoding());
            translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
            translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
            translationFile.setTargetLanguage(lang);
            translationFile.forEachTransUnit(function (transUnit) {
                transUnit.useSourceAsTarget(isDefaultLang, copyContent);
            });
            return translationFile;
        };
        return Xliff2File;
    }(AbstractTranslationMessagesFile));

    /**
     * Created by martin on 23.05.2017.
     * A Translation Unit in an XTB file.
     */
    var XtbTransUnit = /** @class */ (function (_super) {
        __extends(XtbTransUnit, _super);
        function XtbTransUnit(_element, _id, _translationMessagesFile, _sourceTransUnitFromMaster) {
            var _this = _super.call(this, _element, _id, _translationMessagesFile) || this;
            _this._sourceTransUnitFromMaster = _sourceTransUnitFromMaster;
            return _this;
        }
        /**
         * Get content to translate.
         * Source parts are excluded here.
         * @return content to translate.
         */
        XtbTransUnit.prototype.sourceContent = function () {
            if (this._sourceTransUnitFromMaster) {
                return this._sourceTransUnitFromMaster.sourceContent();
            }
            else {
                return null;
            }
        };
        /**
         * Test, wether setting of source content is supported.
         * If not, setSourceContent in trans-unit will do nothing.
         * xtb does not support this, all other formats do.
         */
        XtbTransUnit.prototype.supportsSetSourceContent = function () {
            return false;
        };
        /**
         * Set new source content in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing changed source content.
         * @param newContent the new content.
         */
        XtbTransUnit.prototype.setSourceContent = function (newContent) {
            // xtb has no source content, they are part of the master
        };
        /**
         * Return a parser used for normalized messages.
         */
        XtbTransUnit.prototype.messageParser = function () {
            return new XmbMessageParser(); // no typo!, Same as for Xmb
        };
        /**
         * The original text value, that is to be translated, as normalized message.
         */
        XtbTransUnit.prototype.createSourceContentNormalized = function () {
            if (this._sourceTransUnitFromMaster) {
                return this._sourceTransUnitFromMaster.createSourceContentNormalized();
            }
            else {
                return null;
            }
        };
        /**
         * the translated value (containing all markup, depends on the concrete format used).
         */
        XtbTransUnit.prototype.targetContent = function () {
            return DOMUtilities.getXMLContent(this._element);
        };
        /**
         * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
         * and all embedded html is replaced by direct html markup.
         */
        XtbTransUnit.prototype.targetContentNormalized = function () {
            return this.messageParser().createNormalizedMessageFromXML(this._element, this.sourceContentNormalized());
        };
        /**
         * State of the translation.
         * (not supported in xmb)
         * If we have a master, we assumed it is translated if the content is not the same as the masters one.
         */
        XtbTransUnit.prototype.nativeTargetState = function () {
            if (this._sourceTransUnitFromMaster) {
                var sourceContent = this._sourceTransUnitFromMaster.sourceContent();
                if (!sourceContent || sourceContent === this.targetContent() || !this.targetContent()) {
                    return 'new';
                }
                else {
                    return 'final';
                }
            }
            return null; // not supported in xmb
        };
        /**
         * Map an abstract state (new, translated, final) to a concrete state used in the xml.
         * Returns the state to be used in the xml.
         * @param state one of Constants.STATE...
         * @returns a native state (depends on concrete format)
         * @throws error, if state is invalid.
         */
        XtbTransUnit.prototype.mapStateToNativeState = function (state) {
            return state;
        };
        /**
         * Map a native state (found in the document) to an abstract state (new, translated, final).
         * Returns the abstract state.
         * @param nativeState nativeState
         */
        XtbTransUnit.prototype.mapNativeStateToState = function (nativeState) {
            return nativeState;
        };
        /**
         * set state in xml.
         * (not supported in xmb)
         * @param nativeState nativeState
         */
        XtbTransUnit.prototype.setNativeTargetState = function (nativeState) {
            // TODO some logic to store it anywhere
        };
        /**
         * All the source elements in the trans unit.
         * The source element is a reference to the original template.
         * It contains the name of the template file and a line number with the position inside the template.
         * It is just a help for translators to find the context for the translation.
         * This is set when using Angular 4.0 or greater.
         * Otherwise it just returns an empty array.
         */
        XtbTransUnit.prototype.sourceReferences = function () {
            if (this._sourceTransUnitFromMaster) {
                return this._sourceTransUnitFromMaster.sourceReferences();
            }
            else {
                return [];
            }
        };
        /**
         * Test, wether setting of source refs is supported.
         * If not, setSourceReferences will do nothing.
         * xtb does not support this, all other formats do.
         */
        XtbTransUnit.prototype.supportsSetSourceReferences = function () {
            return false;
        };
        /**
         * Set source ref elements in the transunit.
         * Normally, this is done by ng-extract.
         * Method only exists to allow xliffmerge to merge missing source refs.
         * @param sourceRefs the sourcerefs to set. Old ones are removed.
         */
        XtbTransUnit.prototype.setSourceReferences = function (sourceRefs) {
            // xtb has no source refs, they are part of the master
        };
        /**
         * The description set in the template as value of the i18n-attribute.
         * e.g. i18n="mydescription".
         * In xtb only the master stores it.
         */
        XtbTransUnit.prototype.description = function () {
            if (this._sourceTransUnitFromMaster) {
                return this._sourceTransUnitFromMaster.description();
            }
            else {
                return null;
            }
        };
        /**
         * The meaning (intent) set in the template as value of the i18n-attribute.
         * This is the part in front of the | symbol.
         * e.g. i18n="meaning|mydescription".
         * In xtb only the master stores it.
         */
        XtbTransUnit.prototype.meaning = function () {
            if (this._sourceTransUnitFromMaster) {
                return this._sourceTransUnitFromMaster.meaning();
            }
            else {
                return null;
            }
        };
        /**
         * Test, wether setting of description and meaning is supported.
         * If not, setDescription and setMeaning will do nothing.
         * xtb does not support this, all other formats do.
         */
        XtbTransUnit.prototype.supportsSetDescriptionAndMeaning = function () {
            return false;
        };
        /**
         * Change description property of trans-unit.
         * @param description description
         */
        XtbTransUnit.prototype.setDescription = function (description) {
            // not supported, do nothing
        };
        /**
         * Change meaning property of trans-unit.
         * @param meaning meaning
         */
        XtbTransUnit.prototype.setMeaning = function (meaning) {
            // not supported, do nothing
        };
        /**
         * Get all notes of the trans-unit.
         * There are NO notes in xmb/xtb
         */
        XtbTransUnit.prototype.notes = function () {
            return [];
        };
        /**
         * Test, wether setting of notes is supported.
         * If not, setNotes will do nothing.
         * xtb does not support this, all other formats do.
         */
        XtbTransUnit.prototype.supportsSetNotes = function () {
            return false;
        };
        /**
         * Add notes to trans unit.
         * @param newNotes the notes to add.
         * NOT Supported in xmb/xtb
         */
        XtbTransUnit.prototype.setNotes = function (newNotes) {
            // not supported, do nothing
        };
        /**
         * Copy source to target to use it as dummy translation.
         * Returns a changed copy of this trans unit.
         * receiver is not changed.
         * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
         * In xtb there is nothing to do, because there is only a target, no source.
         */
        XtbTransUnit.prototype.cloneWithSourceAsTarget = function (isDefaultLang, copyContent, targetFile) {
            return this;
        };
        /**
         * Copy source to target to use it as dummy translation.
         * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
         */
        XtbTransUnit.prototype.useSourceAsTarget = function (isDefaultLang, copyContent) {
            // do nothing
        };
        /**
         * Set the translation to a given string (including markup).
         * @param translation translation
         */
        XtbTransUnit.prototype.translateNative = function (translation) {
            var target = this._element;
            if (util.isNullOrUndefined(translation)) {
                translation = '';
            }
            DOMUtilities.replaceContentWithXMLContent(target, translation);
        };
        return XtbTransUnit;
    }(AbstractTransUnit));

    /**
     * Created by martin on 23.05.2017.
     * xtb-File access.
     * xtb is the translated counterpart to xmb.
     */
    var XtbFile = /** @class */ (function (_super) {
        __extends(XtbFile, _super);
        /**
         * Create an xmb-File from source.
         * @param _translationMessageFileFactory factory to create a translation file (xtb) for the xmb file
         * @param xmlString file content
         * @param path Path to file
         * @param encoding optional encoding of the xml.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @param optionalMaster in case of xmb the master file, that contains the original texts.
         * (this is used to support state infos, that are based on comparing original with translated version)
         * @return XmbFile
         */
        function XtbFile(_translationMessageFileFactory, xmlString, path, encoding, optionalMaster) {
            var _this = _super.call(this) || this;
            _this._translationMessageFileFactory = _translationMessageFileFactory;
            _this._warnings = [];
            _this._numberOfTransUnitsWithMissingId = 0;
            _this.initializeFromContent(xmlString, path, encoding, optionalMaster);
            return _this;
        }
        XtbFile.prototype.initializeFromContent = function (xmlString, path, encoding, optionalMaster) {
            this.parseContent(xmlString, path, encoding);
            if (this._parsedDocument.getElementsByTagName('translationbundle').length !== 1) {
                throw new Error(util.format('File "%s" seems to be no xtb file (should contain a translationbundle element)', path));
            }
            if (optionalMaster) {
                try {
                    this._masterFile = this._translationMessageFileFactory.createFileFromFileContent(FORMAT_XMB, optionalMaster.xmlContent, optionalMaster.path, optionalMaster.encoding);
                    // check, wether this can be the master ...
                    var numberInMaster = this._masterFile.numberOfTransUnits();
                    var myNumber = this.numberOfTransUnits();
                    if (numberInMaster !== myNumber) {
                        this._warnings.push(util.format('%s trans units found in master, but this file has %s. Check if it is the correct master', numberInMaster, myNumber));
                    }
                }
                catch (error) {
                    throw new Error(util.format('File "%s" seems to be no xmb file. An xtb file needs xmb as master file.', optionalMaster.path));
                }
            }
            return this;
        };
        XtbFile.prototype.initializeTransUnits = function () {
            this.transUnits = [];
            var transUnitsInFile = this._parsedDocument.getElementsByTagName('translation');
            for (var i = 0; i < transUnitsInFile.length; i++) {
                var msg = transUnitsInFile.item(i);
                var id = msg.getAttribute('id');
                if (!id) {
                    this._warnings.push(util.format('oops, msg without "id" found in master, please check file %s', this._filename));
                }
                var masterUnit = null;
                if (this._masterFile) {
                    masterUnit = this._masterFile.transUnitWithId(id);
                }
                this.transUnits.push(new XtbTransUnit(msg, id, this, masterUnit));
            }
        };
        /**
         * File format as it is used in config files.
         * Currently 'xlf', 'xlf2', 'xmb', 'xtb'
         * Returns one of the constants FORMAT_..
         */
        XtbFile.prototype.i18nFormat = function () {
            return FORMAT_XTB;
        };
        /**
         * File type.
         * Here 'XTB'
         */
        XtbFile.prototype.fileType = function () {
            return FILETYPE_XTB;
        };
        /**
         * return tag names of all elements that have mixed content.
         * These elements will not be beautified.
         * Typical candidates are source and target.
         */
        XtbFile.prototype.elementsWithMixedContent = function () {
            return ['translation'];
        };
        /**
         * Get source language.
         * Unsupported in xmb/xtb.
         * Try to guess it from master filename if any..
         * @return source language.
         */
        XtbFile.prototype.sourceLanguage = function () {
            if (this._masterFile) {
                return this._masterFile.sourceLanguage();
            }
            else {
                return null;
            }
        };
        /**
         * Edit the source language.
         * Unsupported in xmb/xtb.
         * @param language language
         */
        XtbFile.prototype.setSourceLanguage = function (language) {
            // do nothing, xtb has no notation for this.
        };
        /**
         * Get target language.
         * @return target language.
         */
        XtbFile.prototype.targetLanguage = function () {
            var translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
            if (translationbundleElem) {
                return translationbundleElem.getAttribute('lang');
            }
            else {
                return null;
            }
        };
        /**
         * Edit the target language.
         * @param language language
         */
        XtbFile.prototype.setTargetLanguage = function (language) {
            var translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
            if (translationbundleElem) {
                translationbundleElem.setAttribute('lang', language);
            }
        };
        /**
         * Add a new trans-unit to this file.
         * The trans unit stems from another file.
         * It copies the source content of the tu to the target content too,
         * depending on the values of isDefaultLang and copyContent.
         * So the source can be used as a dummy translation.
         * (used by xliffmerge)
         * @param foreignTransUnit the trans unit to be imported.
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         * @param importAfterElement optional (since 1.10) other transunit (part of this file), that should be used as ancestor.
         * Newly imported trans unit is then inserted directly after this element.
         * If not set or not part of this file, new unit will be imported at the end.
         * If explicity set to null, new unit will be imported at the start.
         * @return the newly imported trans unit (since version 1.7.0)
         * @throws an error if trans-unit with same id already is in the file.
         */
        XtbFile.prototype.importNewTransUnit = function (foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
            if (this.transUnitWithId(foreignTransUnit.id)) {
                throw new Error(util.format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
            }
            var newMasterTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
            var translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
            if (!translationbundleElem) {
                throw new Error(util.format('File "%s" seems to be no xtb file (should contain a translationbundle element)', this._filename));
            }
            var translationElement = translationbundleElem.ownerDocument.createElement('translation');
            translationElement.setAttribute('id', foreignTransUnit.id);
            var newContent = (copyContent || isDefaultLang) ? foreignTransUnit.sourceContent() : '';
            if (!foreignTransUnit.isICUMessage(newContent)) {
                newContent = this.getNewTransUnitTargetPraefix() + newContent + this.getNewTransUnitTargetSuffix();
            }
            DOMUtilities.replaceContentWithXMLContent(translationElement, newContent);
            var newTu = new XtbTransUnit(translationElement, foreignTransUnit.id, this, newMasterTu);
            var inserted = false;
            var isAfterElementPartOfFile = false;
            if (!!importAfterElement) {
                var insertionPoint = this.transUnitWithId(importAfterElement.id);
                if (!!insertionPoint) {
                    isAfterElementPartOfFile = true;
                }
            }
            if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
                translationbundleElem.appendChild(newTu.asXmlElement());
                inserted = true;
            }
            else if (importAfterElement === null) {
                var firstTranslationElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translation');
                if (firstTranslationElement) {
                    DOMUtilities.insertBefore(newTu.asXmlElement(), firstTranslationElement);
                    inserted = true;
                }
                else {
                    // no trans-unit, empty file, so add to bundle at end
                    translationbundleElem.appendChild(newTu.asXmlElement());
                    inserted = true;
                }
            }
            else {
                var refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'translation', importAfterElement.id);
                if (refUnitElement) {
                    DOMUtilities.insertAfter(newTu.asXmlElement(), refUnitElement);
                    inserted = true;
                }
            }
            if (inserted) {
                this.lazyInitializeTransUnits();
                this.transUnits.push(newTu);
                this.countNumbers();
                return newTu;
            }
            else {
                return null;
            }
        };
        /**
         * Create a new translation file for this file for a given language.
         * Normally, this is just a copy of the original one.
         * But for XMB the translation file has format 'XTB'.
         * @param lang Language code
         * @param filename expected filename to store file
         * @param isDefaultLang Flag, wether file contains the default language.
         * Then source and target are just equal.
         * The content will be copied.
         * State will be final.
         * @param copyContent Flag, wether to copy content or leave it empty.
         * Wben true, content will be copied from source.
         * When false, content will be left empty (if it is not the default language).
         */
        XtbFile.prototype.createTranslationFileForLang = function (lang, filename, isDefaultLang, copyContent) {
            throw new Error(util.format('File "%s", xtb files are not translatable, they are already translations', filename));
        };
        return XtbFile;
    }(AbstractTranslationMessagesFile));

    /**
     * Helper class to read translation files depending on format.
     * This is part of the public api
     */
    var TranslationMessagesFileFactory = /** @class */ (function () {
        function TranslationMessagesFileFactory() {
        }
        /**
         * Read file function, result depends on format, either XliffFile or XmbFile.
         * @param i18nFormat currently 'xlf' or 'xlf2' or 'xmb' or 'xtb' are supported
         * @param xmlContent the file content
         * @param path the path of the file (only used to remember it)
         * @param encoding utf-8, ... used to parse XML.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @param optionalMaster in case of xmb the master file, that contains the original texts.
         * (this is used to support state infos, that are based on comparing original with translated version)
         * Ignored for other formats.
         * @return either XliffFile or XmbFile
         */
        TranslationMessagesFileFactory.fromFileContent = function (i18nFormat, xmlContent, path, encoding, optionalMaster) {
            return new TranslationMessagesFileFactory().createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster);
        };
        /**
         * Read file function for any file with unknown format.
         * This functions tries to guess the format based on the filename and the content of the file.
         * Result depends on detected format, either XliffFile or XmbFile.
         * @param xmlContent the file content
         * @param path the path of the file (only used to remember it)
         * @param encoding utf-8, ... used to parse XML.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @param optionalMaster in case of xmb the master file, that contains the original texts.
         * (this is used to support state infos, that are based on comparing original with translated version)
         * Ignored for other formats.
         * @return either XliffFile or XmbFile
         */
        TranslationMessagesFileFactory.fromUnknownFormatFileContent = function (xmlContent, path, encoding, optionalMaster) {
            return new TranslationMessagesFileFactory().createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster);
        };
        /**
         * Read file function, result depends on format, either XliffFile or XmbFile.
         * @param i18nFormat currently 'xlf' or 'xlf2' or 'xmb' or 'xtb' are supported
         * @param xmlContent the file content
         * @param path the path of the file (only used to remember it)
         * @param encoding utf-8, ... used to parse XML.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @param optionalMaster in case of xmb the master file, that contains the original texts.
         * (this is used to support state infos, that are based on comparing original with translated version)
         * Ignored for other formats.
         * @return either XliffFile or XmbFile
         */
        TranslationMessagesFileFactory.prototype.createFileFromFileContent = function (i18nFormat, xmlContent, path, encoding, optionalMaster) {
            if (i18nFormat === FORMAT_XLIFF12) {
                return new XliffFile(xmlContent, path, encoding);
            }
            if (i18nFormat === FORMAT_XLIFF20) {
                return new Xliff2File(xmlContent, path, encoding);
            }
            if (i18nFormat === FORMAT_XMB) {
                return new XmbFile(this, xmlContent, path, encoding);
            }
            if (i18nFormat === FORMAT_XTB) {
                return new XtbFile(this, xmlContent, path, encoding, optionalMaster);
            }
            throw new Error(util.format('oops, unsupported format "%s"', i18nFormat));
        };
        /**
         * Read file function for any file with unknown format.
         * This functions tries to guess the format based on the filename and the content of the file.
         * Result depends on detected format, either XliffFile or XmbFile.
         * @param xmlContent the file content
         * @param path the path of the file (only used to remember it)
         * @param encoding utf-8, ... used to parse XML.
         * This is read from the file, but if you know it before, you can avoid reading the file twice.
         * @param optionalMaster in case of xmb the master file, that contains the original texts.
         * (this is used to support state infos, that are based on comparing original with translated version)
         * Ignored for other formats.
         * @return either XliffFile or XmbFile
         */
        TranslationMessagesFileFactory.prototype.createFileFromUnknownFormatFileContent = function (xmlContent, path, encoding, optionalMaster) {
            var formatCandidates = [FORMAT_XLIFF12, FORMAT_XLIFF20, FORMAT_XMB, FORMAT_XTB];
            if (path && path.endsWith('xmb')) {
                formatCandidates = [FORMAT_XMB, FORMAT_XTB, FORMAT_XLIFF12, FORMAT_XLIFF20];
            }
            if (path && path.endsWith('xtb')) {
                formatCandidates = [FORMAT_XTB, FORMAT_XMB, FORMAT_XLIFF12, FORMAT_XLIFF20];
            }
            // try all candidate formats to get the right one
            for (var i = 0; i < formatCandidates.length; i++) {
                var formatCandidate = formatCandidates[i];
                try {
                    var translationFile = TranslationMessagesFileFactory.fromFileContent(formatCandidate, xmlContent, path, encoding, optionalMaster);
                    if (translationFile) {
                        return translationFile;
                    }
                }
                catch (e) {
                    // seams to be the wrong format
                }
            }
            throw new Error(util.format('could not identify file format, it is neiter XLIFF (1.2 or 2.0) nor XMB/XTB'));
        };
        return TranslationMessagesFileFactory;
    }());

    /*
     * Public API Surface of ngx-i18nsupport-lib
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.FILETYPE_XLIFF12 = FILETYPE_XLIFF12;
    exports.FILETYPE_XLIFF20 = FILETYPE_XLIFF20;
    exports.FILETYPE_XMB = FILETYPE_XMB;
    exports.FILETYPE_XTB = FILETYPE_XTB;
    exports.FORMAT_XLIFF12 = FORMAT_XLIFF12;
    exports.FORMAT_XLIFF20 = FORMAT_XLIFF20;
    exports.FORMAT_XMB = FORMAT_XMB;
    exports.FORMAT_XTB = FORMAT_XTB;
    exports.NORMALIZATION_FORMAT_DEFAULT = NORMALIZATION_FORMAT_DEFAULT;
    exports.NORMALIZATION_FORMAT_NGXTRANSLATE = NORMALIZATION_FORMAT_NGXTRANSLATE;
    exports.NgxI18nsupportLibModule = NgxI18nsupportLibModule;
    exports.STATE_FINAL = STATE_FINAL;
    exports.STATE_NEW = STATE_NEW;
    exports.STATE_TRANSLATED = STATE_TRANSLATED;
    exports.TranslationMessagesFileFactory = TranslationMessagesFileFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-i18nsupport-ngx-i18nsupport-lib.umd.js.map
