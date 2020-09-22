import { ɵɵdefineNgModule, ɵɵdefineInjector, ɵsetClassMetadata, NgModule } from '@angular/core';
import { isNullOrUndefined, isString, format } from 'util';
import { XMLSerializer, DOMParser } from 'xmldom';
import * as Tokenizr from 'tokenizr';

class NgxI18nsupportLibModule {
}
/** @nocollapse */ NgxI18nsupportLibModule.ɵmod = ɵɵdefineNgModule({ type: NgxI18nsupportLibModule });
/** @nocollapse */ NgxI18nsupportLibModule.ɵinj = ɵɵdefineInjector({ factory: function NgxI18nsupportLibModule_Factory(t) { return new (t || NgxI18nsupportLibModule)(); }, imports: [[]] });
/*@__PURE__*/ (function () { ɵsetClassMetadata(NgxI18nsupportLibModule, [{
        type: NgModule,
        args: [{
                imports: [],
                declarations: [],
                exports: []
            }]
    }], null, null); })();

/**
 * Created by roobm on 08.05.2017.
 * Some constant values used in the API.
 */
/**
 * supported file formats
 */
const FORMAT_XLIFF12 = 'xlf';
const FORMAT_XLIFF20 = 'xlf2';
const FORMAT_XMB = 'xmb';
const FORMAT_XTB = 'xtb';
/**
 * File types
 * (returned by fileType() method)
 */
const FILETYPE_XLIFF12 = 'XLIFF 1.2';
const FILETYPE_XLIFF20 = 'XLIFF 2.0';
const FILETYPE_XMB = 'XMB';
const FILETYPE_XTB = 'XTB';
/**
 * abstract state value.
 * There are only 3 supported state values.
 */
/**
 * State NEW.
 * Signals an untranslated unit.
 */
const STATE_NEW = 'new';
/**
 * State TRANSLATED.
 * Signals a translated unit, that is not reviewed until now.
 */
const STATE_TRANSLATED = 'translated';
/**
 * State FINAL.
 * Signals a translated unit, that is reviewed and ready for use.
 */
const STATE_FINAL = 'final';
/**
 * Normalizaton message formats.
 */
/**
 * Default format, contains placeholders, html markup.
 */
const NORMALIZATION_FORMAT_DEFAULT = 'default';
/**
 * Format for usage in ngxtranslate messages.
 * Placeholder are in the form {{n}}, no html markup.
 */
const NORMALIZATION_FORMAT_NGXTRANSLATE = 'ngxtranslate';

/**
 * Created by martin on 01.05.2017.
 * Some Tool functions for XML Handling.
 */
