"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffTransUnit = void 0;
const constants_1 = require("../api/constants");
const dom_utilities_1 = require("./dom-utilities");
const abstract_trans_unit_1 = require("./abstract-trans-unit");
const xliff_message_parser_1 = require("./xliff-message-parser");
const util_1 = require("util");
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XLIFF 1.2 file.
 */
class XliffTransUnit extends abstract_trans_unit_1.AbstractTransUnit {
    constructor(_element, _id, _translationMessagesFile) {
        super(_element, _id, _translationMessagesFile);
    }
    sourceContent() {
        const sourceElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'source');
        return dom_utilities_1.DOMUtilities.getXMLContent(sourceElement);
    }
    /**
     * Set new source content in the transunit.
     * Normally, this is done by ng-extract.
     * Method only exists to allow xliffmerge to merge missing changed source content.
     * @param newContent the new content.
     */
    setSourceContent(newContent) {
        let source = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'source');
        if (!source) {
            // should not happen, there always has to be a source, but who knows..
            source = this._element.appendChild(this._element.ownerDocument.createElement('source'));
        }
        dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(source, newContent);
    }
    /**
     * Return a parser used for normalized messages.
     */
    messageParser() {
        return new xliff_message_parser_1.XliffMessageParser();
    }
    /**
     * The original text value, that is to be translated, as normalized message.
     */
    createSourceContentNormalized() {
        const sourceElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'source');
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
        const targetElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return dom_utilities_1.DOMUtilities.getXMLContent(targetElement);
    }
    /**
     * the translated value, but all placeholders are replaced with {{n}} (starting at 0)
     * and all embedded html is replaced by direct html markup.
     */
    targetContentNormalized() {
        const targetElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
        return new xliff_message_parser_1.XliffMessageParser().createNormalizedMessageFromXML(targetElement, this.sourceContentNormalized());
    }
    /**
     * State of the translation as stored in the xml.
     */
    nativeTargetState() {
        const targetElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
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
        const targetElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
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
            case constants_1.STATE_NEW:
                return 'new';
            case constants_1.STATE_TRANSLATED:
                return 'translated';
            case constants_1.STATE_FINAL:
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
                return constants_1.STATE_NEW;
            case 'needs-translation':
                return constants_1.STATE_NEW;
            case 'translated':
                return constants_1.STATE_TRANSLATED;
            case 'needs-adaptation':
                return constants_1.STATE_TRANSLATED;
            case 'needs-l10n':
                return constants_1.STATE_TRANSLATED;
            case 'needs-review-adaptation':
                return constants_1.STATE_TRANSLATED;
            case 'needs-review-l10n':
                return constants_1.STATE_TRANSLATED;
            case 'needs-review-translation':
                return constants_1.STATE_TRANSLATED;
            case 'final':
                return constants_1.STATE_FINAL;
            case 'signed-off':
                return constants_1.STATE_FINAL;
            default:
                return constants_1.STATE_NEW;
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
                        sourcefile = dom_utilities_1.DOMUtilities.getPCDATA(contextElem);
                    }
                    if (contextElem.getAttribute('context-type') === 'linenumber') {
                        linenumber = Number.parseInt(dom_utilities_1.DOMUtilities.getPCDATA(contextElem), 10);
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
            return dom_utilities_1.DOMUtilities.getPCDATA(noteElem);
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
            if (util_1.isNullOrUndefined(noteElem)) {
                // create it
                noteElem = this.createNoteElementWithFromAttribute('description', description);
            }
            else {
                dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(noteElem, description);
            }
        }
        else {
            if (!util_1.isNullOrUndefined(noteElem)) {
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
            dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(noteElement, content);
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
            return dom_utilities_1.DOMUtilities.getPCDATA(noteElem);
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
            if (util_1.isNullOrUndefined(noteElem)) {
                // create it
                noteElem = this.createNoteElementWithFromAttribute('meaning', meaning);
            }
            else {
                dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(noteElem, meaning);
            }
        }
        else {
            if (!util_1.isNullOrUndefined(noteElem)) {
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
                text: dom_utilities_1.DOMUtilities.getPCDATA(elem)
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
        if (!util_1.isNullOrUndefined(newNotes)) {
            this.checkNotes(newNotes);
        }
        this.removeAllAdditionalNoteElements();
        if (!util_1.isNullOrUndefined(newNotes)) {
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
        let target = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            const source = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = dom_utilities_1.DOMUtilities.createFollowingSibling('target', source);
        }
        dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(target, translation);
        this.setTargetState(constants_1.STATE_TRANSLATED);
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
        const source = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'source');
        let target = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            target = dom_utilities_1.DOMUtilities.createFollowingSibling('target', source);
        }
        if (isDefaultLang || copyContent) {
            const sourceString = dom_utilities_1.DOMUtilities.getXMLContent(source);
            let newTargetString = sourceString;
            if (!this.isICUMessage(sourceString)) {
                newTargetString = this.translationMessagesFile().getNewTransUnitTargetPraefix()
                    + sourceString
                    + this.translationMessagesFile().getNewTransUnitTargetSuffix();
            }
            dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(target, newTargetString);
        }
        else {
            dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(target, '');
        }
        if (isDefaultLang) {
            target.setAttribute('state', this.mapStateToNativeState(constants_1.STATE_FINAL));
        }
        else {
            target.setAttribute('state', this.mapStateToNativeState(constants_1.STATE_NEW));
        }
    }
}
exports.XliffTransUnit = XliffTransUnit;
//# sourceMappingURL=xliff-trans-unit.js.map