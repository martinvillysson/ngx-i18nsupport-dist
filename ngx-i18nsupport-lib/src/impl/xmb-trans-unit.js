"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmbTransUnit = void 0;
const dom_utilities_1 = require("./dom-utilities");
const abstract_trans_unit_1 = require("./abstract-trans-unit");
const xmb_message_parser_1 = require("./xmb-message-parser");
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XMB file.
 */
class XmbTransUnit extends abstract_trans_unit_1.AbstractTransUnit {
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
        let msgContent = dom_utilities_1.DOMUtilities.getXMLContent(this._element);
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
        return new xmb_message_parser_1.XmbMessageParser();
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
        return new xmb_message_parser_1.XmbMessageParser().createNormalizedMessageFromXML(this._element, this.sourceContentNormalized());
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
            const sourceAndPos = dom_utilities_1.DOMUtilities.getPCDATA(elem);
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
exports.XmbTransUnit = XmbTransUnit;
//# sourceMappingURL=xmb-trans-unit.js.map