class DOMUtilities {
    /**
     * return the first subelement with the given tag.
     * @param element element
     * @param tagName tagName
     * @return subelement or null, if not existing.
     */
    static getFirstElementByTagName(element, tagName) {
        const matchingElements = element.getElementsByTagName(tagName);
        if (matchingElements && matchingElements.length > 0) {
            return matchingElements.item(0);
        }
        else {
            return null;
        }
    }
    /**
     * return an element with the given tag and id attribute.
     * @param element element
     * @param tagName tagName
     * @param id id
     * @return subelement or null, if not existing.
     */
    static getElementByTagNameAndId(element, tagName, id) {
        const matchingElements = element.getElementsByTagName(tagName);
        if (matchingElements && matchingElements.length > 0) {
            for (let i = 0; i < matchingElements.length; i++) {
                const node = matchingElements.item(i);
                if (node.getAttribute('id') === id) {
                    return node;
                }
            }
        }
        return null;
    }
    /**
     * Get next sibling, that is an element.
     * @param element element
     */
    static getElementFollowingSibling(element) {
        if (!element) {
            return null;
        }
        let e = element.nextSibling;
        while (e) {
            if (e.nodeType === e.ELEMENT_NODE) {
                return e;
            }
            e = e.nextSibling;
        }
        return null;
    }
    /**
     * Get previous sibling, that is an element.
     * @param element element
     */
    static getElementPrecedingSibling(element) {
        if (!element) {
            return null;
        }
        let e = element.previousSibling;
        while (e) {
            if (e.nodeType === e.ELEMENT_NODE) {
                return e;
            }
            e = e.previousSibling;
        }
        return null;
    }
    /**
     * return content of element as string, including all markup.
     * @param element element
     * @return content of element as string, including all markup.
     */
    static getXMLContent(element) {
        if (!element) {
            return null;
        }
        let result = new XMLSerializer().serializeToString(element);
        const tagName = element.nodeName;
        const reStartMsg = new RegExp('<' + tagName + '[^>]*>', 'g');
        result = result.replace(reStartMsg, '');
        const reEndMsg = new RegExp('</' + tagName + '>', 'g');
        result = result.replace(reEndMsg, '');
        return result;
    }
    /**
     * return PCDATA content of element.
     * @param element element
     * @return PCDATA content of element.
     */
    static getPCDATA(element) {
        if (!element) {
            return null;
        }
        let result = '';
        const childNodes = element.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const child = childNodes.item(i);
            if (child.nodeType === child.TEXT_NODE || child.nodeType === child.CDATA_SECTION_NODE) {
                result = result + child.nodeValue;
            }
        }
        return result.length === 0 ? null : result;
    }
    /**
     * replace PCDATA content with a new one.
     * @param element element
     * @param pcdata pcdata
     */
    static replaceContentWithXMLContent(element, pcdata) {
        // remove all children
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        // parseICUMessage pcdata
        const pcdataFragment = new DOMParser().parseFromString('<fragment>' + pcdata + '</fragment>', 'application/xml');
        const newChildren = pcdataFragment.getElementsByTagName('fragment').item(0).childNodes;
        for (let j = 0; j < newChildren.length; j++) {
            const newChild = newChildren.item(j);
            element.appendChild(element.ownerDocument.importNode(newChild, true));
        }
    }
    /**
     * find the previous sibling that is an element.
     * @param element element
     * @return the previous sibling that is an element or null.
     */
    static getPreviousElementSibling(element) {
        let node = element.previousSibling;
        while (node !== null) {
            if (node.nodeType === node.ELEMENT_NODE) {
                return node;
            }
            node = node.previousSibling;
        }
        return null;
    }
    /**
     * Create an Element Node that is the next sibling of a given node.
     * @param elementNameToCreate elementNameToCreate
     * @param previousSibling previousSibling
     * @return new element
     */
    static createFollowingSibling(elementNameToCreate, previousSibling) {
        const newElement = previousSibling.ownerDocument.createElement(elementNameToCreate);
        return DOMUtilities.insertAfter(newElement, previousSibling);
    }
    /**
     * Insert newElement directly after previousSibling.
     * @param newElement newElement
     * @param previousSibling previousSibling
     */
    static insertAfter(newElement, previousSibling) {
        if (previousSibling.nextSibling !== null) {
            previousSibling.parentNode.insertBefore(newElement, previousSibling.nextSibling);
        }
        else {
            previousSibling.parentNode.appendChild(newElement);
        }
        return newElement;
    }
    /**
     * Insert newElement directly before nextSibling.
     * @param newElement newElement
     * @param nextSibling nextSibling
     */
    static insertBefore(newElement, nextSibling) {
        nextSibling.parentNode.insertBefore(newElement, nextSibling);
        return newElement;
    }
}

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
const DEFAULT_INDENT_STRING = '  ';
class XmlSerializer {
    constructor() {
    }
    /**
     * Serialze xml document to string.
     * @param document the document
     * @param options can be used to activate beautifying.
     */
    serializeToString(document, options) {
        const buf = [];
        let visibleNamespaces = [];
        const refNode = document.documentElement;
        let prefix = refNode.prefix;
        const uri = refNode.namespaceURI;
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
    }
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
    doSerializeToString(node, options, buf, indentLevel, partOfMixedContent, visibleNamespaces) {
        let child;
        switch (node.nodeType) {
            case node.ELEMENT_NODE:
                const elementNode = node;
                const attrs = elementNode.attributes;
                const len = attrs.length;
                child = elementNode.firstChild;
                const nodeName = elementNode.tagName;
                const elementHasMixedContent = this.isMixedContentElement(nodeName, options);
                if (partOfMixedContent) {
                    buf.push('<', nodeName);
                }
                else {
                    this.outputIndented(options, buf, indentLevel, '<', nodeName);
                }
                for (let i = 0; i < len; i++) {
                    // add namespaces for attributes
                    const attr = attrs.item(i);
                    if (attr.prefix === 'xmlns') {
                        visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
                    }
                    else if (attr.nodeName === 'xmlns') {
                        visibleNamespaces.push({ prefix: '', namespace: attr.value });
                    }
                }
                for (let i = 0; i < len; i++) {
                    const attr = attrs.item(i);
                    if (this.needNamespaceDefine(attr, visibleNamespaces)) {
                        const prefix = attr.prefix || '';
                        const uri = attr.namespaceURI;
                        const ns = prefix ? ' xmlns:' + prefix : ' xmlns';
                        buf.push(ns, '="', uri, '"');
                        visibleNamespaces.push({ prefix: prefix, namespace: uri });
                    }
                    this.doSerializeToString(attr, options, buf, indentLevel, false, visibleNamespaces);
                }
                // add namespace for current node
                if (this.needNamespaceDefine(elementNode, visibleNamespaces)) {
                    const prefix = elementNode.prefix || '';
                    const uri = node.namespaceURI;
                    const ns = prefix ? ' xmlns:' + prefix : ' xmlns';
                    buf.push(ns, '="', uri, '"');
                    visibleNamespaces.push({ prefix: prefix, namespace: uri });
                }
                if (child) {
                    buf.push('>');
                    // if is cdata child node
                    let hasComplexContent = false;
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
                const attrNode = node;
                return buf.push(' ', attrNode.name, '="', attrNode.value.replace(/[<&"]/g, this._xmlEncoder), '"');
            case node.TEXT_NODE:
                const textNode = node;
                if (!options.beautify || partOfMixedContent || !this.containsOnlyWhiteSpace(textNode.data)) {
                    return buf.push(textNode.data.replace(/[<&]/g, this._xmlEncoder));
                }
                return;
            case node.CDATA_SECTION_NODE:
                const cdatasectionNode = node;
                return buf.push('<![CDATA[', cdatasectionNode.data, ']]>');
            case node.COMMENT_NODE:
                const commentNode = node;
                return buf.push('<!--', commentNode.data, '-->');
            case node.DOCUMENT_TYPE_NODE:
                const documenttypeNode = node;
                const pubid = documenttypeNode.publicId;
                const sysid = documenttypeNode.systemId;
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
                const piNode = node;
                return buf.push('<?', piNode.target, ' ', piNode.data, '?>');
            case node.ENTITY_REFERENCE_NODE:
                return buf.push('&', node.nodeName, ';');
            // case ENTITY_NODE:
            // case NOTATION_NODE:
            default:
                buf.push('??', node.nodeName);
        }
    }
    needNamespaceDefine(node, visibleNamespaces) {
        const prefix = node.prefix || '';
        const uri = node.namespaceURI;
        if (!prefix && !uri) {
            return false;
        }
        if (prefix === 'xml' && uri === 'http://www.w3.org/XML/1998/namespace'
            || uri === 'http://www.w3.org/2000/xmlns/') {
            return false;
        }
        let i = visibleNamespaces.length;
        while (i--) {
            const ns = visibleNamespaces[i];
            // get namespace prefix
            if (ns.prefix === prefix) {
                return ns.namespace !== uri;
            }
        }
        return true;
    }
    _xmlEncoder(c) {
        return c === '<' && '&lt;' ||
            c === '>' && '&gt;' ||
            c === '&' && '&amp;' ||
            c === '"' && '&quot;' ||
            '&#' + c.charCodeAt(0) + ';';
    }
    outputIndented(options, buf, indentLevel, ...outputParts) {
        if (options.beautify) {
            buf.push('\n');
            if (indentLevel > 0) {
                buf.push(this.indentationString(options, indentLevel));
            }
        }
        buf.push(...outputParts);
    }
    indentationString(options, indentLevel) {
        const indent = (options.indentString) ? options.indentString : DEFAULT_INDENT_STRING;
        let result = '';
        for (let i = 0; i < indentLevel; i++) {
            result = result + indent;
        }
        return result;
    }
    /**
     * Test, wether tagName is an element containing mixed content.
     * @param tagName tagName
     * @param options options
     */
    isMixedContentElement(tagName, options) {
        if (options && options.mixedContentElements) {
            return !!options.mixedContentElements.find((tag) => tag === tagName);
        }
        else {
            return false;
        }
    }
    containsOnlyWhiteSpace(text) {
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            if (!(c === ' ' || c === '\t' || c === '\r' || c === '\n')) {
                return false;
            }
        }
        return true;
    }
}

/**
 * Created by roobm on 09.05.2017.
 * Abstract superclass for all implementations of ITranslationMessagesFile.
 */
class AbstractTranslationMessagesFile {
    constructor() {
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
    parseContent(xmlString, path, encoding, optionalMaster) {
        this._filename = path;
        this._encoding = encoding;
        this._parsedDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
        this._fileEndsWithEOL = xmlString.endsWith('\n');
    }
    lazyInitializeTransUnits() {
        if (isNullOrUndefined(this.transUnits)) {
            this.initializeTransUnits();
            this.countNumbers();
        }
    }
    /**
     * count units after changes of trans units
     */
    countNumbers() {
        this._numberOfTransUnitsWithMissingId = 0;
        this._numberOfUntranslatedTransUnits = 0;
        this._numberOfReviewedTransUnits = 0;
        this.forEachTransUnit((tu) => {
            if (isNullOrUndefined(tu.id) || tu.id === '') {
                this._numberOfTransUnitsWithMissingId++;
            }
            const state = tu.targetState();
            if (isNullOrUndefined(state) || state === STATE_NEW) {
                this._numberOfUntranslatedTransUnits++;
            }
            if (state === STATE_TRANSLATED) {
                this._numberOfReviewedTransUnits++;
            }
        });
    }
    warnings() {
        this.lazyInitializeTransUnits();
        return this._warnings;
    }
    /**
     * Total number of translation units found in the file.
     */
    numberOfTransUnits() {
        this.lazyInitializeTransUnits();
        return this.transUnits.length;
    }
    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfUntranslatedTransUnits() {
        this.lazyInitializeTransUnits();
        return this._numberOfUntranslatedTransUnits;
    }
    /**
     * Number of translation units with state 'final'.
     */
    numberOfReviewedTransUnits() {
        this.lazyInitializeTransUnits();
        return this._numberOfReviewedTransUnits;
    }
    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfTransUnitsWithMissingId() {
        this.lazyInitializeTransUnits();
        return this._numberOfTransUnitsWithMissingId;
    }
    /**
     * Loop over all Translation Units.
     * @param callback callback
     */
    forEachTransUnit(callback) {
        this.lazyInitializeTransUnits();
        this.transUnits.forEach((tu) => callback(tu));
    }
    /**
     * Get trans-unit with given id.
     * @param id id
     * @return trans-unit with given id.
     */
    transUnitWithId(id) {
        this.lazyInitializeTransUnits();
        return this.transUnits.find((tu) => tu.id === id);
    }
    /**
     * Set the praefix used when copying source to target.
     * This is used by importNewTransUnit and createTranslationFileForLang methods.
     * (since 1.8.0)
     * @param targetPraefix targetPraefix
     */
    setNewTransUnitTargetPraefix(targetPraefix) {
        this.targetPraefix = targetPraefix;
    }
    /**
     * Get the praefix used when copying source to target.
     * (since 1.8.0)
     * @return the praefix used when copying source to target.
     */
    getNewTransUnitTargetPraefix() {
        return isNullOrUndefined(this.targetPraefix) ? '' : this.targetPraefix;
    }
    /**
     * Set the suffix used when copying source to target.
     * This is used by importNewTransUnit and createTranslationFileForLang methods.
     * (since 1.8.0)
     * @param targetSuffix targetSuffix
     */
    setNewTransUnitTargetSuffix(targetSuffix) {
        this.targetSuffix = targetSuffix;
    }
    /**
     * Get the suffix used when copying source to target.
     * (since 1.8.0)
     * @return the suffix used when copying source to target.
     */
    getNewTransUnitTargetSuffix() {
        return isNullOrUndefined(this.targetSuffix) ? '' : this.targetSuffix;
    }
    /**
     * Remove the trans-unit with the given id.
     * @param id id
     */
    removeTransUnitWithId(id) {
        const tuNode = this._parsedDocument.getElementById(id);
        if (tuNode) {
            tuNode.parentNode.removeChild(tuNode);
            this.lazyInitializeTransUnits();
            this.transUnits = this.transUnits.filter((tu) => tu.id !== id);
            this.countNumbers();
        }
    }
    /**
     * The filename where the data is read from.
     */
    filename() {
        return this._filename;
    }
    /**
     * The encoding if the xml content (UTF-8, ISO-8859-1, ...)
     */
    encoding() {
        return this._encoding;
    }
    /**
     * The xml content to be saved after changes are made.
     * @param beautifyOutput Flag whether to use pretty-data to format the output.
     * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
     * See issue #64 for details.
     * Default is false.
     */
    editedContent(beautifyOutput) {
        const options = {};
        if (beautifyOutput === true) {
            options.beautify = true;
            options.indentString = '  ';
            options.mixedContentElements = this.elementsWithMixedContent();
        }
        const result = new XmlSerializer().serializeToString(this._parsedDocument, options);
        if (this._fileEndsWithEOL) {
            // add eol if there was eol in original source
            return result + '\n';
        }
        else {
            return result;
        }
    }
}

/**
 * Created by roobm on 10.05.2017.
 * Abstract superclass for all implementations of ITransUnit.
 */
class AbstractTransUnit {
    constructor(_element, _id, _translationMessagesFile) {
        this._element = _element;
        this._id = _id;
        this._translationMessagesFile = _translationMessagesFile;
    }
    get id() {
        return this._id;
    }
    /**
     * The file the unit belongs to.,
     */
    translationMessagesFile() {
        return this._translationMessagesFile;
    }
    /**
     * Test, wether setting of source content is supported.
     * If not, setSourceContent in trans-unit will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceContent() {
        return true;
    }
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    sourceContentNormalized() {
        if (isNullOrUndefined(this._sourceContentNormalized)) {
            this._sourceContentNormalized = this.createSourceContentNormalized();
        }
        return this._sourceContentNormalized;
    }
    /**
     * State of the translation.
     * (on of new, translated, final)
     * Return values are defined as Constants STATE_...
     */
    targetState() {
        const nativeState = this.nativeTargetState();
        return this.mapNativeStateToState(nativeState);
    }
    /**
     * Modify the target state.
     * @param newState one of the 3 allowed target states new, translated, final.
     * Constants STATE_...
     * Invalid states throw an error.
     */
    setTargetState(newState) {
        this.setNativeTargetState(this.mapStateToNativeState(newState));
        if (this.translationMessagesFile() instanceof AbstractTranslationMessagesFile) {
            this.translationMessagesFile().countNumbers();
        }
    }
    /**
     * Test, wether setting of source refs is supported.
     * If not, setSourceReferences will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceReferences() {
        return true;
    }
    /**
     * Test, wether setting of description and meaning is supported.
     * If not, setDescription and setMeaning will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetDescriptionAndMeaning() {
        return true;
    }
    /**
     * Check notes
     * @param newNotes the notes to add.
     * @throws an Error if any note contains description or meaning as from attribute.
     */
    checkNotes(newNotes) {
        // check from values
        const errorInFromNote = newNotes.find((note) => note.from === 'description' || note.from === 'meaning');
        if (!isNullOrUndefined(errorInFromNote)) {
            throw new Error('description or meaning are not allowed as from atttribute');
        }
    }
    /**
     * The real xml element used for the trans unit.
     * (internal usage only, a client should never need this)
     * @return real xml element used for the trans unit.
     */
    asXmlElement() {
        return this._element;
    }
    /**
     * Translate the trans unit.
     * @param translation the translated string or (preferred) a normalized message.
     * The pure string can contain any markup and will not be checked.
     * So it can damage the document.
     * A normalized message prevents this.
     */
    translate(translation) {
        let translationNative;
        if (isString(translation)) {
            translationNative = translation;
        }
        else {
            translationNative = translation.asNativeString();
        }
        this.translateNative(translationNative);
        this.setTargetState(STATE_TRANSLATED);
    }
    /**
     * Test, wether message looks like ICU message.
     * @param message message
     * @return wether message looks like ICU message.
     */
    isICUMessage(message) {
        return this.messageParser().isICUMessageStart(message);
    }
}

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
class ParsedMessagePart {
    constructor(type) {
        this.type = type;
    }
}

/**
 * Created by martin on 05.05.2017.
 * A message part consisting of just simple text.
 */
class ParsedMessagePartText extends ParsedMessagePart {
    constructor(text) {
        super(ParsedMessagePartType.TEXT);
        this.text = text;
    }
    asDisplayString(format) {
        return this.text;
    }
}

/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a placeholder.
 * Placeholders are numbered from 0 to n.
 */
class ParsedMessagePartPlaceholder extends ParsedMessagePart {
    constructor(index, disp) {
        super(ParsedMessagePartType.PLACEHOLDER);
        this._index = index;
        this._disp = disp;
    }
    asDisplayString(format) {
        if (format === NORMALIZATION_FORMAT_NGXTRANSLATE) {
            return '{{' + this._index + '}}';
        }
        return '{{' + this._index + '}}';
    }
    index() {
        return this._index;
    }
    disp() {
        return this._disp;
    }
}

/**
 * Created by martin on 05.05.2017.
 * A message part consisting of an opening tag like <b> or <strange>.
 */
class ParsedMessagePartStartTag extends ParsedMessagePart {
    constructor(tagname, idcounter) {
        super(ParsedMessagePartType.START_TAG);
        this._tagname = tagname;
        this._idcounter = idcounter;
    }
    asDisplayString(format) {
        if (this._idcounter === 0) {
            return '<' + this._tagname + '>';
        }
        else {
            return '<' + this._tagname + ' id="' + this._idcounter.toString() + '">';
        }
    }
    tagName() {
        return this._tagname;
    }
    idCounter() {
        return this._idcounter;
    }
}

/**
 * Created by martin on 05.05.2017.
 * A message part consisting of a closing tag like </b> or </strange>.
 */
class ParsedMessagePartEndTag extends ParsedMessagePart {
    constructor(tagname) {
        super(ParsedMessagePartType.END_TAG);
        this._tagname = tagname;
    }
    asDisplayString(format) {
        return '</' + this._tagname + '>';
    }
    tagName() {
        return this._tagname;
    }
}

/**
 * Created by martin on 04.06.2017.
 * A tokenizer for ICU messages.
 */
// Tokens
const TEXT = 'TEXT';
const CURLY_BRACE_OPEN = 'CURLY_BRACE_OPEN';
const CURLY_BRACE_CLOSE = 'CURLY_BRACE_CLOSE';
const COMMA = 'COMMA';
const PLURAL = 'PLURAL';
const SELECT = 'SELECT';
// states: default normal in_message
const STATE_DEFAULT = 'default';
const STATE_NORMAL = 'normal';
const STATE_IN_MESSAGE = 'in_message';
class ICUMessageTokenizer {
    getLexer() {
        const lexer = new Tokenizr();
        let plaintext = '';
        let openedCurlyBracesInTextCounter = 0;
        lexer.before((ctx, match, rule) => {
            if (rule.name !== TEXT) {
                if (this.containsNonWhiteSpace(plaintext)) {
                    ctx.accept(TEXT, plaintext);
                    plaintext = '';
                }
                else {
                    ctx.ignore();
                }
            }
        });
        lexer.finish((ctx) => {
            if (this.containsNonWhiteSpace(plaintext)) {
                ctx.accept(TEXT, plaintext);
            }
        });
        // curly brace
        lexer.rule(STATE_DEFAULT, /{/, (ctx, match) => {
            ctx.accept(CURLY_BRACE_OPEN, match[0]);
            ctx.push(STATE_NORMAL);
        }, CURLY_BRACE_OPEN);
        lexer.rule(STATE_NORMAL, /{/, (ctx, match) => {
            ctx.accept(CURLY_BRACE_OPEN, match[0]);
            ctx.push(STATE_IN_MESSAGE);
        }, CURLY_BRACE_OPEN);
        lexer.rule(STATE_NORMAL, /}/, (ctx, match) => {
            ctx.pop();
            ctx.accept(CURLY_BRACE_CLOSE, match[0]);
        }, CURLY_BRACE_CLOSE);
        // masked ' { and }
        lexer.rule(STATE_IN_MESSAGE, /'[{}]?'/, (ctx, match) => {
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
        lexer.rule(STATE_IN_MESSAGE, /./, (ctx, match) => {
            const char = match[0];
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
        lexer.rule(STATE_NORMAL, /,/, (ctx, match) => {
            ctx.accept(COMMA, match[0]);
        }, COMMA);
        // keywords plural and select
        lexer.rule(STATE_NORMAL, /plural/, (ctx, match) => {
            ctx.accept(PLURAL, match[0]);
        }, PLURAL);
        lexer.rule(STATE_NORMAL, /select/, (ctx, match) => {
            ctx.accept(SELECT, match[0]);
        }, SELECT);
        // text
        lexer.rule(/./, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT);
        lexer.rule(/[\s]+/, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT);
        return lexer;
    }
    containsNonWhiteSpace(text) {
        for (let i = 0; i < text.length; i++) {
            if (!/\s/.test(text.charAt(i))) {
                return true;
            }
        }
        return false;
    }
    tokenize(normalizedMessage) {
        const lexer = this.getLexer();
        lexer.input(normalizedMessage);
        return lexer.tokens();
    }
    input(normalizedMessage) {
        this.lexer = this.getLexer();
        this.lexer.input(normalizedMessage);
    }
    next() {
        return this.lexer.token();
    }
    peek() {
        return this.lexer.peek();
    }
}

class MessageCategory {
    constructor(_category, _message) {
        this._category = _category;
        this._message = _message;
    }
    getCategory() {
        return this._category;
    }
    getMessageNormalized() {
        return this._message;
    }
}
/**
 * Implementation of an ICU Message.
 * Created by martin on 05.06.2017.
 */
class ICUMessage {
    constructor(_parser, isPluralMessage) {
        this._parser = _parser;
        this._isPluralMessage = isPluralMessage;
        this._categories = [];
    }
    addCategory(category, message) {
        this._categories.push(new MessageCategory(category, message));
    }
    /**
     * ICU message as native string.
     * This is, how it is stored, something like '{x, plural, =0 {..}'
     * @return ICU message as native string.
     */
    asNativeString() {
        const varname = (this.isPluralMessage()) ? 'VAR_PLURAL' : 'VAR_SELECT';
        const type = (this.isPluralMessage()) ? 'plural' : 'select';
        let choiceString = '';
        this._categories.forEach((category) => {
            choiceString = choiceString + format(' %s {%s}', category.getCategory(), category.getMessageNormalized().asNativeString());
        });
        return format('{%s, %s,%s}', varname, type, choiceString);
    }
    /**
     * Is it a plural message?
     */
    isPluralMessage() {
        return this._isPluralMessage;
    }
    /**
     * Is it a select message?
     */
    isSelectMessage() {
        return !this._isPluralMessage;
    }
    /**
     * All the parts of the message.
     * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
     * has 4 category objects with the categories =0, =1, =2, other.
     */
    getCategories() {
        return this._categories;
    }
    /**
     * Translate message and return a new, translated message
     * @param translation the translation (hashmap of categories and translations).
     * @return new message wit translated content.
     * @throws an error if translation does not match the message.
     * This is the case, if there are categories not contained in the original message.
     */
    translate(translation) {
        const message = new ICUMessage(this._parser, this.isPluralMessage());
        const translatedCategories = new Set();
        this._categories.forEach((category) => {
            let translatedMessage;
            const translationForCategory = translation[category.getCategory()];
            if (isNullOrUndefined(translationForCategory)) {
                translatedMessage = category.getMessageNormalized();
            }
            else if (isString(translationForCategory)) {
                translatedCategories.add(category.getCategory());
                translatedMessage = this._parser.parseNormalizedString(translationForCategory, null);
            }
            else {
                // TODO embedded ICU Message
                translatedMessage = null;
            }
            message.addCategory(category.getCategory(), translatedMessage);
        });
        // new categories, which are not part of the original message
        Object.keys(translation).forEach((categoryName) => {
            if (!translatedCategories.has(categoryName)) {
                if (this.isSelectMessage()) {
                    throw new Error(format('adding a new category not allowed for select messages ("%s" is not part of message)', categoryName));
                }
                else {
                    this.checkValidPluralCategory(categoryName);
                    // TODO embedded ICU Message
                    let translatedMessage = this._parser.parseNormalizedString(translation[categoryName], null);
                    message.addCategory(categoryName, translatedMessage);
                }
            }
        });
        return message;
    }
    /**
     * Check, wether category is valid plural category.
     * Allowed are =n, 'zero', 'one', 'two', 'few', 'many' and 'other'
     * @param categoryName category
     * @throws an error, if it is not a valid category name
     */
    checkValidPluralCategory(categoryName) {
        const allowedKeywords = ['zero', 'one', 'two', 'few', 'many', 'other'];
        if (categoryName.match(/=\d+/)) {
            return;
        }
        if (allowedKeywords.find((key) => key === categoryName)) {
            return;
        }
        throw new Error(format('invalid plural category "%s", allowed are =<n> and %s', categoryName, allowedKeywords));
    }
}

/**
 * Created by martin on 02.06.2017.
 * A message part consisting of an icu message.
 * There can only be one icu message in a parsed message.
 * Syntax of ICU message is '{' <keyname> ',' 'select'|'plural' ',' (<category> '{' text '}')+ '}'
 */
class ParsedMessagePartICUMessage extends ParsedMessagePart {
    constructor(icuMessageText, _parser) {
        super(ParsedMessagePartType.ICU_MESSAGE);
        this._parser = _parser;
        if (icuMessageText) {
            this.parseICUMessage(icuMessageText);
        }
    }
    /**
     * Test wether text might be an ICU message.
     * Should at least start with something like '{<name>, select, ..' or '{<name>, plural, ...'
     * @param icuMessageText icuMessageText
     * @return wether text might be an ICU message.
     */
    static looksLikeICUMessage(icuMessageText) {
        const part = new ParsedMessagePartICUMessage(null, null);
        return part.looksLikeICUMessage(icuMessageText);
    }
    asDisplayString(displayFormat) {
        return '<ICU-Message/>';
    }
    /**
     * return the parsed message.
     * @return parsed message
     */
    getICUMessage() {
        return this._message;
    }
    /**
     * Parse the message.
     * @param text message text to parse
     * @throws an error if the syntax is not ok in any way.
     */
    parseICUMessage(text) {
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
        let token = this._tokenizer.next();
        if (token.type === PLURAL) {
            this._message = new ICUMessage(this._parser, true);
        }
        else if (token.type === SELECT) {
            this._message = new ICUMessage(this._parser, false);
        }
        this.expectNext(COMMA);
        token = this._tokenizer.peek();
        while (token.type !== CURLY_BRACE_CLOSE) {
            const category = this.expectNext(TEXT).value.trim();
            this.expectNext(CURLY_BRACE_OPEN);
            const message = this.expectNext(TEXT).value;
            this._message.addCategory(category, this.parseNativeSubMessage(message));
            this.expectNext(CURLY_BRACE_CLOSE);
            token = this._tokenizer.peek();
        }
        this.expectNext(CURLY_BRACE_CLOSE);
        this.expectNext('EOF');
    }
    /**
     * Parse the message to check, wether it might be an ICU message.
     * Should at least start with something like '{<name>, select, ..' or '{<name>, plural, ...'
     * @param text message text to parse
     */
    looksLikeICUMessage(text) {
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
            const token = this._tokenizer.next();
            if (token.type !== PLURAL && token.type !== SELECT) {
                return false;
            }
            this.expectNext(COMMA);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Read next token and expect, that it is of the given type.
     * @param tokentype expected type.
     * @return Token
     * @throws error, if next token has wrong type.
     */
    expectNext(tokentype) {
        const token = this._tokenizer.next();
        if (token.type !== tokentype) {
            throw new Error(format('Error parsing ICU Message: expected %s, found %s (%s) (message %s)', tokentype, token.type, token.value, this._messageText));
        }
        return token;
    }
    /**
     * Parse XML text to normalized message.
     * @param message message in format dependent xml syntax.
     * @return normalized message
     */
    parseNativeSubMessage(message) {
        return this._parser.createNormalizedMessageFromXMLString(message, null);
    }
}

/**
 * Created by martin on 05.05.2017.
 * A reference to an ICU message
 * icu references are numbered from 0 to n.
 */
class ParsedMessagePartICUMessageRef extends ParsedMessagePart {
    constructor(index, disp) {
        super(ParsedMessagePartType.ICU_MESSAGE_REF);
        this._index = index;
        this._disp = disp;
    }
    asDisplayString(format) {
        return '<ICU-Message-Ref_' + this._index + '/>';
    }
    index() {
        return this._index;
    }
    disp() {
        return this._disp;
    }
}

/**
 * Created by martin on 14.06.2017.
 * A message part consisting of an empty tag like <br/>.
 */
class ParsedMessagePartEmptyTag extends ParsedMessagePart {
    constructor(tagname, idcounter) {
        super(ParsedMessagePartType.EMPTY_TAG);
        this._tagname = tagname;
        this._idcounter = idcounter;
    }
    asDisplayString(format) {
        if (this._idcounter === 0) {
            return '<' + this._tagname + '>';
        }
        else {
            return '<' + this._tagname + ' id="' + this._idcounter.toString() + '">';
        }
    }
    tagName() {
        return this._tagname;
    }
    idCounter() {
        return this._idcounter;
    }
}

/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
class ParsedMessage {
    constructor(parser, sourceMessage) {
        this._parser = parser;
        this.sourceMessage = sourceMessage;
        this._parts = [];
    }
    /**
     * Get the parser (for tests only, not part of API)
     * @return parser
     */
    getParser() {
        return this._parser;
    }
    /**
     * Create a new normalized message as a translation of this one.
     * @param normalizedString the translation in normalized form.
     * If the message is an ICUMessage (getICUMessage returns a value), use translateICUMessage instead.
     * @throws an error if normalized string is not well formed.
     * Throws an error too, if this is an ICU message.
     */
    translate(normalizedString) {
        if (isNullOrUndefined(this.getICUMessage())) {
            return this._parser.parseNormalizedString(normalizedString, this);
        }
        else {
            throw new Error(format('cannot translate ICU message with simple string, use translateICUMessage() instead ("%s", "%s")', normalizedString, this.asNativeString()));
        }
    }
    /**
     * Create a new normalized icu message as a translation of this one.
     * @param icuTranslation the translation, this is the translation of the ICU message,
     * which is not a string, but a collections of the translations of the different categories.
     * The message must be an ICUMessage (getICUMessage returns a value)
     * @throws an error if normalized string is not well formed.
     * Throws an error too, if this is not an ICU message.
     */
    translateICUMessage(icuTranslation) {
        const icuMessage = this.getICUMessage();
        if (isNullOrUndefined(icuMessage)) {
            throw new Error(format('this is not an ICU message, use translate() instead ("%s", "%s")', icuTranslation, this.asNativeString()));
        }
        else {
            const translatedICUMessage = icuMessage.translate(icuTranslation);
            return this._parser.parseICUMessage(translatedICUMessage.asNativeString(), this);
        }
    }
    /**
     * Create a new normalized message from a native xml string as a translation of this one.
     * @param nativeString xml string in the format of the underlying file format.
     * Throws an error if native string is not acceptable.
     */
    translateNativeString(nativeString) {
        return this._parser.createNormalizedMessageFromXMLString(nativeString, this);
    }
    /**
     * normalized message as string.
     * @param displayFormat optional way to determine the exact syntax.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     */
    asDisplayString(displayFormat) {
        return this._parts.map((part) => part.asDisplayString(displayFormat)).join('');
    }
    /**
     * Returns the message content as format dependent native string.
     * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
     */
    asNativeString() {
        if (isNullOrUndefined(this.getICUMessage())) {
            return DOMUtilities.getXMLContent(this._xmlRepresentation);
        }
        else {
            return this.getICUMessage().asNativeString();
        }
    }
    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    validate() {
        let hasErrors = false;
        const errors = {};
        let e;
        e = this.checkPlaceholderAdded();
        if (!isNullOrUndefined(e)) {
            errors.placeholderAdded = e;
            hasErrors = true;
        }
        e = this.checkICUMessageRefRemoved();
        if (!isNullOrUndefined(e)) {
            errors.icuMessageRefRemoved = e;
            hasErrors = true;
        }
        e = this.checkICUMessageRefAdded();
        if (!isNullOrUndefined(e)) {
            errors.icuMessageRefAdded = e;
            hasErrors = true;
        }
        return hasErrors ? errors : null;
    }
    /**
     * Validate the message, check for warnings only.
     * A warning shows, that the message is acceptable, but misses something.
     * E.g. if you remove a placeholder or a special tag from the original message, this generates a warning.
     * @return null, if no warning, warnings as error object otherwise.
     */
    validateWarnings() {
        let hasWarnings = false;
        const warnings = {};
        let w;
        w = this.checkPlaceholderRemoved();
        if (!isNullOrUndefined(w)) {
            warnings.placeholderRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagRemoved();
        if (!isNullOrUndefined(w)) {
            warnings.tagRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagAdded();
        if (!isNullOrUndefined(w)) {
            warnings.tagAdded = w;
            hasWarnings = true;
        }
        return hasWarnings ? warnings : null;
    }
    /**
     * Test wether this message is an ICU message.
     * @return true, if it is an ICU message.
     */
    isICUMessage() {
        return this._parts.length === 1 && this._parts[0].type === ParsedMessagePartType.ICU_MESSAGE;
    }
    /**
     * Test wether this message contains an ICU message reference.
     * ICU message references are something like <x ID="ICU"../>.
     * @return true, if there is an ICU message reference in the message.
     */
    containsICUMessageRef() {
        return this._parts.findIndex(part => part.type === ParsedMessagePartType.ICU_MESSAGE_REF) >= 0;
    }
    /**
     * If this message is an ICU message, returns its structure.
     * Otherwise this method returns null.
     * @return ICUMessage or null.
     */
    getICUMessage() {
        if (this._parts.length === 1 && this._parts[0].type === ParsedMessagePartType.ICU_MESSAGE) {
            const icuPart = this._parts[0];
            return icuPart.getICUMessage();
        }
        else {
            return null;
        }
    }
    /**
     * Check for added placeholder.
     * @return null or message, if fulfilled.
     */
    checkPlaceholderAdded() {
        let e = null;
        const suspiciousIndexes = [];
        if (this.sourceMessage) {
            const sourcePlaceholders = this.sourceMessage.allPlaceholders();
            const myPlaceholders = this.allPlaceholders();
            myPlaceholders.forEach((index) => {
                if (!sourcePlaceholders.has(index)) {
                    suspiciousIndexes.push(index);
                }
            });
        }
        if (suspiciousIndexes.length === 1) {
            e = 'added placeholder ' + suspiciousIndexes[0] + ', which is not in original message';
        }
        else if (suspiciousIndexes.length > 1) {
            let allSuspiciousIndexes = '';
            let first = true;
            suspiciousIndexes.forEach((index) => {
                if (!first) {
                    allSuspiciousIndexes = allSuspiciousIndexes + ', ';
                }
                allSuspiciousIndexes = allSuspiciousIndexes + index;
                first = false;
            });
            e = 'added placeholders ' + allSuspiciousIndexes + ', which are not in original message';
        }
        return e;
    }
    /**
     * Check for removed placeholder.
     * @return null or message, if fulfilled.
     */
    checkPlaceholderRemoved() {
        let w = null;
        const suspiciousIndexes = [];
        if (this.sourceMessage) {
            const sourcePlaceholders = this.sourceMessage.allPlaceholders();
            const myPlaceholders = this.allPlaceholders();
            sourcePlaceholders.forEach((index) => {
                if (!myPlaceholders.has(index)) {
                    suspiciousIndexes.push(index);
                }
            });
        }
        if (suspiciousIndexes.length === 1) {
            w = 'removed placeholder ' + suspiciousIndexes[0] + ' from original message';
        }
        else if (suspiciousIndexes.length > 1) {
            let allSuspiciousIndexes = '';
            let first = true;
            suspiciousIndexes.forEach((index) => {
                if (!first) {
                    allSuspiciousIndexes = allSuspiciousIndexes + ', ';
                }
                allSuspiciousIndexes = allSuspiciousIndexes + index;
                first = false;
            });
            w = 'removed placeholders ' + allSuspiciousIndexes + ' from original message';
        }
        return w;
    }
    /**
     * Check for added ICU Message Refs.
     * @return null or message, if fulfilled.
     */
    checkICUMessageRefAdded() {
        let e = null;
        const suspiciousIndexes = [];
        if (this.sourceMessage) {
            const sourceICURefs = this.sourceMessage.allICUMessageRefs();
            const myICURefs = this.allICUMessageRefs();
            myICURefs.forEach((index) => {
                if (!sourceICURefs.has(index)) {
                    suspiciousIndexes.push(index);
                }
            });
        }
        if (suspiciousIndexes.length === 1) {
            e = 'added ICU message reference ' + suspiciousIndexes[0] + ', which is not in original message';
        }
        else if (suspiciousIndexes.length > 1) {
            let allSuspiciousIndexes = '';
            let first = true;
            suspiciousIndexes.forEach((index) => {
                if (!first) {
                    allSuspiciousIndexes = allSuspiciousIndexes + ', ';
                }
                allSuspiciousIndexes = allSuspiciousIndexes + index;
                first = false;
            });
            e = 'added ICU message references ' + allSuspiciousIndexes + ', which are not in original message';
        }
        return e;
    }
    /**
     * Check for removed ICU Message Refs.
     * @return null or message, if fulfilled.
     */
    checkICUMessageRefRemoved() {
        let e = null;
        const suspiciousIndexes = [];
        if (this.sourceMessage) {
            const sourceICURefs = this.sourceMessage.allICUMessageRefs();
            const myICURefs = this.allICUMessageRefs();
            sourceICURefs.forEach((index) => {
                if (!myICURefs.has(index)) {
                    suspiciousIndexes.push(index);
                }
            });
        }
        if (suspiciousIndexes.length === 1) {
            e = 'removed ICU message reference ' + suspiciousIndexes[0] + ' from original message';
        }
        else if (suspiciousIndexes.length > 1) {
            let allSuspiciousIndexes = '';
            let first = true;
            suspiciousIndexes.forEach((index) => {
                if (!first) {
                    allSuspiciousIndexes = allSuspiciousIndexes + ', ';
                }
                allSuspiciousIndexes = allSuspiciousIndexes + index;
                first = false;
            });
            e = 'removed ICU message references ' + allSuspiciousIndexes + ' from original message';
        }
        return e;
    }
    /**
     * Get all indexes of placeholders used in the message.
     */
    allPlaceholders() {
        const result = new Set();
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.PLACEHOLDER) {
                const index = part.index();
                result.add(index);
            }
        });
        return result;
    }
    /**
     * Return the disp-Attribute of placeholder
     * @param index index of placeholder
     * @return disp or null
     */
    getPlaceholderDisp(index) {
        let placeHolder = null;
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.PLACEHOLDER) {
                const phPart = part;
                if (phPart.index() === index) {
                    placeHolder = phPart;
                }
            }
        });
        return placeHolder ? placeHolder.disp() : null;
    }
    /**
     * Get all indexes of ICU message refs used in the message.
     */
    allICUMessageRefs() {
        const result = new Set();
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.ICU_MESSAGE_REF) {
                const index = part.index();
                result.add(index);
            }
        });
        return result;
    }
    /**
     * Return the disp-Attribute of icu message ref
     * @param index of ref
     * @return disp or null
     */
    getICUMessageRefDisp(index) {
        let icuMessageRefPart = null;
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.ICU_MESSAGE_REF) {
                const refPart = part;
                if (refPart.index() === index) {
                    icuMessageRefPart = refPart;
                }
            }
        });
        return icuMessageRefPart ? icuMessageRefPart.disp() : null;
    }
    /**
     * Check for added tags.
     * @return null or message, if fulfilled.
     */
    checkTagAdded() {
        let e = null;
        const suspiciousTags = [];
        if (this.sourceMessage) {
            const sourceTags = this.sourceMessage.allTags();
            const myTags = this.allTags();
            myTags.forEach((tagName) => {
                if (!sourceTags.has(tagName)) {
                    suspiciousTags.push(tagName);
                }
            });
        }
        if (suspiciousTags.length === 1) {
            e = 'added tag <' + suspiciousTags[0] + '>, which is not in original message';
        }
        else if (suspiciousTags.length > 1) {
            let allSuspiciousTags = '';
            let first = true;
            suspiciousTags.forEach((tag) => {
                if (!first) {
                    allSuspiciousTags = allSuspiciousTags + ', ';
                }
                allSuspiciousTags = allSuspiciousTags + '<' + tag + '>';
                first = false;
            });
            e = 'added tags ' + allSuspiciousTags + ', which are not in original message';
        }
        return e;
    }
    /**
     * Check for removed tags.
     * @return null or message, if fulfilled.
     */
    checkTagRemoved() {
        let w = null;
        const suspiciousTags = [];
        if (this.sourceMessage) {
            const sourceTags = this.sourceMessage.allTags();
            const myTags = this.allTags();
            sourceTags.forEach((tagName) => {
                if (!myTags.has(tagName)) {
                    suspiciousTags.push(tagName);
                }
            });
        }
        if (suspiciousTags.length === 1) {
            w = 'removed tag <' + suspiciousTags[0] + '> from original message';
        }
        else if (suspiciousTags.length > 1) {
            let allSuspiciousTags = '';
            let first = true;
            suspiciousTags.forEach((tag) => {
                if (!first) {
                    allSuspiciousTags = allSuspiciousTags + ', ';
                }
                allSuspiciousTags = allSuspiciousTags + '<' + tag + '>';
                first = false;
            });
            w = 'removed tags ' + allSuspiciousTags + ' from original message';
        }
        return w;
    }
    /**
     * Get all tag names used in the message.
     */
    allTags() {
        const result = new Set();
        this.parts().forEach((part) => {
            if (part.type === ParsedMessagePartType.START_TAG || part.type === ParsedMessagePartType.EMPTY_TAG) {
                const tagName = part.tagName();
                result.add(tagName);
            }
        });
        return result;
    }
    parts() {
        return this._parts;
    }
    setXmlRepresentation(xmlRepresentation) {
        this._xmlRepresentation = xmlRepresentation;
    }
    addText(text) {
        this._parts.push(new ParsedMessagePartText(text));
    }
    addPlaceholder(index, disp) {
        this._parts.push(new ParsedMessagePartPlaceholder(index, disp));
    }
    addStartTag(tagname, idcounter) {
        this._parts.push(new ParsedMessagePartStartTag(tagname, idcounter));
    }
    addEndTag(tagname) {
        // check if well formed
        const openTag = this.calculateOpenTagName();
        if (!openTag || openTag !== tagname) {
            // oops, not well formed
            throw new Error(format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagname, openTag, this.asNativeString()));
        }
        this._parts.push(new ParsedMessagePartEndTag(tagname));
    }
    addEmptyTag(tagname, idcounter) {
        this._parts.push(new ParsedMessagePartEmptyTag(tagname, idcounter));
    }
    addICUMessageRef(index, disp) {
        this._parts.push(new ParsedMessagePartICUMessageRef(index, disp));
    }
    addICUMessage(text) {
        this._parts.push(new ParsedMessagePartICUMessage(text, this._parser));
    }
    /**
     * Determine, wether there is an open tag, that is not closed.
     * Returns the latest one or null, if there is no open tag.
     */
    calculateOpenTagName() {
        const openTags = [];
        this._parts.forEach((part) => {
            switch (part.type) {
                case ParsedMessagePartType.START_TAG:
                    openTags.push(part.tagName());
                    break;
                case ParsedMessagePartType.END_TAG:
                    const tagName = part.tagName();
                    if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                        // oops, not well formed
                        const openTag = (openTags.length === 0) ? 'nothing' : openTags[openTags.length - 1];
                        throw new Error(format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagName, openTag, this.asNativeString()));
                    }
                    openTags.pop();
            }
        });
        return openTags.length === 0 ? null : openTags[openTags.length - 1];
    }
}

