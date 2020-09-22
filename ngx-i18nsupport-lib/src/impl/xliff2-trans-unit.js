"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Xliff2TransUnit = void 0;
const constants_1 = require("../api/constants");
const dom_utilities_1 = require("./dom-utilities");
const abstract_trans_unit_1 = require("./abstract-trans-unit");
const xliff2_message_parser_1 = require("./xliff2-message-parser");
const util_1 = require("util");
/**
 * Created by martin on 04.05.2017.
 * A Translation Unit in an XLIFF 2.0 file.
 */
class Xliff2TransUnit extends abstract_trans_unit_1.AbstractTransUnit {
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
            const segment = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'segment');
            source = segment.parentNode.appendChild(this._element.ownerDocument.createElement('source'));
        }
        dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(source, newContent);
    }
    /**
     * Return a parser used for normalized messages.
     */
    messageParser() {
        return new xliff2_message_parser_1.Xliff2MessageParser();
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
        return new xliff2_message_parser_1.Xliff2MessageParser().createNormalizedMessageFromXML(targetElement, this.sourceContentNormalized());
    }
    /**
     * State of the translation as stored in the xml.
     */
    nativeTargetState() {
        const segmentElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'segment');
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
        const segmentElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'segment');
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
            case constants_1.STATE_NEW:
                return 'initial';
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
            case 'initial':
                return constants_1.STATE_NEW;
            case 'translated':
                return constants_1.STATE_TRANSLATED;
            case 'reviewed': // same as translated
                return constants_1.STATE_TRANSLATED;
            case 'final':
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
        // Source is found as <file>:<line> in <note category="location">...
        const noteElements = this._element.getElementsByTagName('note');
        const sourceRefs = [];
        for (let i = 0; i < noteElements.length; i++) {
            const noteElem = noteElements.item(i);
            if (noteElem.getAttribute('category') === 'location') {
                const sourceAndPos = dom_utilities_1.DOMUtilities.getPCDATA(noteElem);
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
        let notesElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'notes');
        if (sourceRefs.length === 0 && !util_1.isNullOrUndefined(notesElement) && notesElement.childNodes.length === 0) {
            // remove empty notes element
            notesElement.parentNode.removeChild(notesElement);
            return;
        }
        if (util_1.isNullOrUndefined(notesElement)) {
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
        const noteElem = this.findNoteElementWithCategoryAttribute('description');
        if (description) {
            if (util_1.isNullOrUndefined(noteElem)) {
                // create it
                this.createNoteElementWithCategoryAttribute('description', description);
            }
            else {
                dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(noteElem, description);
            }
        }
        else {
            if (!util_1.isNullOrUndefined(noteElem)) {
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
        let notesElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'notes');
        if (util_1.isNullOrUndefined(notesElement)) {
            // create it
            notesElement = this._element.ownerDocument.createElement('notes');
            this._element.appendChild(notesElement);
        }
        const noteElement = this._element.ownerDocument.createElement('note');
        if (attrValue) {
            noteElement.setAttribute('category', attrValue);
        }
        if (content) {
            dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(noteElement, content);
        }
        notesElement.appendChild(noteElement);
        return noteElement;
    }
    removeNotesElementIfEmpty() {
        const notesElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'notes');
        if (notesElement) {
            const childNote = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'note');
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
            return dom_utilities_1.DOMUtilities.getPCDATA(noteElem);
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
            if (util_1.isNullOrUndefined(noteElem)) {
                // create it
                this.createNoteElementWithCategoryAttribute('meaning', meaning);
            }
            else {
                dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(noteElem, meaning);
            }
        }
        else {
            if (!util_1.isNullOrUndefined(noteElem)) {
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
     */
    setNotes(newNotes) {
        if (!util_1.isNullOrUndefined(newNotes)) {
            this.checkNotes(newNotes);
        }
        this.removeAllAdditionalNoteElements();
        if (!util_1.isNullOrUndefined(newNotes)) {
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
        let target = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'target');
        if (!target) {
            const source = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'source');
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
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
        const clone = new Xliff2TransUnit(element, this._id, targetFile);
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
            target = source.parentNode.appendChild(this._element.ownerDocument.createElement('target'));
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
        const segment = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._element, 'segment');
        if (segment) {
            if (isDefaultLang) {
                segment.setAttribute('state', this.mapStateToNativeState(constants_1.STATE_FINAL));
            }
            else {
                segment.setAttribute('state', this.mapStateToNativeState(constants_1.STATE_NEW));
            }
        }
    }
}
exports.Xliff2TransUnit = Xliff2TransUnit;
//# sourceMappingURL=xliff2-trans-unit.js.map