/**
 * Created by martin on 14.05.2017.
 * A tokenizer for normalized messages.
 */
// Tokens
const TEXT$1 = 'TEXT';
const START_TAG = 'START_TAG';
const END_TAG = 'END_TAG';
const EMPTY_TAG = 'EMPTY_TAG';
const PLACEHOLDER = 'PLACEHOLDER';
const ICU_MESSAGE_REF = 'ICU_MESSAGE_REF';
const ICU_MESSAGE = 'ICU_MESSAGE';
class ParsedMesageTokenizer {
    getLexer() {
        const lexer = new Tokenizr();
        let plaintext = '';
        lexer.before((ctx, match, rule) => {
            if (rule.name !== TEXT$1 && plaintext !== '') {
                ctx.accept(TEXT$1, { text: plaintext });
                plaintext = '';
            }
        });
        lexer.finish((ctx) => {
            if (plaintext !== '') {
                ctx.accept(TEXT$1, { text: plaintext });
            }
        });
        // empty tag, there are only a few allowed (see tag-mappings): ['BR', 'HR', 'IMG', 'AREA', 'LINK', 'WBR']
        // format is <name id="nr">, nr ist optional, z.B. <img> oder <img id="2">
        lexer.rule(/<(br|hr|img|area|link|wbr)( id="([0-9])*")?\>/, (ctx, match) => {
            const idcount = isNullOrUndefined(match[3]) ? 0 : parseInt(match[3], 10);
            ctx.accept(EMPTY_TAG, { name: match[1], idcounter: idcount });
        }, EMPTY_TAG);
        // start tag, Format <name id="nr">, nr ist optional, z.B. <mytag> oder <mytag id="2">
        lexer.rule(/<([a-zA-Z][a-zA-Z-0-9]*)( id="([0-9]*)")?>/, (ctx, match) => {
            const idcount = isNullOrUndefined(match[3]) ? 0 : parseInt(match[3], 10);
            ctx.accept(START_TAG, { name: match[1], idcounter: idcount });
        }, START_TAG);
        // end tag
        lexer.rule(/<\/([a-zA-Z][a-zA-Z-0-9]*)>/, (ctx, match) => {
            ctx.accept(END_TAG, { name: match[1] });
        }, END_TAG);
        // placeholder
        lexer.rule(/{{([0-9]+)}}/, (ctx, match) => {
            ctx.accept(PLACEHOLDER, { idcounter: parseInt(match[1], 10) });
        }, PLACEHOLDER);
        // icu message ref
        lexer.rule(/<ICU-Message-Ref_([0-9]+)\/>/, (ctx, match) => {
            ctx.accept(ICU_MESSAGE_REF, { idcounter: parseInt(match[1], 10) });
        }, ICU_MESSAGE_REF);
        // icu message
        lexer.rule(/<ICU-Message\/>/, (ctx, match) => {
            ctx.accept(ICU_MESSAGE, { message: match[0] });
        }, ICU_MESSAGE);
        // text
        lexer.rule(/./, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT$1);
        lexer.rule(/[\t\r\n]+/, (ctx, match) => {
            plaintext += match[0];
            ctx.ignore();
        }, TEXT$1);
        return lexer;
    }
    tokenize(normalizedMessage) {
        const lexer = this.getLexer();
        lexer.reset();
        lexer.input(normalizedMessage);
        return lexer.tokens();
    }
}

/**
 * Created by roobm on 10.05.2017.
 * A message parser can parse the xml content of a translatable message.
 * It generates a ParsedMessage from it.
 */
class AbstractMessageParser {
    /**
     * Parse XML to ParsedMessage.
     * @param xmlElement the xml representation
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXML(xmlElement, sourceMessage) {
        const message = new ParsedMessage(this, sourceMessage);
        if (xmlElement) {
            message.setXmlRepresentation(xmlElement);
            this.addPartsOfNodeToMessage(xmlElement, message, false);
        }
        return message;
    }
    /**
     * Parse XML string to ParsedMessage.
     * @param xmlString the xml representation without root element, e.g. this is <ph x></ph> an example.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXMLString(xmlString, sourceMessage) {
        const doc = new DOMParser().parseFromString('<dummy>' + xmlString + '</dummy>', 'text/xml');
        const xmlElement = doc.childNodes.item(0);
        return this.createNormalizedMessageFromXML(xmlElement, sourceMessage);
    }
    /**
     * recursively run through a node and add all identified parts to the message.
     * @param node node
     * @param message message to be generated.
     * @param includeSelf if true, add node by itself, otherwise only children.
     */
    addPartsOfNodeToMessage(node, message, includeSelf) {
        let processChildren = true;
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
            const icuMessageText = this.getICUMessageText(node);
            let isICU = !isNullOrUndefined(icuMessageText);
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
                const children = node.childNodes;
                for (let i = 0; i < children.length; i++) {
                    this.addPartsOfNodeToMessage(children.item(i), message, true);
                }
            }
        }
        if (node.nodeType === node.ELEMENT_NODE) {
            this.processEndElement(node, message);
        }
    }
    /**
     * Return the ICU message content of the node, if it is an ICU Message.
     * @param node node
     * @return message or null, if it is no ICU Message.
     */
    getICUMessageText(node) {
        const children = node.childNodes;
        if (children.length === 0) {
            return null;
        }
        const firstChild = children.item(0);
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
    }
    /**
     * Test, wether text is beginning of ICU Message.
     * @param text text
     */
    isICUMessageStart(text) {
        return ParsedMessagePartICUMessage.looksLikeICUMessage(text);
        //        return text.startsWith('{VAR_PLURAL') || text.startsWith('{VAR_SELECT');
    }
    /**
     * Parse normalized string to ParsedMessage.
     * @param normalizedString normalized string
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if normalized string is not well formed.
     */
    parseNormalizedString(normalizedString, sourceMessage) {
        const message = new ParsedMessage(this, sourceMessage);
        const openTags = [];
        let tokens;
        try {
            tokens = new ParsedMesageTokenizer().tokenize(normalizedString);
        }
        catch (error) {
            throw new Error(format('unexpected error while parsing message: "%s" (parsed "%")', error.message, normalizedString));
        }
        tokens.forEach((token) => {
            let disp = null;
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
                        throw new Error(format('unexpected close tag "%s" (parsed "%s")', token.value.name, normalizedString));
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
                    throw new Error(format('<ICUMessage/> not allowed here, use parseICUMessage instead (parsed "%")', normalizedString));
                default:
                    break;
            }
        });
        if (openTags.length > 0) {
            // oops, not well closed tags
            throw new Error(format('missing close tag "%s" (parsed "%s")', openTags[openTags.length - 1], normalizedString));
        }
        message.setXmlRepresentation(this.createXmlRepresentation(message));
        return message;
    }
    /**
     * Parse a string, that is an ICU message, to ParsedMessage.
     * @param icuMessageString the message, like '{x, plural, =0 {nothing} =1 {one} other {many}}'.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if icuMessageString has not the correct syntax.
     */
    parseICUMessage(icuMessageString, sourceMessage) {
        const message = new ParsedMessage(this, sourceMessage);
        message.addICUMessage(icuMessageString);
        return message;
    }
    /**
     * Helper function: Parse ID from a name.
     * name optionally ends with _<number>. This is the idcount.
     * E.g. name="TAG_IMG" returns 0
     * name = "TAG_IMG_1" returns 1
     * @param name name
     * @return id count
     */
    parseIdCountFromName(name) {
        const regex = /.*_([0-9]*)/;
        const match = regex.exec(name);
        if (isNullOrUndefined(match) || match[1] === '') {
            return 0;
        }
        else {
            const num = match[1];
            return parseInt(num, 10);
        }
    }
    /**
     * Create the native xml for a message.
     * Parts are already set here.
     * @param message message
     */
    createXmlRepresentation(message) {
        const root = new DOMParser().parseFromString('<dummy/>', 'text/xml');
        const rootElem = root.getElementsByTagName('dummy').item(0);
        this.addXmlRepresentationToRoot(message, rootElem);
        return rootElem;
    }
    createXmlRepresentationOfTextPart(part, rootElem) {
        return rootElem.ownerDocument.createTextNode(part.asDisplayString());
    }
}

/**
 * Created by roobm on 16.05.2017.
 * Mapping from normalized tag names to placeholder names.
 */
/*
copied from https://github.com/angular/angular/blob/master/packages/compiler/src/i18n/serializers/placeholder.ts
 */
const TAG_TO_PLACEHOLDER_NAMES = {
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
const VOID_TAGS = ['BR', 'HR', 'IMG', 'AREA', 'LINK', 'WBR'];
class TagMapping {
    getStartTagPlaceholderName(tag, id) {
        const upperTag = tag.toUpperCase();
        const baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || `TAG_${upperTag}`;
        return `START_${baseName}` + this.counterString(id);
    }
    getCloseTagPlaceholderName(tag) {
        const upperTag = tag.toUpperCase();
        const baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || `TAG_${upperTag}`;
        return `CLOSE_${baseName}`;
    }
    getEmptyTagPlaceholderName(tag, id) {
        const upperTag = tag.toUpperCase();
        const baseName = TAG_TO_PLACEHOLDER_NAMES[upperTag] || `TAG_${upperTag}`;
        return baseName + this.counterString(id);
    }
    getCtypeForTag(tag) {
        switch (tag.toLowerCase()) {
            case 'br':
                return 'lb';
            case 'img':
                return 'image';
            default:
                return `x-${tag}`;
        }
    }
    getTagnameFromStartTagPlaceholderName(placeholderName) {
        if (placeholderName.startsWith('START_TAG_')) {
            return this.stripCounter(placeholderName.substring('START_TAG_'.length)).toLowerCase();
        }
        else if (placeholderName.startsWith('START_')) {
            const ph = this.stripCounter(placeholderName.substring('START_'.length));
            const matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find((key) => TAG_TO_PLACEHOLDER_NAMES[key] === ph);
            return matchKey ? matchKey.toLowerCase() : null;
        }
        return null;
    }
    getTagnameFromCloseTagPlaceholderName(placeholderName) {
        if (placeholderName.startsWith('CLOSE_TAG_')) {
            return this.stripCounter(placeholderName.substring('CLOSE_TAG_'.length)).toLowerCase();
        }
        else if (placeholderName.startsWith('CLOSE_')) {
            const ph = this.stripCounter(placeholderName.substring('CLOSE_'.length));
            const matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find((key) => TAG_TO_PLACEHOLDER_NAMES[key] === ph);
            return matchKey ? matchKey.toLowerCase() : null;
        }
        return null;
    }
    /**
     * Test, wether placeholder name stands for empty html tag.
     * @param placeholderName can be TAG_<name> or just <name>
     */
    isEmptyTagPlaceholderName(placeholderName) {
        const ph = this.stripCounter(placeholderName);
        let matchKey;
        if (ph.startsWith('TAG_')) {
            matchKey = ph.substring(4).toUpperCase();
        }
        else {
            matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find((key) => TAG_TO_PLACEHOLDER_NAMES[key] === ph);
        }
        if (matchKey) {
            if (VOID_TAGS.indexOf(matchKey) >= 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * tagname of empty tag placeholder.
     * @param placeholderName can be TAG_<name> or just <name>
     */
    getTagnameFromEmptyTagPlaceholderName(placeholderName) {
        const ph = this.stripCounter(placeholderName);
        let matchKey;
        if (ph.startsWith('TAG_')) {
            matchKey = ph.substring(4).toUpperCase();
        }
        else {
            matchKey = Object.keys(TAG_TO_PLACEHOLDER_NAMES).find((key) => TAG_TO_PLACEHOLDER_NAMES[key] === ph);
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
    }
    /**
     * If placeholder ends with _[0-9]+, strip that number.
     * @param placeholderName placeholderName
     * @return placeholderName without counter at end.
     */
    stripCounter(placeholderName) {
        if (placeholderName) {
            const re = /(.*)_[0-9]+$/;
            if (placeholderName.match(re)) {
                return placeholderName.replace(re, '$1');
            }
        }
        return placeholderName;
    }
    /**
     * String suffix for counter.
     * If counter is 0, it is empty, otherwise _<id>.
     * @param id id
     * @return suffix for counter.
     */
    counterString(id) {
        if (id === 0) {
            return '';
        }
        else {
            return '_' + id.toString(10);
        }
    }
}

/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 1.2
 */
class XliffMessageParser extends AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    processStartElement(elementNode, message) {
        const tagName = elementNode.tagName;
        const tagMapping = new TagMapping();
        if (tagName === 'x') {
            // placeholder are like <x id="INTERPOLATION"/> or <x id="INTERPOLATION_1">
            const id = elementNode.getAttribute('id');
            if (!id) {
                return; // should not happen
            }
            if (id.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromId(id);
                message.addPlaceholder(index, null);
            }
            else if (id.startsWith('ICU')) {
                const index = this.parseICUMessageRefIndexFromId(id);
                message.addICUMessageRef(index, null);
            }
            else if (id.startsWith('START_')) {
                const normalizedTagName = tagMapping.getTagnameFromStartTagPlaceholderName(id);
                if (normalizedTagName) {
                    const idcount = this.parseIdCountFromName(id);
                    message.addStartTag(normalizedTagName, idcount);
                }
            }
            else if (id.startsWith('CLOSE_')) {
                const normalizedTagName = tagMapping.getTagnameFromCloseTagPlaceholderName(id);
                if (normalizedTagName) {
                    message.addEndTag(normalizedTagName);
                }
            }
            else if (tagMapping.isEmptyTagPlaceholderName(id)) {
                const normalizedTagName = tagMapping.getTagnameFromEmptyTagPlaceholderName(id);
                if (normalizedTagName) {
                    const idcount = this.parseIdCountFromName(id);
                    message.addEmptyTag(normalizedTagName, idcount);
                }
            }
        }
        return true;
    }
    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode elementNode
     * @param message message to be altered
     */
    processEndElement(elementNode, message) {
    }
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param id id
     * @return index
     */
    parsePlaceholderIndexFromId(id) {
        let indexString = '';
        if (id === 'INTERPOLATION') {
            indexString = '0';
        }
        else {
            indexString = id.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param id id
     * @return id as number
     */
    parseICUMessageRefIndexFromId(id) {
        let indexString = '';
        if (id === 'ICU') {
            indexString = '0';
        }
        else {
            indexString = id.substring('ICU_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    addXmlRepresentationToRoot(message, rootElem) {
        message.parts().forEach((part) => {
            let child;
            switch (part.type) {
                case ParsedMessagePartType.TEXT:
                    child = this.createXmlRepresentationOfTextPart(part, rootElem);
                    break;
                case ParsedMessagePartType.START_TAG:
                    child = this.createXmlRepresentationOfStartTagPart(part, rootElem);
                    break;
                case ParsedMessagePartType.END_TAG:
                    child = this.createXmlRepresentationOfEndTagPart(part, rootElem);
                    break;
                case ParsedMessagePartType.EMPTY_TAG:
                    child = this.createXmlRepresentationOfEmptyTagPart(part, rootElem);
                    break;
                case ParsedMessagePartType.PLACEHOLDER:
                    child = this.createXmlRepresentationOfPlaceholderPart(part, rootElem);
                    break;
                case ParsedMessagePartType.ICU_MESSAGE_REF:
                    child = this.createXmlRepresentationOfICUMessageRefPart(part, rootElem);
                    break;
            }
            if (child) {
                rootElem.appendChild(child);
            }
        });
    }
    /**
     * the xml used for start tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfStartTagPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new TagMapping();
        const idAttrib = tagMapping.getStartTagPlaceholderName(part.tagName(), part.idCounter());
        const ctypeAttrib = tagMapping.getCtypeForTag(part.tagName());
        const equivTextAttr = '<' + part.tagName() + '>';
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        xElem.setAttribute('equiv-text', equivTextAttr);
        return xElem;
    }
    /**
     * the xml used for end tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEndTagPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new TagMapping();
        const idAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
        const ctypeAttrib = 'x-' + part.tagName();
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        return xElem;
    }
    /**
     * the xml used for empty tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEmptyTagPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new TagMapping();
        const idAttrib = tagMapping.getEmptyTagPlaceholderName(part.tagName(), part.idCounter());
        const ctypeAttrib = tagMapping.getCtypeForTag(part.tagName());
        const equivTextAttr = '<' + part.tagName() + '/>';
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        xElem.setAttribute('equiv-text', equivTextAttr);
        return xElem;
    }
    /**
     * the xml used for placeholder in the message.
     * Returns an empty <x/>-Element with attribute id="INTERPOLATION" or id="INTERPOLATION_n"
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfPlaceholderPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        let idAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            idAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        const equivTextAttr = part.disp();
        xElem.setAttribute('id', idAttrib);
        if (equivTextAttr) {
            xElem.setAttribute('equiv-text', equivTextAttr);
        }
        return xElem;
    }
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfICUMessageRefPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        let idAttrib = 'ICU';
        if (part.index() > 0) {
            idAttrib = 'ICU_' + part.index().toString(10);
        }
        xElem.setAttribute('id', idAttrib);
        return xElem;
    }
}

/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XLIFF 1.2 file.
 */
class XliffTransUnit extends AbstractTransUnit {
    constructor(_element, _id, _translationMessagesFile) {
        super(_element, _id, _translationMessagesFile);
    }
    sourceContent() {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        return DOMUtilities.getXMLContent(sourceElement);
    }
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    setSourceContent(newContent) {
        let source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        if (!source) {
            // should not happen, there always has to be a source, but who knows..
            source = this._element.appendChild(this._element.ownerDocument.createElement('source'));
        }
        DOMUtilities.replaceContentWithXMLContent(source, newContent);
    }
    /**
     * Return a parser used for normalized messages.
     */
    messageParser() {
        return new XliffMessageParser();
    }
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    createSourceContentNormalized() {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        if (sourceElement) {
            return this.messageParser().createNormalizedMessageFromXML(sourceElement, null);
        }
        else {
            return null;
        }
    }
    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    targetContent() {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return DOMUtilities.getXMLContent(targetElement);
    }
    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized() {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return new XliffMessageParser().createNormalizedMessageFromXML(targetElement, this.sourceContentNormalized());
    }
    /**
     * State of the translation as stored in the xml.
     */
    nativeTargetState() {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (targetElement) {
            return targetElement.getAttribute('state');
        }
        else {
            return null;
        }
    }
    /**
     * set state in xml.
     * @param nativeState nativeState
     */
    setNativeTargetState(nativeState) {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (targetElement) {
            targetElement.setAttribute('state', nativeState);
        }
    }
    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    mapStateToNativeState(state) {
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
    }
    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState nativeState
     */
    mapNativeStateToState(nativeState) {
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
    }
    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    sourceReferences() {
        const sourceElements = this._element.getElementsByTagName('context-group');
        const sourceRefs = [];
        for (let i = 0; i < sourceElements.length; i++) {
            const elem = sourceElements.item(i);
            if (elem.getAttribute('purpose') === 'location') {
                const contextElements = elem.getElementsByTagName('context');
                let sourcefile = null;
                let linenumber = 0;
                for (let j = 0; j < contextElements.length; j++) {
                    const contextElem = contextElements.item(j);
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
    }
    /**
     * Set source ref elements in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing source refs.
     * @param sourceRefs the sourcerefs to set. Old ones are removed.
     */
    setSourceReferences(sourceRefs) {
        this.removeAllSourceReferences();
        sourceRefs.forEach((ref) => {
            const contextGroup = this._element.ownerDocument.createElement('context-group');
            contextGroup.setAttribute('purpose', 'location');
            const contextSource = this._element.ownerDocument.createElement('context');
            contextSource.setAttribute('context-type', 'sourcefile');
            contextSource.appendChild(this._element.ownerDocument.createTextNode(ref.sourcefile));
            const contextLine = this._element.ownerDocument.createElement('context');
            contextLine.setAttribute('context-type', 'linenumber');
            contextLine.appendChild(this._element.ownerDocument.createTextNode(ref.linenumber.toString(10)));
            contextGroup.appendChild(contextSource);
            contextGroup.appendChild(contextLine);
            this._element.appendChild(contextGroup);
        });
    }
    removeAllSourceReferences() {
        const sourceElements = this._element.getElementsByTagName('context-group');
        const toBeRemoved = [];
        for (let i = 0; i < sourceElements.length; i++) {
            const elem = sourceElements.item(i);
            if (elem.getAttribute('purpose') === 'location') {
                toBeRemoved.push(elem);
            }
        }
        toBeRemoved.forEach((elem) => { elem.parentNode.removeChild(elem); });
    }
    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xliff this is stored as a note element with attribute from="description".
     */
    description() {
        const noteElem = this.findNoteElementWithFromAttribute('description');
        if (noteElem) {
            return DOMUtilities.getPCDATA(noteElem);
        }
        else {
            return null;
        }
    }
    /**
     * Change description property of trans-unit.
     * @param description description
     */
    setDescription(description) {
        let noteElem = this.findNoteElementWithFromAttribute('description');
        if (description) {
            if (isNullOrUndefined(noteElem)) {
                // create it
                noteElem = this.createNoteElementWithFromAttribute('description', description);
            }
            else {
                DOMUtilities.replaceContentWithXMLContent(noteElem, description);
            }
        }
        else {
            if (!isNullOrUndefined(noteElem)) {
                // remove node
                this.removeNoteElementWithFromAttribute('description');
            }
        }
    }
    /**
     * Find a note element with attribute from='<attrValue>'
     * @param attrValue attrValue
     * @return element or null is absent
     */
    findNoteElementWithFromAttribute(attrValue) {
        const noteElements = this._element.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('from') === attrValue) {
                return noteElem;
            }
        }
        return null;
    }
    /**
     * Get all note elements where from attribute is not description or meaning
     * @return elements
     */
    findAllAdditionalNoteElements() {
        const noteElements = this._element.getElementsByTagName('note');
        const result = [];
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            const fromAttribute = noteElem.getAttribute('from');
            if (fromAttribute !== 'description' && fromAttribute !== 'meaning') {
                result.push(noteElem);
            }
        }
        return result;
    }
    /**
     * Create a new note element with attribute from='<attrValue>'
     * @param fromAttrValue value of "from" attribute
     * @param content text value of note element
     * @return the new created element
     */
    createNoteElementWithFromAttribute(fromAttrValue, content) {
        const noteElement = this._element.ownerDocument.createElement('note');
        if (fromAttrValue) {
            noteElement.setAttribute('from', fromAttrValue);
        }
        noteElement.setAttribute('priority', '1');
        if (content) {
            DOMUtilities.replaceContentWithXMLContent(noteElement, content);
        }
        this._element.appendChild(noteElement);
        return noteElement;
    }
    /**
     * Remove note element with attribute from='<attrValue>'
     * @param attrValue attrValue
     */
    removeNoteElementWithFromAttribute(attrValue) {
        const noteElement = this.findNoteElementWithFromAttribute(attrValue);
        if (noteElement) {
            this._element.removeChild(noteElement);
        }
    }
    /**
     * Remove all note elements where attribute "from" is not description or meaning.
     */
    removeAllAdditionalNoteElements() {
        const noteElements = this.findAllAdditionalNoteElements();
        noteElements.forEach((noteElement) => {
            this._element.removeChild(noteElement);
        });
    }
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xliff this is stored as a note element with attribute from="meaning".
     */
    meaning() {
        const noteElem = this.findNoteElementWithFromAttribute('meaning');
        if (noteElem) {
            return DOMUtilities.getPCDATA(noteElem);
        }
        else {
            return null;
        }
    }
    /**
     * Change meaning property of trans-unit.
     * @param  meaning meaning
     */
    setMeaning(meaning) {
        let noteElem = this.findNoteElementWithFromAttribute('meaning');
        if (meaning) {
            if (isNullOrUndefined(noteElem)) {
                // create it
                noteElem = this.createNoteElementWithFromAttribute('meaning', meaning);
            }
            else {
                DOMUtilities.replaceContentWithXMLContent(noteElem, meaning);
            }
        }
        else {
            if (!isNullOrUndefined(noteElem)) {
                // remove node
                this.removeNoteElementWithFromAttribute('meaning');
            }
        }
    }
    /**
     * Get all notes of the trans-unit.
     * Notes are remarks made by a translator.
     * (description and meaning are not included here!)
     */
    notes() {
        const noteElememts = this.findAllAdditionalNoteElements();
        return noteElememts.map(elem => {
            return {
                from: elem.getAttribute('from'),
                text: DOMUtilities.getPCDATA(elem)
            };
        });
    }
    /**
     * Test, wether setting of notes is supported.
     * If not, setNotes will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetNotes() {
        return true;
    }
    /**
     * Add notes to trans unit.
     * @param newNotes the notes to add.
     * @throws an Error if any note contains description or meaning as from attribute.
     */
    setNotes(newNotes) {
        if (!isNullOrUndefined(newNotes)) {
            this.checkNotes(newNotes);
        }
        this.removeAllAdditionalNoteElements();
        if (!isNullOrUndefined(newNotes)) {
            newNotes.forEach((note) => {
                const noteElem = this.createNoteElementWithFromAttribute(note.from, note.text);
            });
        }
    }
    /**
     * Set the translation to a given string (including markup).
     * @param translation translation
     */
    translateNative(translation) {
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            const source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = DOMUtilities.createFollowingSibling('target', source);
        }
        DOMUtilities.replaceContentWithXMLContent(target, translation);
        this.setTargetState(STATE_TRANSLATED);
    }
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     */
    cloneWithSourceAsTarget(isDefaultLang, copyContent, targetFile) {
        const element = this._element.cloneNode(true);
        const clone = new XliffTransUnit(element, this._id, targetFile);
        clone.useSourceAsTarget(isDefaultLang, copyContent);
        return clone;
    }
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    useSourceAsTarget(isDefaultLang, copyContent) {
        const source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            target = DOMUtilities.createFollowingSibling('target', source);
        }
        if (isDefaultLang || copyContent) {
            const sourceString = DOMUtilities.getXMLContent(source);
            let newTargetString = sourceString;
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
    }
}

/**
 * Created by martin on 23.02.2017.
 * Ab xliff file read from a source file.
 * Defines some relevant get and set method for reading and modifying such a file.
 */
class XliffFile extends AbstractTranslationMessagesFile {
    /**
     * Create an xlf-File from source.
     * @param xmlString source read from file.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return XliffFile
     */
    constructor(xmlString, path, encoding) {
        super();
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }
    initializeFromContent(xmlString, path, encoding) {
        this.parseContent(xmlString, path, encoding);
        const xliffList = this._parsedDocument.getElementsByTagName('xliff');
        if (xliffList.length !== 1) {
            throw new Error(format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
        }
        else {
            const version = xliffList.item(0).getAttribute('version');
            const expectedVersion = '1.2';
            if (version !== expectedVersion) {
                throw new Error(format('File "%s" seems to be no xliff 1.2 file, version should be %s, found %s', path, expectedVersion, version));
            }
        }
        return this;
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return FORMAT_XLIFF12;
    }
    /**
     * File type.
     * Here 'XLIFF 1.2'
     */
    fileType() {
        return FILETYPE_XLIFF12;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['source', 'target', 'tool', 'seg-source', 'g', 'ph', 'bpt', 'ept', 'it', 'sub', 'mrk'];
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('trans-unit');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const transunit = transUnitsInFile.item(i);
            const id = transunit.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new XliffTransUnit(transunit, id, this));
        }
    }
    /**
     * Get source language.
     * @return source language.
     */
    sourceLanguage() {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            return fileElem.getAttribute('source-language');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the source language.
     * @param language language
     */
    setSourceLanguage(language) {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            fileElem.setAttribute('source-language', language);
        }
    }
    /**
     * Get target language.
     * @return target language.
     */
    targetLanguage() {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            return fileElem.getAttribute('target-language');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the target language.
     * @param language language
     */
    setTargetLanguage(language) {
        const fileElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (fileElem) {
            fileElem.setAttribute('target-language', language);
        }
    }
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
    importNewTransUnit(foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
        if (this.transUnitWithId(foreignTransUnit.id)) {
            throw new Error(format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
        }
        const newTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
        const bodyElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'body');
        if (!bodyElement) {
            throw new Error(format('File "%s" seems to be no xliff 1.2 file (should contain a body element)', this._filename));
        }
        let inserted = false;
        let isAfterElementPartOfFile = false;
        if (!!importAfterElement) {
            const insertionPoint = this.transUnitWithId(importAfterElement.id);
            if (!!insertionPoint) {
                isAfterElementPartOfFile = true;
            }
        }
        if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
            bodyElement.appendChild(newTu.asXmlElement());
            inserted = true;
        }
        else if (importAfterElement === null) {
            const firstUnitElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'trans-unit');
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
            const refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'trans-unit', importAfterElement.id);
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
    }
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
    createTranslationFileForLang(lang, filename, isDefaultLang, copyContent) {
        const translationFile = new XliffFile(this.editedContent(), filename, this.encoding());
        translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
        translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
        translationFile.setTargetLanguage(lang);
        translationFile.forEachTransUnit((transUnit) => {
            transUnit.useSourceAsTarget(isDefaultLang, copyContent);
        });
        return translationFile;
    }
}

/**
 * Created by roobm on 10.05.2017.
 * A message parser for XMB
 */
class XmbMessageParser extends AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    processStartElement(elementNode, message) {
        const tagName = elementNode.tagName;
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
            const name = elementNode.getAttribute('name');
            if (!name) {
                return true; // should not happen
            }
            if (name.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromName(name);
                message.addPlaceholder(index, null);
                return false; // ignore children
            }
            else if (name.startsWith('START_')) {
                const tag = this.parseTagnameFromPhElement(elementNode);
                const idcounter = this.parseIdCountFromName(name);
                if (tag) {
                    message.addStartTag(tag, idcounter);
                }
                return false; // ignore children
            }
            else if (name.startsWith('CLOSE_')) {
                const tag = this.parseTagnameFromPhElement(elementNode);
                if (tag) {
                    message.addEndTag(tag);
                }
                return false; // ignore children
            }
            else if (new TagMapping().isEmptyTagPlaceholderName(name)) {
                const emptyTagName = new TagMapping().getTagnameFromEmptyTagPlaceholderName(name);
                const idcounter = this.parseIdCountFromName(name);
                message.addEmptyTag(emptyTagName, idcounter);
                return false; // ignore children
            }
            else if (name.startsWith('ICU')) {
                const index = this.parseICUMessageIndexFromName(name);
                message.addICUMessageRef(index, null);
                return false; // ignore children
            }
        }
        else if (tagName === 'source') {
            // ignore source
            return false;
        }
        return true;
    }
    /**
     * Return the ICU message content of the node, if it is an ICU Message.
     * @param node node
     * @return message or null, if it is no ICU Message.
     */
    getICUMessageText(node) {
        const children = node.childNodes;
        if (children.length === 0) {
            return null;
        }
        let firstChild = null;
        // find first child that is no source element.
        let i;
        for (i = 0; i < children.length; i++) {
            const child = children.item(i);
            if (child.nodeType !== child.ELEMENT_NODE || child.tagName !== 'source') {
                firstChild = child;
                break;
            }
        }
        if (firstChild && firstChild.nodeType === firstChild.TEXT_NODE) {
            if (this.isICUMessageStart(firstChild.textContent)) {
                const messageText = DOMUtilities.getXMLContent(node);
                if (i > 0) {
                    // drop <source> elements
                    const reSource = new RegExp('<source[^>]*>.*</source>', 'g');
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
    }
    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode elementNode
     * @param message message to be altered
     */
    processEndElement(elementNode, message) {
    }
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param name name
     * @return id as number
     */
    parsePlaceholderIndexFromName(name) {
        let indexString = '';
        if (name === 'INTERPOLATION') {
            indexString = '0';
        }
        else {
            indexString = name.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    /**
     * Parse id attribute of x element as ICU message ref index.
     * id can be "ICU" or "ICU_n"
     * @param name name
     * @return id as number
     */
    parseICUMessageIndexFromName(name) {
        let indexString = '';
        if (name === 'ICU') {
            indexString = '0';
        }
        else {
            indexString = name.substring('ICU_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    /**
     * Parse the tag name from a ph element.
     * It contained in the <ex> subelements value and enclosed in <>.
     * Example: <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>
     * @param phElement phElement
     */
    parseTagnameFromPhElement(phElement) {
        const exElement = DOMUtilities.getFirstElementByTagName(phElement, 'ex');
        if (exElement) {
            const value = DOMUtilities.getPCDATA(exElement);
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
    }
    addXmlRepresentationToRoot(message, rootElem) {
        message.parts().forEach((part) => {
            const child = this.createXmlRepresentationOfPart(part, rootElem);
            if (child) {
                rootElem.appendChild(child);
            }
        });
    }
    createXmlRepresentationOfPart(part, rootElem) {
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
    }
    /**
     * the xml used for start tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfStartTagPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new TagMapping();
        const nameAttrib = tagMapping.getStartTagPlaceholderName(part.tagName(), part.idCounter());
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for end tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEndTagPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new TagMapping();
        const nameAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('</' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for empty tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEmptyTagPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new TagMapping();
        const nameAttrib = tagMapping.getEmptyTagPlaceholderName(part.tagName(), part.idCounter());
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for placeholder in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfPlaceholderPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let nameAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            nameAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfICUMessageRefPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let nameAttrib = 'ICU';
        if (part.index() > 0) {
            nameAttrib = 'ICU_' + part.index().toString(10);
        }
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
        phElem.appendChild(exElem);
        return phElem;
    }
}

/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XMB file.
 */
class XmbTransUnit extends AbstractTransUnit {
    constructor(_element, _id, _translationMessagesFile) {
        super(_element, _id, _translationMessagesFile);
    }
    /**
     * Parses something like 'c:\xxx:7' and returns source and linenumber.
     * @param sourceAndPos something like 'c:\xxx:7', last colon is the separator
     * @return source and linenumber
     */
    static parseSourceAndPos(sourceAndPos) {
        const index = sourceAndPos.lastIndexOf(':');
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
    }
    static parseLineNumber(lineNumberString) {
        return Number.parseInt(lineNumberString, 10);
    }
    /**
     * Get content to translate.
     * Source parts are excluded here.
     * @return source content
     */
    sourceContent() {
        let msgContent = DOMUtilities.getXMLContent(this._element);
        const reSourceElem = /<source>.*<\/source>/g;
        msgContent = msgContent.replace(reSourceElem, '');
        return msgContent;
    }
    /**
     * Test, wether setting of source content is supported.
     * If not, setSourceContent in trans-unit will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceContent() {
        return false;
    }
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    setSourceContent(newContent) {
        // not supported
    }
    /**
     * Return a parser used for normalized messages.
     */
    messageParser() {
        return new XmbMessageParser();
    }
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    createSourceContentNormalized() {
        return this.messageParser().createNormalizedMessageFromXML(this._element, null);
    }
    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    targetContent() {
        // in fact, target and source are just the same in xmb
        return this.sourceContent();
    }
    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized() {
        return new XmbMessageParser().createNormalizedMessageFromXML(this._element, this.sourceContentNormalized());
    }
    /**
     * State of the translation.
     * (not supported in xmb)
     */
    nativeTargetState() {
        return null; // not supported in xmb
    }
    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    mapStateToNativeState(state) {
        return state;
    }
    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState nativeState
     */
    mapNativeStateToState(nativeState) {
        return nativeState;
    }
    /**
     * set state in xml.
     * (not supported in xmb)
     * @param nativeState nativeState
     */
    setNativeTargetState(nativeState) {
        // not supported for xmb
    }
    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    sourceReferences() {
        const sourceElements = this._element.getElementsByTagName('source');
        const sourceRefs = [];
        for (let i = 0; i < sourceElements.length; i++) {
            const elem = sourceElements.item(i);
            const sourceAndPos = DOMUtilities.getPCDATA(elem);
            sourceRefs.push(XmbTransUnit.parseSourceAndPos(sourceAndPos));
        }
        return sourceRefs;
    }
    /**
     * Set source ref elements in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing source refs.
     * @param sourceRefs the sourcerefs to set. Old ones are removed.
     */
    setSourceReferences(sourceRefs) {
        this.removeAllSourceReferences();
        let insertPosition = this._element.childNodes.item(0);
        for (let i = sourceRefs.length - 1; i >= 0; i--) {
            const ref = sourceRefs[i];
            const source = this._element.ownerDocument.createElement('source');
            source.appendChild(this._element.ownerDocument.createTextNode(ref.sourcefile + ':' + ref.linenumber.toString(10)));
            this._element.insertBefore(source, insertPosition);
            insertPosition = source;
        }
    }
    removeAllSourceReferences() {
        const sourceElements = this._element.getElementsByTagName('source');
        const toBeRemoved = [];
        for (let i = 0; i < sourceElements.length; i++) {
            const elem = sourceElements.item(i);
            toBeRemoved.push(elem);
        }
        toBeRemoved.forEach((elem) => { elem.parentNode.removeChild(elem); });
    }
    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xmb this is stored in the attribute "desc".
     */
    description() {
        return this._element.getAttribute('desc');
    }
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xmb this is stored in the attribute "meaning".
     */
    meaning() {
        return this._element.getAttribute('meaning');
    }
    /**
     * Test, wether setting of description and meaning is supported.
     * If not, setDescription and setMeaning will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetDescriptionAndMeaning() {
        return false;
    }
    /**
     * Change description property of trans-unit.
     * @param description description
     */
    setDescription(description) {
        // not supported, do nothing
    }
    /**
     * Change meaning property of trans-unit.
     * @param meaning meaning
     */
    setMeaning(meaning) {
        // not supported, do nothing
    }
    /**
     * Get all notes of the trans-unit.
     * There are NO notes in xmb/xtb
     */
    notes() {
        return [];
    }
    /**
     * Test, wether setting of notes is supported.
     * If not, setNotes will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetNotes() {
        return false;
    }
    /**
     * Add notes to trans unit.
     * @param newNotes the notes to add.
     * NOT Supported in xmb/xtb
     */
    setNotes(newNotes) {
        // not supported, do nothing
    }
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     * In xmb there is nothing to do, because there is only a target, no source.
     */
    cloneWithSourceAsTarget(isDefaultLang, copyContent, targetFile) {
        return this;
    }
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    useSourceAsTarget(isDefaultLang, copyContent) {
        // do nothing
    }
    /**
     * Set the translation to a given string (including markup).
     * In fact, xmb cannot be translated.
     * So this throws an error.
     * @param translation translation
     */
    translateNative(translation) {
        throw new Error('You cannot translate xmb files, use xtb instead.');
    }
}

/**
 * Created by martin on 10.03.2017.
 * xmb-File access.
 */
/**
 * Doctype of xtb translation file corresponding with thos xmb file.
 */
const XTB_DOCTYPE = `<!DOCTYPE translationbundle [
  <!ELEMENT translationbundle (translation)*>
  <!ATTLIST translationbundle lang CDATA #REQUIRED>
  <!ELEMENT translation (#PCDATA|ph)*>
  <!ATTLIST translation id CDATA #REQUIRED>
  <!ELEMENT ph EMPTY>
  <!ATTLIST ph name CDATA #REQUIRED>
]>`;
class XmbFile extends AbstractTranslationMessagesFile {
    /**
     * Create an xmb-File from source.
     * @param _translationMessageFileFactory factory to create a translation file (xtb) for the xmb file
     * @param xmlString file content
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return XmbFile
     */
    constructor(_translationMessageFileFactory, xmlString, path, encoding) {
        super();
        this._translationMessageFileFactory = _translationMessageFileFactory;
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }
    initializeFromContent(xmlString, path, encoding) {
        this.parseContent(xmlString, path, encoding);
        if (this._parsedDocument.getElementsByTagName('messagebundle').length !== 1) {
            throw new Error(format('File "%s" seems to be no xmb file (should contain a messagebundle element)', path));
        }
        return this;
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('msg');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const msg = transUnitsInFile.item(i);
            const id = msg.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, msg without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new XmbTransUnit(msg, id, this));
        }
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return FORMAT_XMB;
    }
    /**
     * File type.
     * Here 'XMB'
     */
    fileType() {
        return FILETYPE_XMB;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['message'];
    }
    /**
     * Guess language from filename.
     * If filename is foo.xy.xmb, than language is assumed to be xy.
     * @return Language or null
     */
    guessLanguageFromFilename() {
        if (this._filename) {
            const parts = this._filename.split('.');
            if (parts.length > 2 && parts[parts.length - 1].toLowerCase() === 'xmb') {
                return parts[parts.length - 2];
            }
        }
        return null;
    }
    /**
     * Get source language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return source language.
     */
    sourceLanguage() {
        return this.guessLanguageFromFilename();
    }
    /**
     * Edit the source language.
     * Unsupported in xmb.
     * @param language language
     */
    setSourceLanguage(language) {
        // do nothing, xmb has no notation for this.
    }
    /**
     * Get target language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return target language.
     */
    targetLanguage() {
        return this.guessLanguageFromFilename();
    }
    /**
     * Edit the target language.
     * Unsupported in xmb.
     * @param language language
     */
    setTargetLanguage(language) {
        // do nothing, xmb has no notation for this.
    }
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
    importNewTransUnit(foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
        throw Error('xmb file cannot be used to store translations, use xtb file');
    }
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
    createTranslationFileForLang(lang, filename, isDefaultLang, copyContent) {
        const translationbundleXMLSource = '<?xml version="1.0" encoding="UTF-8"?>\n' + XTB_DOCTYPE + '\n<translationbundle>\n</translationbundle>\n';
        const translationFile = this._translationMessageFileFactory.createFileFromFileContent(FORMAT_XTB, translationbundleXMLSource, filename, this.encoding(), { xmlContent: this.editedContent(), path: this.filename(), encoding: this.encoding() });
        translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
        translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
        translationFile.setTargetLanguage(lang);
        translationFile.setNewTransUnitTargetPraefix(this.getNewTransUnitTargetPraefix());
        translationFile.setNewTransUnitTargetSuffix(this.getNewTransUnitTargetSuffix());
        this.forEachTransUnit((tu) => {
            translationFile.importNewTransUnit(tu, isDefaultLang, copyContent);
        });
        return translationFile;
    }
}

/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 2.0
 */
class Xliff2MessageParser extends AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    processStartElement(elementNode, message) {
        const tagName = elementNode.tagName;
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
            let isInterpolation = false;
            let isICU = false;
            let isEmptyTag = false;
            const equiv = elementNode.getAttribute('equiv');
            const disp = elementNode.getAttribute('disp');
            let indexString = null;
            let index = 0;
            let emptyTagName = null;
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
            const embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addStartTag(embeddedTagName, this.parseIdCountFromName(elementNode.getAttribute('equivStart')));
            }
        }
        return true;
    }
    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode elementNode
     * @param message message to be altered
     */
    processEndElement(elementNode, message) {
        const tagName = elementNode.tagName;
        if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt"
            // dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            const embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addEndTag(embeddedTagName);
            }
            return;
        }
    }
    tagNameFromPCElement(pcNode) {
        let dispStart = pcNode.getAttribute('dispStart');
        if (dispStart.startsWith('<')) {
            dispStart = dispStart.substring(1);
        }
        if (dispStart.endsWith('>')) {
            dispStart = dispStart.substring(0, dispStart.length - 1);
        }
        return dispStart;
    }
    /**
     * reimplemented here, because XLIFF 2.0 uses a deeper xml model.
     * So we cannot simply replace the message parts by xml parts.
     * @param message message
     * @param rootElem rootElem
     */
    addXmlRepresentationToRoot(message, rootElem) {
        const stack = [{ element: rootElem, tagName: 'root' }];
        let id = 0;
        message.parts().forEach((part) => {
            switch (part.type) {
                case ParsedMessagePartType.TEXT:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfTextPart(part, rootElem));
                    break;
                case ParsedMessagePartType.PLACEHOLDER:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfPlaceholderPart(part, rootElem, id++));
                    break;
                case ParsedMessagePartType.ICU_MESSAGE_REF:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfICUMessageRefPart(part, rootElem));
                    break;
                case ParsedMessagePartType.START_TAG:
                    const newTagElem = this.createXmlRepresentationOfStartTagPart(part, rootElem, id++);
                    stack[stack.length - 1].element.appendChild(newTagElem);
                    stack.push({ element: newTagElem, tagName: part.tagName() });
                    break;
                case ParsedMessagePartType.END_TAG:
                    const closeTagName = part.tagName();
                    if (stack.length <= 1 || stack[stack.length - 1].tagName !== closeTagName) {
                        // oops, not well formed
                        throw new Error('unexpected close tag ' + closeTagName);
                    }
                    stack.pop();
                    break;
                case ParsedMessagePartType.EMPTY_TAG:
                    const emptyTagElem = this.createXmlRepresentationOfEmptyTagPart(part, rootElem, id++);
                    stack[stack.length - 1].element.appendChild(emptyTagElem);
                    break;
            }
        });
        if (stack.length !== 1) {
            // oops, not well closed tags
            throw new Error('missing close tag ' + stack[stack.length - 1].tagName);
        }
    }
    /**
     * the xml used for start tag in the message.
     * Returns an empty pc-Element.
     * e.g. <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">
     * Text content will be added later.
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    createXmlRepresentationOfStartTagPart(part, rootElem, id) {
        const tagMapping = new TagMapping();
        const pcElem = rootElem.ownerDocument.createElement('pc');
        const tagName = part.tagName();
        const equivStart = tagMapping.getStartTagPlaceholderName(tagName, part.idCounter());
        const equivEnd = tagMapping.getCloseTagPlaceholderName(tagName);
        const dispStart = '<' + tagName + '>';
        const dispEnd = '</' + tagName + '>';
        pcElem.setAttribute('id', id.toString(10));
        pcElem.setAttribute('equivStart', equivStart);
        pcElem.setAttribute('equivEnd', equivEnd);
        pcElem.setAttribute('type', this.getTypeForTag(tagName));
        pcElem.setAttribute('dispStart', dispStart);
        pcElem.setAttribute('dispEnd', dispEnd);
        return pcElem;
    }
    /**
     * the xml used for end tag in the message.
     * Not used here, because content is child of start tag.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEndTagPart(part, rootElem) {
        // not used
        return null;
    }
    /**
     * the xml used for empty tag in the message.
     * Returns an empty ph-Element.
     * e.g. <ph id="3" equiv="TAG_IMG" type="image" disp="&lt;img/>"/>
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    createXmlRepresentationOfEmptyTagPart(part, rootElem, id) {
        const tagMapping = new TagMapping();
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagName = part.tagName();
        const equiv = tagMapping.getEmptyTagPlaceholderName(tagName, part.idCounter());
        const disp = '<' + tagName + '/>';
        phElem.setAttribute('id', id.toString(10));
        phElem.setAttribute('equiv', equiv);
        phElem.setAttribute('type', this.getTypeForTag(tagName));
        phElem.setAttribute('disp', disp);
        return phElem;
    }
    getTypeForTag(tag) {
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
    }
    /**
     * the xml used for placeholder in the message.
     * Returns e.g. <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/>
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    createXmlRepresentationOfPlaceholderPart(part, rootElem, id) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let equivAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            equivAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        phElem.setAttribute('id', id.toString(10));
        phElem.setAttribute('equiv', equivAttrib);
        const disp = part.disp();
        if (disp) {
            phElem.setAttribute('disp', disp);
        }
        return phElem;
    }
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfICUMessageRefPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let equivAttrib = 'ICU';
        if (part.index() > 0) {
            equivAttrib = 'ICU_' + part.index().toString(10);
        }
        phElem.setAttribute('id', part.index().toString(10));
        phElem.setAttribute('equiv', equivAttrib);
        const disp = part.disp();
        if (disp) {
            phElem.setAttribute('disp', disp);
        }
        return phElem;
    }
}

/**
 * Created by martin on 04.05.2017.
 * A Translation Unit in an XLIFF 2.0 file.
 */
class Xliff2TransUnit extends AbstractTransUnit {
    constructor(_element, _id, _translationMessagesFile) {
        super(_element, _id, _translationMessagesFile);
    }
    sourceContent() {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        return DOMUtilities.getXMLContent(sourceElement);
    }
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    setSourceContent(newContent) {
        let source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        if (!source) {
            // should not happen, there always has to be a source, but who knows..
            const segment = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
            source = segment.parentNode.appendChild(this._element.ownerDocument.createElement('source'));
        }
        DOMUtilities.replaceContentWithXMLContent(source, newContent);
    }
    /**
     * Return a parser used for normalized messages.
     */
    messageParser() {
        return new Xliff2MessageParser();
    }
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    createSourceContentNormalized() {
        const sourceElement = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        if (sourceElement) {
            return this.messageParser().createNormalizedMessageFromXML(sourceElement, null);
        }
        else {
            return null;
        }
    }
    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    targetContent() {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return DOMUtilities.getXMLContent(targetElement);
    }
    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized() {
        const targetElement = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return new Xliff2MessageParser().createNormalizedMessageFromXML(targetElement, this.sourceContentNormalized());
    }
    /**
     * State of the translation as stored in the xml.
     */
    nativeTargetState() {
        const segmentElement = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segmentElement) {
            return segmentElement.getAttribute('state');
        }
        else {
            return null;
        }
    }
    /**
     * set state in xml.
     * @param nativeState nativeState
     */
    setNativeTargetState(nativeState) {
        const segmentElement = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segmentElement) {
            segmentElement.setAttribute('state', nativeState);
        }
    }
    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    mapStateToNativeState(state) {
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
    }
    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState nativeState
     */
    mapNativeStateToState(nativeState) {
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
    }
    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    sourceReferences() {
        // Source is found as <file>:<line> in <note category="location">...
        const noteElements = this._element.getElementsByTagName('note');
        const sourceRefs = [];
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === 'location') {
                const sourceAndPos = DOMUtilities.getPCDATA(noteElem);
                sourceRefs.push(this.parseSourceAndPos(sourceAndPos));
            }
        }
        return sourceRefs;
    }
    /**
     * Parses something like 'c:\xxx:7' and returns source and linenumber.
     * @param sourceAndPos something like 'c:\xxx:7', last colon is the separator
     * @return source and line number
     */
    parseSourceAndPos(sourceAndPos) {
        const index = sourceAndPos.lastIndexOf(':');
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
    }
    parseLineNumber(lineNumberString) {
        return Number.parseInt(lineNumberString, 10);
    }
    /**
     * Set source ref elements in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing source refs.
     * @param sourceRefs the sourcerefs to set. Old ones are removed.
     */
    setSourceReferences(sourceRefs) {
        this.removeAllSourceReferences();
        let notesElement = DOMUtilities.getFirstElementByTagName(this._element, 'notes');
        if (sourceRefs.length === 0 && !isNullOrUndefined(notesElement) && notesElement.childNodes.length === 0) {
            // remove empty notes element
            notesElement.parentNode.removeChild(notesElement);
            return;
        }
        if (isNullOrUndefined(notesElement)) {
            notesElement = this._element.ownerDocument.createElement('notes');
            this._element.insertBefore(notesElement, this._element.childNodes.item(0));
        }
        sourceRefs.forEach((ref) => {
            const note = this._element.ownerDocument.createElement('note');
            note.setAttribute('category', 'location');
            note.appendChild(this._element.ownerDocument.createTextNode(ref.sourcefile + ':' + ref.linenumber.toString(10)));
            notesElement.appendChild(note);
        });
    }
    removeAllSourceReferences() {
        const noteElements = this._element.getElementsByTagName('note');
        const toBeRemoved = [];
        for (let i = 0; i < noteElements.length; i++) {
            const elem = noteElements.item(i);
            if (elem.getAttribute('category') === 'location') {
                toBeRemoved.push(elem);
            }
        }
        toBeRemoved.forEach((elem) => { elem.parentNode.removeChild(elem); });
    }
    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xliff 2.0 this is stored as a note element with attribute category="description".
     */
    description() {
        const noteElem = this.findNoteElementWithCategoryAttribute('description');
        if (noteElem) {
            return DOMUtilities.getPCDATA(noteElem);
        }
        else {
            return null;
        }
    }
    /**
     * Change description property of trans-unit.
     * @param description description
     */
    setDescription(description) {
        const noteElem = this.findNoteElementWithCategoryAttribute('description');
        if (description) {
            if (isNullOrUndefined(noteElem)) {
                // create it
                this.createNoteElementWithCategoryAttribute('description', description);
            }
            else {
                DOMUtilities.replaceContentWithXMLContent(noteElem, description);
            }
        }
        else {
            if (!isNullOrUndefined(noteElem)) {
                // remove node
                this.removeNoteElementWithCategoryAttribute('description');
            }
        }
    }
    /**
     * Find a note element with attribute category='<attrValue>'
     * @param attrValue value of category attribute
     * @return element or null is absent
     */
    findNoteElementWithCategoryAttribute(attrValue) {
        const noteElements = this._element.getElementsByTagName('note');
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === attrValue) {
                return noteElem;
            }
        }
        return null;
    }
    /**
     * Get all note elements where from attribute is not description or meaning
     * @return elements
     */
    findAllAdditionalNoteElements() {
        const noteElements = this._element.getElementsByTagName('note');
        const result = [];
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            const fromAttribute = noteElem.getAttribute('category');
            if (fromAttribute !== 'description' && fromAttribute !== 'meaning') {
                result.push(noteElem);
            }
        }
        return result;
    }
    /**
     * Create a new note element with attribute from='<attrValue>'
     * @param attrValue category attribute value
     * @param content content of note element
     * @return the new created element
     */
    createNoteElementWithCategoryAttribute(attrValue, content) {
        let notesElement = DOMUtilities.getFirstElementByTagName(this._element, 'notes');
        if (isNullOrUndefined(notesElement)) {
            // create it
            notesElement = this._element.ownerDocument.createElement('notes');
            this._element.appendChild(notesElement);
        }
        const noteElement = this._element.ownerDocument.createElement('note');
        if (attrValue) {
            noteElement.setAttribute('category', attrValue);
        }
        if (content) {
            DOMUtilities.replaceContentWithXMLContent(noteElement, content);
        }
        notesElement.appendChild(noteElement);
        return noteElement;
    }
    removeNotesElementIfEmpty() {
        const notesElement = DOMUtilities.getFirstElementByTagName(this._element, 'notes');
        if (notesElement) {
            const childNote = DOMUtilities.getFirstElementByTagName(this._element, 'note');
            if (!childNote) {
                // remove notes element
                notesElement.parentNode.removeChild(notesElement);
            }
        }
    }
    /**
     * Remove note element with attribute from='<attrValue>'
     * @param attrValue attrValue
     */
    removeNoteElementWithCategoryAttribute(attrValue) {
        const noteElement = this.findNoteElementWithCategoryAttribute(attrValue);
        if (noteElement) {
            noteElement.parentNode.removeChild(noteElement);
        }
        this.removeNotesElementIfEmpty();
    }
    /**
     * Remove all note elements where attribute "from" is not description or meaning.
     */
    removeAllAdditionalNoteElements() {
        const noteElements = this.findAllAdditionalNoteElements();
        noteElements.forEach((noteElement) => {
            noteElement.parentNode.removeChild(noteElement);
        });
        this.removeNotesElementIfEmpty();
    }
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xliff 2.0 this is stored as a note element with attribute category="meaning".
     */
    meaning() {
        const noteElem = this.findNoteElementWithCategoryAttribute('meaning');
        if (noteElem) {
            return DOMUtilities.getPCDATA(noteElem);
        }
        else {
            return null;
        }
    }
    /**
     * Change meaning property of trans-unit.
     * @param meaning meaning
     */
    setMeaning(meaning) {
        const noteElem = this.findNoteElementWithCategoryAttribute('meaning');
        if (meaning) {
            if (isNullOrUndefined(noteElem)) {
                // create it
                this.createNoteElementWithCategoryAttribute('meaning', meaning);
            }
            else {
                DOMUtilities.replaceContentWithXMLContent(noteElem, meaning);
            }
        }
        else {
            if (!isNullOrUndefined(noteElem)) {
                // remove node
                this.removeNoteElementWithCategoryAttribute('meaning');
            }
        }
    }
    /**
     * Get all notes of the trans-unit.
     * Notes are remarks made by a translator.
     * (description and meaning are not included here!)
     */
    notes() {
        const noteElememts = this.findAllAdditionalNoteElements();
        return noteElememts.map(elem => {
            return {
                from: elem.getAttribute('category'),
                text: DOMUtilities.getPCDATA(elem)
            };
        });
    }
    /**
     * Test, wether setting of notes is supported.
     * If not, setNotes will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetNotes() {
        return true;
    }
    /**
     * Add notes to trans unit.
     * @param newNotes the notes to add.
     */
    setNotes(newNotes) {
        if (!isNullOrUndefined(newNotes)) {
            this.checkNotes(newNotes);
        }
        this.removeAllAdditionalNoteElements();
        if (!isNullOrUndefined(newNotes)) {
            newNotes.forEach((note) => {
                this.createNoteElementWithCategoryAttribute(note.from, note.text);
            });
        }
    }
    /**
     * Set the translation to a given string (including markup).
     * @param translation translation
     */
    translateNative(translation) {
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            const source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
        }
        DOMUtilities.replaceContentWithXMLContent(target, translation);
        this.setTargetState(STATE_TRANSLATED);
    }
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     */
    cloneWithSourceAsTarget(isDefaultLang, copyContent, targetFile) {
        const element = this._element.cloneNode(true);
        const clone = new Xliff2TransUnit(element, this._id, targetFile);
        clone.useSourceAsTarget(isDefaultLang, copyContent);
        return clone;
    }
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    useSourceAsTarget(isDefaultLang, copyContent) {
        const source = DOMUtilities.getFirstElementByTagName(this._element, 'source');
        let target = DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
        }
        if (isDefaultLang || copyContent) {
            const sourceString = DOMUtilities.getXMLContent(source);
            let newTargetString = sourceString;
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
        const segment = DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segment) {
            if (isDefaultLang) {
                segment.setAttribute('state', this.mapStateToNativeState(STATE_FINAL));
            }
            else {
                segment.setAttribute('state', this.mapStateToNativeState(STATE_NEW));
            }
        }
    }
}

/**
 * Created by martin on 04.05.2017.
 * An XLIFF 2.0 file read from a source file.
 * Format definition is: http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 * Defines some relevant get and set method for reading and modifying such a file.
 */
class Xliff2File extends AbstractTranslationMessagesFile {
    /**
     * Create an XLIFF 2.0-File from source.
     * @param xmlString source read from file.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return xliff file
     */
    constructor(xmlString, path, encoding) {
        super();
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }
    initializeFromContent(xmlString, path, encoding) {
        this.parseContent(xmlString, path, encoding);
        const xliffList = this._parsedDocument.getElementsByTagName('xliff');
        if (xliffList.length !== 1) {
            throw new Error(format('File "%s" seems to be no xliff file (should contain an xliff element)', path));
        }
        else {
            const version = xliffList.item(0).getAttribute('version');
            const expectedVersion = '2.0';
            if (version !== expectedVersion) {
                throw new Error(format('File "%s" seems to be no xliff 2 file, version should be %s, found %s', path, expectedVersion, version));
            }
        }
        return this;
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return FORMAT_XLIFF20;
    }
    /**
     * File type.
     * Here 'XLIFF 2.0'
     */
    fileType() {
        return FILETYPE_XLIFF20;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['skeleton', 'note', 'data', 'source', 'target', 'pc', 'mrk'];
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('unit');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const transunit = transUnitsInFile.item(i);
            const id = transunit.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, trans-unit without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new Xliff2TransUnit(transunit, id, this));
        }
    }
    /**
     * Get source language.
     * @return source language.
     */
    sourceLanguage() {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            return xliffElem.getAttribute('srcLang');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the source language.
     * @param language language
     */
    setSourceLanguage(language) {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('srcLang', language);
        }
    }
    /**
     * Get target language.
     * @return target language.
     */
    targetLanguage() {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            return xliffElem.getAttribute('trgLang');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the target language.
     * @param language language
     */
    setTargetLanguage(language) {
        const xliffElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'xliff');
        if (xliffElem) {
            xliffElem.setAttribute('trgLang', language);
        }
    }
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
    importNewTransUnit(foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
        if (this.transUnitWithId(foreignTransUnit.id)) {
            throw new Error(format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
        }
        const newTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
        const fileElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'file');
        if (!fileElement) {
            throw new Error(format('File "%s" seems to be no xliff 2.0 file (should contain a file element)', this._filename));
        }
        let inserted = false;
        let isAfterElementPartOfFile = false;
        if (!!importAfterElement) {
            const insertionPoint = this.transUnitWithId(importAfterElement.id);
            if (!!insertionPoint) {
                isAfterElementPartOfFile = true;
            }
        }
        if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
            fileElement.appendChild(newTu.asXmlElement());
            inserted = true;
        }
        else if (importAfterElement === null) {
            const firstUnitElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'unit');
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
            const refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'unit', importAfterElement.id);
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
    }
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
    createTranslationFileForLang(lang, filename, isDefaultLang, copyContent) {
        const translationFile = new Xliff2File(this.editedContent(), filename, this.encoding());
        translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
        translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
        translationFile.setTargetLanguage(lang);
        translationFile.forEachTransUnit((transUnit) => {
            transUnit.useSourceAsTarget(isDefaultLang, copyContent);
        });
        return translationFile;
    }
}

/**
 * Created by martin on 23.05.2017.
 * A Translation Unit in an XTB file.
 */
class XtbTransUnit extends AbstractTransUnit {
    constructor(_element, _id, _translationMessagesFile, _sourceTransUnitFromMaster) {
        super(_element, _id, _translationMessagesFile);
        this._sourceTransUnitFromMaster = _sourceTransUnitFromMaster;
    }
    /**
     * Get content to translate.
     * Source parts are excluded here.
     * @return content to translate.
     */
    sourceContent() {
        if (this._sourceTransUnitFromMaster) {
            return this._sourceTransUnitFromMaster.sourceContent();
        }
        else {
            return null;
        }
    }
    /**
     * Test, wether setting of source content is supported.
     * If not, setSourceContent in trans-unit will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceContent() {
        return false;
    }
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    setSourceContent(newContent) {
        // xtb has no source content, they are part of the master
    }
    /**
     * Return a parser used for normalized messages.
     */
    messageParser() {
        return new XmbMessageParser(); // no typo!, Same as for Xmb
    }
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    createSourceContentNormalized() {
        if (this._sourceTransUnitFromMaster) {
            return this._sourceTransUnitFromMaster.createSourceContentNormalized();
        }
        else {
            return null;
        }
    }
    /**
     * the translated value (containing all markup, depends on the concrete format used).
     */
    targetContent() {
        return DOMUtilities.getXMLContent(this._element);
    }
    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized() {
        return this.messageParser().createNormalizedMessageFromXML(this._element, this.sourceContentNormalized());
    }
    /**
     * State of the translation.
     * (not supported in xmb)
     * If we have a master, we assumed it is translated if the content is not the same as the masters one.
     */
    nativeTargetState() {
        if (this._sourceTransUnitFromMaster) {
            const sourceContent = this._sourceTransUnitFromMaster.sourceContent();
            if (!sourceContent || sourceContent === this.targetContent() || !this.targetContent()) {
                return 'new';
            }
            else {
                return 'final';
            }
        }
        return null; // not supported in xmb
    }
    /**
     * Map an abstract state (new, translated, final) to a concrete state used in the xml.
     * Returns the state to be used in the xml.
     * @param state one of Constants.STATE...
     * @returns a native state (depends on concrete format)
     * @throws error, if state is invalid.
     */
    mapStateToNativeState(state) {
        return state;
    }
    /**
     * Map a native state (found in the document) to an abstract state (new, translated, final).
     * Returns the abstract state.
     * @param nativeState nativeState
     */
    mapNativeStateToState(nativeState) {
        return nativeState;
    }
    /**
     * set state in xml.
     * (not supported in xmb)
     * @param nativeState nativeState
     */
    setNativeTargetState(nativeState) {
        // TODO some logic to store it anywhere
    }
    /**
     * All the source elements in the trans unit.
     * The source element is a reference to the original template.
     * It contains the name of the template file and a line number with the position inside the template.
     * It is just a help for translators to find the context for the translation.
     * This is set when using Angular 4.0 or greater.
     * Otherwise it just returns an empty array.
     */
    sourceReferences() {
        if (this._sourceTransUnitFromMaster) {
            return this._sourceTransUnitFromMaster.sourceReferences();
        }
        else {
            return [];
        }
    }
    /**
     * Test, wether setting of source refs is supported.
     * If not, setSourceReferences will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetSourceReferences() {
        return false;
    }
    /**
     * Set source ref elements in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing source refs.
     * @param sourceRefs the sourcerefs to set. Old ones are removed.
     */
    setSourceReferences(sourceRefs) {
        // xtb has no source refs, they are part of the master
    }
    /**
     * The description set in the template as value of the i18n-attribute.
     * e.g. i18n="mydescription".
     * In xtb only the master stores it.
     */
    description() {
        if (this._sourceTransUnitFromMaster) {
            return this._sourceTransUnitFromMaster.description();
        }
        else {
            return null;
        }
    }
    /**
     * The meaning (intent) set in the template as value of the i18n-attribute.
     * This is the part in front of the | symbol.
     * e.g. i18n="meaning|mydescription".
     * In xtb only the master stores it.
     */
    meaning() {
        if (this._sourceTransUnitFromMaster) {
            return this._sourceTransUnitFromMaster.meaning();
        }
        else {
            return null;
        }
    }
    /**
     * Test, wether setting of description and meaning is supported.
     * If not, setDescription and setMeaning will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetDescriptionAndMeaning() {
        return false;
    }
    /**
     * Change description property of trans-unit.
     * @param description description
     */
    setDescription(description) {
        // not supported, do nothing
    }
    /**
     * Change meaning property of trans-unit.
     * @param meaning meaning
     */
    setMeaning(meaning) {
        // not supported, do nothing
    }
    /**
     * Get all notes of the trans-unit.
     * There are NO notes in xmb/xtb
     */
    notes() {
        return [];
    }
    /**
     * Test, wether setting of notes is supported.
     * If not, setNotes will do nothing.
     * xtb does not support this, all other formats do.
     */
    supportsSetNotes() {
        return false;
    }
    /**
     * Add notes to trans unit.
     * @param newNotes the notes to add.
     * NOT Supported in xmb/xtb
     */
    setNotes(newNotes) {
        // not supported, do nothing
    }
    /**
     * Copy source to target to use it as dummy translation.
     * Returns a changed copy of this trans unit.
     * receiver is not changed.
     * (internal usage only, a client should call importNewTransUnit on ITranslationMessageFile)
     * In xtb there is nothing to do, because there is only a target, no source.
     */
    cloneWithSourceAsTarget(isDefaultLang, copyContent, targetFile) {
        return this;
    }
    /**
     * Copy source to target to use it as dummy translation.
     * (internal usage only, a client should call createTranslationFileForLang on ITranslationMessageFile)
     */
    useSourceAsTarget(isDefaultLang, copyContent) {
        // do nothing
    }
    /**
     * Set the translation to a given string (including markup).
     * @param translation translation
     */
    translateNative(translation) {
        const target = this._element;
        if (isNullOrUndefined(translation)) {
            translation = '';
        }
        DOMUtilities.replaceContentWithXMLContent(target, translation);
    }
}

/**
 * Created by martin on 23.05.2017.
 * xtb-File access.
 * xtb is the translated counterpart to xmb.
 */
class XtbFile extends AbstractTranslationMessagesFile {
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
    constructor(_translationMessageFileFactory, xmlString, path, encoding, optionalMaster) {
        super();
        this._translationMessageFileFactory = _translationMessageFileFactory;
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding, optionalMaster);
    }
    initializeFromContent(xmlString, path, encoding, optionalMaster) {
        this.parseContent(xmlString, path, encoding);
        if (this._parsedDocument.getElementsByTagName('translationbundle').length !== 1) {
            throw new Error(format('File "%s" seems to be no xtb file (should contain a translationbundle element)', path));
        }
        if (optionalMaster) {
            try {
                this._masterFile = this._translationMessageFileFactory.createFileFromFileContent(FORMAT_XMB, optionalMaster.xmlContent, optionalMaster.path, optionalMaster.encoding);
                // check, wether this can be the master ...
                const numberInMaster = this._masterFile.numberOfTransUnits();
                const myNumber = this.numberOfTransUnits();
                if (numberInMaster !== myNumber) {
                    this._warnings.push(format('%s trans units found in master, but this file has %s. Check if it is the correct master', numberInMaster, myNumber));
                }
            }
            catch (error) {
                throw new Error(format('File "%s" seems to be no xmb file. An xtb file needs xmb as master file.', optionalMaster.path));
            }
        }
        return this;
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('translation');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const msg = transUnitsInFile.item(i);
            const id = msg.getAttribute('id');
            if (!id) {
                this._warnings.push(format('oops, msg without "id" found in master, please check file %s', this._filename));
            }
            let masterUnit = null;
            if (this._masterFile) {
                masterUnit = this._masterFile.transUnitWithId(id);
            }
            this.transUnits.push(new XtbTransUnit(msg, id, this, masterUnit));
        }
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xlf2', 'xmb', 'xtb'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return FORMAT_XTB;
    }
    /**
     * File type.
     * Here 'XTB'
     */
    fileType() {
        return FILETYPE_XTB;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['translation'];
    }
    /**
     * Get source language.
     * Unsupported in xmb/xtb.
     * Try to guess it from master filename if any..
     * @return source language.
     */
    sourceLanguage() {
        if (this._masterFile) {
            return this._masterFile.sourceLanguage();
        }
        else {
            return null;
        }
    }
    /**
     * Edit the source language.
     * Unsupported in xmb/xtb.
     * @param language language
     */
    setSourceLanguage(language) {
        // do nothing, xtb has no notation for this.
    }
    /**
     * Get target language.
     * @return target language.
     */
    targetLanguage() {
        const translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            return translationbundleElem.getAttribute('lang');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the target language.
     * @param language language
     */
    setTargetLanguage(language) {
        const translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            translationbundleElem.setAttribute('lang', language);
        }
    }
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
    importNewTransUnit(foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
        if (this.transUnitWithId(foreignTransUnit.id)) {
            throw new Error(format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
        }
        const newMasterTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
        const translationbundleElem = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (!translationbundleElem) {
            throw new Error(format('File "%s" seems to be no xtb file (should contain a translationbundle element)', this._filename));
        }
        const translationElement = translationbundleElem.ownerDocument.createElement('translation');
        translationElement.setAttribute('id', foreignTransUnit.id);
        let newContent = (copyContent || isDefaultLang) ? foreignTransUnit.sourceContent() : '';
        if (!foreignTransUnit.isICUMessage(newContent)) {
            newContent = this.getNewTransUnitTargetPraefix() + newContent + this.getNewTransUnitTargetSuffix();
        }
        DOMUtilities.replaceContentWithXMLContent(translationElement, newContent);
        const newTu = new XtbTransUnit(translationElement, foreignTransUnit.id, this, newMasterTu);
        let inserted = false;
        let isAfterElementPartOfFile = false;
        if (!!importAfterElement) {
            const insertionPoint = this.transUnitWithId(importAfterElement.id);
            if (!!insertionPoint) {
                isAfterElementPartOfFile = true;
            }
        }
        if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
            translationbundleElem.appendChild(newTu.asXmlElement());
            inserted = true;
        }
        else if (importAfterElement === null) {
            const firstTranslationElement = DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translation');
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
            const refUnitElement = DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'translation', importAfterElement.id);
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
    }
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
    createTranslationFileForLang(lang, filename, isDefaultLang, copyContent) {
        throw new Error(format('File "%s", xtb files are not translatable, they are already translations', filename));
    }
}

/**
 * Helper class to read translation files depending on format.
 * This is part of the public api
 */
class TranslationMessagesFileFactory {
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
    static fromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster) {
        return new TranslationMessagesFileFactory().createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster);
    }
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
    static fromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster) {
        return new TranslationMessagesFileFactory().createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster);
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
    createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster) {
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
        throw new Error(format('oops, unsupported format "%s"', i18nFormat));
    }
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
    createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster) {
        let formatCandidates = [FORMAT_XLIFF12, FORMAT_XLIFF20, FORMAT_XMB, FORMAT_XTB];
        if (path && path.endsWith('xmb')) {
            formatCandidates = [FORMAT_XMB, FORMAT_XTB, FORMAT_XLIFF12, FORMAT_XLIFF20];
        }
        if (path && path.endsWith('xtb')) {
            formatCandidates = [FORMAT_XTB, FORMAT_XMB, FORMAT_XLIFF12, FORMAT_XLIFF20];
        }
        // try all candidate formats to get the right one
        for (let i = 0; i < formatCandidates.length; i++) {
            const formatCandidate = formatCandidates[i];
            try {
                const translationFile = TranslationMessagesFileFactory.fromFileContent(formatCandidate, xmlContent, path, encoding, optionalMaster);
                if (translationFile) {
                    return translationFile;
                }
            }
            catch (e) {
                // seams to be the wrong format
            }
        }
        throw new Error(format('could not identify file format, it is neiter XLIFF (1.2 or 2.0) nor XMB/XTB'));
    }
}

/*
 * Public API Surface of ngx-i18nsupport-lib
 */

/**
 * Generated bundle index. Do not edit.
 */

export { FILETYPE_XLIFF12, FILETYPE_XLIFF20, FILETYPE_XMB, FILETYPE_XTB, FORMAT_XLIFF12, FORMAT_XLIFF20, FORMAT_XMB, FORMAT_XTB, NORMALIZATION_FORMAT_DEFAULT, NORMALIZATION_FORMAT_NGXTRANSLATE, NgxI18nsupportLibModule, STATE_FINAL, STATE_NEW, STATE_TRANSLATED, TranslationMessagesFileFactory };
//# sourceMappingURL=ngx-i18nsupport-ngx-i18nsupport-lib.js.map
