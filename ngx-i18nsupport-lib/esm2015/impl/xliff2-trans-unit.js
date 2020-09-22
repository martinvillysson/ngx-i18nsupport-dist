import { STATE_NEW, STATE_TRANSLATED, STATE_FINAL } from '../api/constants';
import { DOMUtilities } from './dom-utilities';
import { AbstractTransUnit } from './abstract-trans-unit';
import { Xliff2MessageParser } from './xliff2-message-parser';
import { isNullOrUndefined } from 'util';
/**
 * Created by martin on 04.05.2017.
 * A Translation Unit in an XLIFF 2.0 file.
 */
export class Xliff2TransUnit extends AbstractTransUnit {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYyLXRyYW5zLXVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3hsaWZmMi10cmFucy11bml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFLMUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRTdDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3hELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTVELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN2Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxpQkFBaUI7SUFFbEQsWUFBWSxRQUFpQixFQUFFLEdBQVcsRUFBRSx3QkFBa0Q7UUFDMUYsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sYUFBYTtRQUNoQixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyRixPQUFPLFlBQVksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksZ0JBQWdCLENBQUMsVUFBa0I7UUFDdEMsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULHNFQUFzRTtZQUN0RSxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsd0JBQXdCLENBQUMsSUFB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Q0FBQyxDQUFDO2FBQzFFO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBQ3hFO1NBQ0o7SUFDTCxDQUFDO0NBRUoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NUQVRFX05FVywgU1RBVEVfVFJBTlNMQVRFRCwgU1RBVEVfRklOQUx9IGZyb20gJy4uL2FwaS9jb25zdGFudHMnO1xyXG5pbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZX0gZnJvbSAnLi4vYXBpL2ktdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZSc7XHJcbmltcG9ydCB7SU5vcm1hbGl6ZWRNZXNzYWdlfSBmcm9tICcuLi9hcGkvaS1ub3JtYWxpemVkLW1lc3NhZ2UnO1xyXG5pbXBvcnQge0lUcmFuc1VuaXR9IGZyb20gJy4uL2FwaS9pLXRyYW5zLXVuaXQnO1xyXG5pbXBvcnQge0lOb3RlfSBmcm9tICcuLi9hcGkvaS1ub3RlJztcclxuaW1wb3J0IHtET01VdGlsaXRpZXN9IGZyb20gJy4vZG9tLXV0aWxpdGllcyc7XHJcbmltcG9ydCB7UGFyc2VkTWVzc2FnZX0gZnJvbSAnLi9wYXJzZWQtbWVzc2FnZSc7XHJcbmltcG9ydCB7QWJzdHJhY3RUcmFuc1VuaXR9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnMtdW5pdCc7XHJcbmltcG9ydCB7WGxpZmYyTWVzc2FnZVBhcnNlcn0gZnJvbSAnLi94bGlmZjItbWVzc2FnZS1wYXJzZXInO1xyXG5pbXBvcnQge0Fic3RyYWN0TWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9hYnN0cmFjdC1tZXNzYWdlLXBhcnNlcic7XHJcbmltcG9ydCB7aXNOdWxsT3JVbmRlZmluZWR9IGZyb20gJ3V0aWwnO1xyXG4vKipcclxuICogQ3JlYXRlZCBieSBtYXJ0aW4gb24gMDQuMDUuMjAxNy5cclxuICogQSBUcmFuc2xhdGlvbiBVbml0IGluIGFuIFhMSUZGIDIuMCBmaWxlLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBYbGlmZjJUcmFuc1VuaXQgZXh0ZW5kcyBBYnN0cmFjdFRyYW5zVW5pdCAgaW1wbGVtZW50cyBJVHJhbnNVbml0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfZWxlbWVudDogRWxlbWVudCwgX2lkOiBzdHJpbmcsIF90cmFuc2xhdGlvbk1lc3NhZ2VzRmlsZTogSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlKSB7XHJcbiAgICAgICAgc3VwZXIoX2VsZW1lbnQsIF9pZCwgX3RyYW5zbGF0aW9uTWVzc2FnZXNGaWxlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc291cmNlQ29udGVudCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzb3VyY2UnKTtcclxuICAgICAgICByZXR1cm4gRE9NVXRpbGl0aWVzLmdldFhNTENvbnRlbnQoc291cmNlRWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgbmV3IHNvdXJjZSBjb250ZW50IGluIHRoZSB0cmFuc3VuaXQuXHJcbiAgICAgKiBOb3JtYWxseSwgdGhpcyBpcyBkb25lIGJ5IG5nLWV4dHJhY3QuXHJcbiAgICAgKiBNZXRob2Qgb25seSBleGlzdHMgdG8gYWxsb3cgeGxpZmZtZXJnZSB0byBtZXJnZSBtaXNzaW5nIGNoYW5nZWQgc291cmNlIGNvbnRlbnQuXHJcbiAgICAgKiBAcGFyYW0gbmV3Q29udGVudCB0aGUgbmV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRTb3VyY2VDb250ZW50KG5ld0NvbnRlbnQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBzb3VyY2UgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzb3VyY2UnKTtcclxuICAgICAgICBpZiAoIXNvdXJjZSkge1xyXG4gICAgICAgICAgICAvLyBzaG91bGQgbm90IGhhcHBlbiwgdGhlcmUgYWx3YXlzIGhhcyB0byBiZSBhIHNvdXJjZSwgYnV0IHdobyBrbm93cy4uXHJcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzZWdtZW50Jyk7XHJcbiAgICAgICAgICAgIHNvdXJjZSA9IHNlZ21lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBET01VdGlsaXRpZXMucmVwbGFjZUNvbnRlbnRXaXRoWE1MQ29udGVudChzb3VyY2UsIG5ld0NvbnRlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgcGFyc2VyIHVzZWQgZm9yIG5vcm1hbGl6ZWQgbWVzc2FnZXMuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtZXNzYWdlUGFyc2VyKCk6IEFic3RyYWN0TWVzc2FnZVBhcnNlciB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBYbGlmZjJNZXNzYWdlUGFyc2VyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb3JpZ2luYWwgdGV4dCB2YWx1ZSwgdGhhdCBpcyB0byBiZSB0cmFuc2xhdGVkLCBhcyBub3JtYWxpemVkIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVTb3VyY2VDb250ZW50Tm9ybWFsaXplZCgpOiBQYXJzZWRNZXNzYWdlIHtcclxuICAgICAgICBjb25zdCBzb3VyY2VFbGVtZW50ID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9lbGVtZW50LCAnc291cmNlJyk7XHJcbiAgICAgICAgaWYgKHNvdXJjZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhcnNlcigpLmNyZWF0ZU5vcm1hbGl6ZWRNZXNzYWdlRnJvbVhNTChzb3VyY2VFbGVtZW50LCBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgdHJhbnNsYXRlZCB2YWx1ZSAoY29udGFpbmluZyBhbGwgbWFya3VwLCBkZXBlbmRzIG9uIHRoZSBjb25jcmV0ZSBmb3JtYXQgdXNlZCkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YXJnZXRDb250ZW50KCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3RhcmdldCcpO1xyXG4gICAgICAgIHJldHVybiBET01VdGlsaXRpZXMuZ2V0WE1MQ29udGVudCh0YXJnZXRFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSB0cmFuc2xhdGVkIHZhbHVlLCBidXQgYWxsIHBsYWNlaG9sZGVycyBhcmUgcmVwbGFjZWQgd2l0aCB7e259fSAoc3RhcnRpbmcgYXQgMClcclxuICAgICAqIGFuZCBhbGwgZW1iZWRkZWQgaHRtbCBpcyByZXBsYWNlZCBieSBkaXJlY3QgaHRtbCBtYXJrdXAuXHJcbiAgICAgKi9cclxuICAgIHRhcmdldENvbnRlbnROb3JtYWxpemVkKCk6IElOb3JtYWxpemVkTWVzc2FnZSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3RhcmdldCcpO1xyXG4gICAgICAgIHJldHVybiBuZXcgWGxpZmYyTWVzc2FnZVBhcnNlcigpLmNyZWF0ZU5vcm1hbGl6ZWRNZXNzYWdlRnJvbVhNTCh0YXJnZXRFbGVtZW50LCB0aGlzLnNvdXJjZUNvbnRlbnROb3JtYWxpemVkKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhdGUgb2YgdGhlIHRyYW5zbGF0aW9uIGFzIHN0b3JlZCBpbiB0aGUgeG1sLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbmF0aXZlVGFyZ2V0U3RhdGUoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBzZWdtZW50RWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3NlZ21lbnQnKTtcclxuICAgICAgICBpZiAoc2VnbWVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlZ21lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnc3RhdGUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgc3RhdGUgaW4geG1sLlxyXG4gICAgICogQHBhcmFtIG5hdGl2ZVN0YXRlIG5hdGl2ZVN0YXRlXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzZXROYXRpdmVUYXJnZXRTdGF0ZShuYXRpdmVTdGF0ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudEVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzZWdtZW50Jyk7XHJcbiAgICAgICAgaWYgKHNlZ21lbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHNlZ21lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnc3RhdGUnLCBuYXRpdmVTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwIGFuIGFic3RyYWN0IHN0YXRlIChuZXcsIHRyYW5zbGF0ZWQsIGZpbmFsKSB0byBhIGNvbmNyZXRlIHN0YXRlIHVzZWQgaW4gdGhlIHhtbC5cclxuICAgICAqIFJldHVybnMgdGhlIHN0YXRlIHRvIGJlIHVzZWQgaW4gdGhlIHhtbC5cclxuICAgICAqIEBwYXJhbSBzdGF0ZSBvbmUgb2YgQ29uc3RhbnRzLlNUQVRFLi4uXHJcbiAgICAgKiBAcmV0dXJucyBhIG5hdGl2ZSBzdGF0ZSAoZGVwZW5kcyBvbiBjb25jcmV0ZSBmb3JtYXQpXHJcbiAgICAgKiBAdGhyb3dzIGVycm9yLCBpZiBzdGF0ZSBpcyBpbnZhbGlkLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWFwU3RhdGVUb05hdGl2ZVN0YXRlKHN0YXRlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAoIHN0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgU1RBVEVfTkVXOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdpbml0aWFsJztcclxuICAgICAgICAgICAgY2FzZSBTVEFURV9UUkFOU0xBVEVEOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGVkJztcclxuICAgICAgICAgICAgY2FzZSBTVEFURV9GSU5BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnZmluYWwnO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIHN0YXRlICcgKyAgc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcCBhIG5hdGl2ZSBzdGF0ZSAoZm91bmQgaW4gdGhlIGRvY3VtZW50KSB0byBhbiBhYnN0cmFjdCBzdGF0ZSAobmV3LCB0cmFuc2xhdGVkLCBmaW5hbCkuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhYnN0cmFjdCBzdGF0ZS5cclxuICAgICAqIEBwYXJhbSBuYXRpdmVTdGF0ZSBuYXRpdmVTdGF0ZVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWFwTmF0aXZlU3RhdGVUb1N0YXRlKG5hdGl2ZVN0YXRlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAoIG5hdGl2ZVN0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2luaXRpYWwnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX05FVztcclxuICAgICAgICAgICAgY2FzZSAndHJhbnNsYXRlZCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfVFJBTlNMQVRFRDtcclxuICAgICAgICAgICAgY2FzZSAncmV2aWV3ZWQnOiAvLyBzYW1lIGFzIHRyYW5zbGF0ZWRcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9UUkFOU0xBVEVEO1xyXG4gICAgICAgICAgICBjYXNlICdmaW5hbCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfRklOQUw7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfTkVXO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgc291cmNlIGVsZW1lbnRzIGluIHRoZSB0cmFucyB1bml0LlxyXG4gICAgICogVGhlIHNvdXJjZSBlbGVtZW50IGlzIGEgcmVmZXJlbmNlIHRvIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZS5cclxuICAgICAqIEl0IGNvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSB0ZW1wbGF0ZSBmaWxlIGFuZCBhIGxpbmUgbnVtYmVyIHdpdGggdGhlIHBvc2l0aW9uIGluc2lkZSB0aGUgdGVtcGxhdGUuXHJcbiAgICAgKiBJdCBpcyBqdXN0IGEgaGVscCBmb3IgdHJhbnNsYXRvcnMgdG8gZmluZCB0aGUgY29udGV4dCBmb3IgdGhlIHRyYW5zbGF0aW9uLlxyXG4gICAgICogVGhpcyBpcyBzZXQgd2hlbiB1c2luZyBBbmd1bGFyIDQuMCBvciBncmVhdGVyLlxyXG4gICAgICogT3RoZXJ3aXNlIGl0IGp1c3QgcmV0dXJucyBhbiBlbXB0eSBhcnJheS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvdXJjZVJlZmVyZW5jZXMoKToge3NvdXJjZWZpbGU6IHN0cmluZywgbGluZW51bWJlcjogbnVtYmVyfVtdIHtcclxuICAgICAgICAvLyBTb3VyY2UgaXMgZm91bmQgYXMgPGZpbGU+OjxsaW5lPiBpbiA8bm90ZSBjYXRlZ29yeT1cImxvY2F0aW9uXCI+Li4uXHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnRzID0gdGhpcy5fZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbm90ZScpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZVJlZnM6IHsgc291cmNlZmlsZTogc3RyaW5nLCBsaW5lbnVtYmVyOiBudW1iZXIgfVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub3RlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgbm90ZUVsZW0gPSBub3RlRWxlbWVudHMuaXRlbShpKTtcclxuICAgICAgICAgICAgaWYgKG5vdGVFbGVtLmdldEF0dHJpYnV0ZSgnY2F0ZWdvcnknKSA9PT0gJ2xvY2F0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlQW5kUG9zOiBzdHJpbmcgPSBET01VdGlsaXRpZXMuZ2V0UENEQVRBKG5vdGVFbGVtKTtcclxuICAgICAgICAgICAgICAgIHNvdXJjZVJlZnMucHVzaCh0aGlzLnBhcnNlU291cmNlQW5kUG9zKHNvdXJjZUFuZFBvcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzb3VyY2VSZWZzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VzIHNvbWV0aGluZyBsaWtlICdjOlxceHh4OjcnIGFuZCByZXR1cm5zIHNvdXJjZSBhbmQgbGluZW51bWJlci5cclxuICAgICAqIEBwYXJhbSBzb3VyY2VBbmRQb3Mgc29tZXRoaW5nIGxpa2UgJ2M6XFx4eHg6NycsIGxhc3QgY29sb24gaXMgdGhlIHNlcGFyYXRvclxyXG4gICAgICogQHJldHVybiBzb3VyY2UgYW5kIGxpbmUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcGFyc2VTb3VyY2VBbmRQb3Moc291cmNlQW5kUG9zOiBzdHJpbmcpOiB7IHNvdXJjZWZpbGU6IHN0cmluZywgbGluZW51bWJlciB9IHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHNvdXJjZUFuZFBvcy5sYXN0SW5kZXhPZignOicpO1xyXG4gICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZWZpbGU6IHNvdXJjZUFuZFBvcyxcclxuICAgICAgICAgICAgICAgIGxpbmVudW1iZXI6IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc291cmNlZmlsZTogc291cmNlQW5kUG9zLnN1YnN0cmluZygwLCBpbmRleCksXHJcbiAgICAgICAgICAgICAgICBsaW5lbnVtYmVyOiB0aGlzLnBhcnNlTGluZU51bWJlcihzb3VyY2VBbmRQb3Muc3Vic3RyaW5nKGluZGV4ICsgMSkpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGFyc2VMaW5lTnVtYmVyKGxpbmVOdW1iZXJTdHJpbmc6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE51bWJlci5wYXJzZUludChsaW5lTnVtYmVyU3RyaW5nLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgc291cmNlIHJlZiBlbGVtZW50cyBpbiB0aGUgdHJhbnN1bml0LlxyXG4gICAgICogTm9ybWFsbHksIHRoaXMgaXMgZG9uZSBieSBuZy1leHRyYWN0LlxyXG4gICAgICogTWV0aG9kIG9ubHkgZXhpc3RzIHRvIGFsbG93IHhsaWZmbWVyZ2UgdG8gbWVyZ2UgbWlzc2luZyBzb3VyY2UgcmVmcy5cclxuICAgICAqIEBwYXJhbSBzb3VyY2VSZWZzIHRoZSBzb3VyY2VyZWZzIHRvIHNldC4gT2xkIG9uZXMgYXJlIHJlbW92ZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRTb3VyY2VSZWZlcmVuY2VzKHNvdXJjZVJlZnM6IHtzb3VyY2VmaWxlOiBzdHJpbmcsIGxpbmVudW1iZXI6IG51bWJlcn1bXSkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsU291cmNlUmVmZXJlbmNlcygpO1xyXG4gICAgICAgIGxldCBub3Rlc0VsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdub3RlcycpO1xyXG4gICAgICAgIGlmIChzb3VyY2VSZWZzLmxlbmd0aCA9PT0gMCAmJiAhaXNOdWxsT3JVbmRlZmluZWQobm90ZXNFbGVtZW50KSAmJiBub3Rlc0VsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGVtcHR5IG5vdGVzIGVsZW1lbnRcclxuICAgICAgICAgICAgbm90ZXNFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm90ZXNFbGVtZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQobm90ZXNFbGVtZW50KSkge1xyXG4gICAgICAgICAgICBub3Rlc0VsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbm90ZXMnKTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5pbnNlcnRCZWZvcmUobm90ZXNFbGVtZW50LCB0aGlzLl9lbGVtZW50LmNoaWxkTm9kZXMuaXRlbSgwKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvdXJjZVJlZnMuZm9yRWFjaCgocmVmKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdGUgPSB0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbm90ZScpO1xyXG4gICAgICAgICAgICBub3RlLnNldEF0dHJpYnV0ZSgnY2F0ZWdvcnknLCAnbG9jYXRpb24nKTtcclxuICAgICAgICAgICAgbm90ZS5hcHBlbmRDaGlsZCh0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocmVmLnNvdXJjZWZpbGUgKyAnOicgKyByZWYubGluZW51bWJlci50b1N0cmluZygxMCkpKTtcclxuICAgICAgICAgICAgbm90ZXNFbGVtZW50LmFwcGVuZENoaWxkKG5vdGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlQWxsU291cmNlUmVmZXJlbmNlcygpIHtcclxuICAgICAgICBjb25zdCBub3RlRWxlbWVudHMgPSB0aGlzLl9lbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdub3RlJyk7XHJcbiAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vdGVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBlbGVtID0gbm90ZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmIChlbGVtLmdldEF0dHJpYnV0ZSgnY2F0ZWdvcnknKSA9PT0gJ2xvY2F0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgdG9CZVJlbW92ZWQucHVzaChlbGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0b0JlUmVtb3ZlZC5mb3JFYWNoKChlbGVtKSA9PiB7ZWxlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW0pOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZXNjcmlwdGlvbiBzZXQgaW4gdGhlIHRlbXBsYXRlIGFzIHZhbHVlIG9mIHRoZSBpMThuLWF0dHJpYnV0ZS5cclxuICAgICAqIGUuZy4gaTE4bj1cIm15ZGVzY3JpcHRpb25cIi5cclxuICAgICAqIEluIHhsaWZmIDIuMCB0aGlzIGlzIHN0b3JlZCBhcyBhIG5vdGUgZWxlbWVudCB3aXRoIGF0dHJpYnV0ZSBjYXRlZ29yeT1cImRlc2NyaXB0aW9uXCIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG5vdGVFbGVtID0gdGhpcy5maW5kTm90ZUVsZW1lbnRXaXRoQ2F0ZWdvcnlBdHRyaWJ1dGUoJ2Rlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgaWYgKG5vdGVFbGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBET01VdGlsaXRpZXMuZ2V0UENEQVRBKG5vdGVFbGVtKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2UgZGVzY3JpcHRpb24gcHJvcGVydHkgb2YgdHJhbnMtdW5pdC5cclxuICAgICAqIEBwYXJhbSBkZXNjcmlwdGlvbiBkZXNjcmlwdGlvblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0RGVzY3JpcHRpb24oZGVzY3JpcHRpb246IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5vdGVFbGVtID0gdGhpcy5maW5kTm90ZUVsZW1lbnRXaXRoQ2F0ZWdvcnlBdHRyaWJ1dGUoJ2Rlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgaWYgKGRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChub3RlRWxlbSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBpdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVOb3RlRWxlbWVudFdpdGhDYXRlZ29yeUF0dHJpYnV0ZSgnZGVzY3JpcHRpb24nLCBkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBET01VdGlsaXRpZXMucmVwbGFjZUNvbnRlbnRXaXRoWE1MQ29udGVudChub3RlRWxlbSwgZGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChub3RlRWxlbSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBub2RlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKCdkZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBhIG5vdGUgZWxlbWVudCB3aXRoIGF0dHJpYnV0ZSBjYXRlZ29yeT0nPGF0dHJWYWx1ZT4nXHJcbiAgICAgKiBAcGFyYW0gYXR0clZhbHVlIHZhbHVlIG9mIGNhdGVnb3J5IGF0dHJpYnV0ZVxyXG4gICAgICogQHJldHVybiBlbGVtZW50IG9yIG51bGwgaXMgYWJzZW50XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZmluZE5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKGF0dHJWYWx1ZTogc3RyaW5nKTogRWxlbWVudCB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnRzID0gdGhpcy5fZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbm90ZScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm90ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdGVFbGVtID0gbm90ZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmIChub3RlRWxlbS5nZXRBdHRyaWJ1dGUoJ2NhdGVnb3J5JykgPT09IGF0dHJWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vdGVFbGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGFsbCBub3RlIGVsZW1lbnRzIHdoZXJlIGZyb20gYXR0cmlidXRlIGlzIG5vdCBkZXNjcmlwdGlvbiBvciBtZWFuaW5nXHJcbiAgICAgKiBAcmV0dXJuIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZmluZEFsbEFkZGl0aW9uYWxOb3RlRWxlbWVudHMoKTogRWxlbWVudFtdIHtcclxuICAgICAgICBjb25zdCBub3RlRWxlbWVudHMgPSB0aGlzLl9lbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdub3RlJyk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBFbGVtZW50W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vdGVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBub3RlRWxlbSA9IG5vdGVFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBjb25zdCBmcm9tQXR0cmlidXRlID0gbm90ZUVsZW0uZ2V0QXR0cmlidXRlKCdjYXRlZ29yeScpO1xyXG4gICAgICAgICAgICBpZiAoZnJvbUF0dHJpYnV0ZSAhPT0gJ2Rlc2NyaXB0aW9uJyAmJiBmcm9tQXR0cmlidXRlICE9PSAnbWVhbmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vdGVFbGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IG5vdGUgZWxlbWVudCB3aXRoIGF0dHJpYnV0ZSBmcm9tPSc8YXR0clZhbHVlPidcclxuICAgICAqIEBwYXJhbSBhdHRyVmFsdWUgY2F0ZWdvcnkgYXR0cmlidXRlIHZhbHVlXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBjb250ZW50IG9mIG5vdGUgZWxlbWVudFxyXG4gICAgICogQHJldHVybiB0aGUgbmV3IGNyZWF0ZWQgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNyZWF0ZU5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKGF0dHJWYWx1ZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBFbGVtZW50IHtcclxuICAgICAgICBsZXQgbm90ZXNFbGVtZW50ID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9lbGVtZW50LCAnbm90ZXMnKTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQobm90ZXNFbGVtZW50KSkge1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgaXRcclxuICAgICAgICAgICAgbm90ZXNFbGVtZW50ID0gdGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ25vdGVzJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQobm90ZXNFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbm90ZScpO1xyXG4gICAgICAgIGlmIChhdHRyVmFsdWUpIHtcclxuICAgICAgICAgICAgbm90ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdjYXRlZ29yeScsIGF0dHJWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgIERPTVV0aWxpdGllcy5yZXBsYWNlQ29udGVudFdpdGhYTUxDb250ZW50KG5vdGVFbGVtZW50LCBjb250ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90ZXNFbGVtZW50LmFwcGVuZENoaWxkKG5vdGVFbGVtZW50KTtcclxuICAgICAgICByZXR1cm4gbm90ZUVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVOb3Rlc0VsZW1lbnRJZkVtcHR5KCkge1xyXG4gICAgICAgIGNvbnN0IG5vdGVzRWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ25vdGVzJyk7XHJcbiAgICAgICAgaWYgKG5vdGVzRWxlbWVudCkge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZE5vdGUgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdub3RlJyk7XHJcbiAgICAgICAgICAgIGlmICghY2hpbGROb3RlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgbm90ZXMgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgbm90ZXNFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm90ZXNFbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBub3RlIGVsZW1lbnQgd2l0aCBhdHRyaWJ1dGUgZnJvbT0nPGF0dHJWYWx1ZT4nXHJcbiAgICAgKiBAcGFyYW0gYXR0clZhbHVlIGF0dHJWYWx1ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlbW92ZU5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKGF0dHJWYWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnQgPSB0aGlzLmZpbmROb3RlRWxlbWVudFdpdGhDYXRlZ29yeUF0dHJpYnV0ZShhdHRyVmFsdWUpO1xyXG4gICAgICAgIGlmIChub3RlRWxlbWVudCkge1xyXG4gICAgICAgICAgICBub3RlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vdGVFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZW1vdmVOb3Rlc0VsZW1lbnRJZkVtcHR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgYWxsIG5vdGUgZWxlbWVudHMgd2hlcmUgYXR0cmlidXRlIFwiZnJvbVwiIGlzIG5vdCBkZXNjcmlwdGlvbiBvciBtZWFuaW5nLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlbW92ZUFsbEFkZGl0aW9uYWxOb3RlRWxlbWVudHMoKSB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnRzID0gdGhpcy5maW5kQWxsQWRkaXRpb25hbE5vdGVFbGVtZW50cygpO1xyXG4gICAgICAgIG5vdGVFbGVtZW50cy5mb3JFYWNoKChub3RlRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICBub3RlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vdGVFbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJlbW92ZU5vdGVzRWxlbWVudElmRW1wdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtZWFuaW5nIChpbnRlbnQpIHNldCBpbiB0aGUgdGVtcGxhdGUgYXMgdmFsdWUgb2YgdGhlIGkxOG4tYXR0cmlidXRlLlxyXG4gICAgICogVGhpcyBpcyB0aGUgcGFydCBpbiBmcm9udCBvZiB0aGUgfCBzeW1ib2wuXHJcbiAgICAgKiBlLmcuIGkxOG49XCJtZWFuaW5nfG15ZGVzY3JpcHRpb25cIi5cclxuICAgICAqIEluIHhsaWZmIDIuMCB0aGlzIGlzIHN0b3JlZCBhcyBhIG5vdGUgZWxlbWVudCB3aXRoIGF0dHJpYnV0ZSBjYXRlZ29yeT1cIm1lYW5pbmdcIi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG1lYW5pbmcoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBub3RlRWxlbSA9IHRoaXMuZmluZE5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKCdtZWFuaW5nJyk7XHJcbiAgICAgICAgaWYgKG5vdGVFbGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBET01VdGlsaXRpZXMuZ2V0UENEQVRBKG5vdGVFbGVtKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2UgbWVhbmluZyBwcm9wZXJ0eSBvZiB0cmFucy11bml0LlxyXG4gICAgICogQHBhcmFtIG1lYW5pbmcgbWVhbmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWVhbmluZyhtZWFuaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBub3RlRWxlbSA9IHRoaXMuZmluZE5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKCdtZWFuaW5nJyk7XHJcbiAgICAgICAgaWYgKG1lYW5pbmcpIHtcclxuICAgICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKG5vdGVFbGVtKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGl0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU5vdGVFbGVtZW50V2l0aENhdGVnb3J5QXR0cmlidXRlKCdtZWFuaW5nJywgbWVhbmluZyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBET01VdGlsaXRpZXMucmVwbGFjZUNvbnRlbnRXaXRoWE1MQ29udGVudChub3RlRWxlbSwgbWVhbmluZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKG5vdGVFbGVtKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIG5vZGVcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTm90ZUVsZW1lbnRXaXRoQ2F0ZWdvcnlBdHRyaWJ1dGUoJ21lYW5pbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbGwgbm90ZXMgb2YgdGhlIHRyYW5zLXVuaXQuXHJcbiAgICAgKiBOb3RlcyBhcmUgcmVtYXJrcyBtYWRlIGJ5IGEgdHJhbnNsYXRvci5cclxuICAgICAqIChkZXNjcmlwdGlvbiBhbmQgbWVhbmluZyBhcmUgbm90IGluY2x1ZGVkIGhlcmUhKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbm90ZXMoKTogSU5vdGVbXSB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbXRzOiBFbGVtZW50W10gPSB0aGlzLmZpbmRBbGxBZGRpdGlvbmFsTm90ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgcmV0dXJuIG5vdGVFbGVtZW10cy5tYXAoZWxlbSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmcm9tOiBlbGVtLmdldEF0dHJpYnV0ZSgnY2F0ZWdvcnknKSxcclxuICAgICAgICAgICAgICAgIHRleHQ6IERPTVV0aWxpdGllcy5nZXRQQ0RBVEEoZWxlbSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlc3QsIHdldGhlciBzZXR0aW5nIG9mIG5vdGVzIGlzIHN1cHBvcnRlZC5cclxuICAgICAqIElmIG5vdCwgc2V0Tm90ZXMgd2lsbCBkbyBub3RoaW5nLlxyXG4gICAgICogeHRiIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgYWxsIG90aGVyIGZvcm1hdHMgZG8uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdXBwb3J0c1NldE5vdGVzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIG5vdGVzIHRvIHRyYW5zIHVuaXQuXHJcbiAgICAgKiBAcGFyYW0gbmV3Tm90ZXMgdGhlIG5vdGVzIHRvIGFkZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldE5vdGVzKG5ld05vdGVzOiBJTm90ZVtdKSB7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChuZXdOb3RlcykpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja05vdGVzKG5ld05vdGVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBbGxBZGRpdGlvbmFsTm90ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChuZXdOb3RlcykpIHtcclxuICAgICAgICAgICAgbmV3Tm90ZXMuZm9yRWFjaCgobm90ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVOb3RlRWxlbWVudFdpdGhDYXRlZ29yeUF0dHJpYnV0ZShub3RlLmZyb20sIG5vdGUudGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdHJhbnNsYXRpb24gdG8gYSBnaXZlbiBzdHJpbmcgKGluY2x1ZGluZyBtYXJrdXApLlxyXG4gICAgICogQHBhcmFtIHRyYW5zbGF0aW9uIHRyYW5zbGF0aW9uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCB0cmFuc2xhdGVOYXRpdmUodHJhbnNsYXRpb246IHN0cmluZykge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICd0YXJnZXQnKTtcclxuICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzb3VyY2UnKTtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gc291cmNlLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhcmdldCcpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRE9NVXRpbGl0aWVzLnJlcGxhY2VDb250ZW50V2l0aFhNTENvbnRlbnQodGFyZ2V0LCA8c3RyaW5nPiB0cmFuc2xhdGlvbik7XHJcbiAgICAgICAgdGhpcy5zZXRUYXJnZXRTdGF0ZShTVEFURV9UUkFOU0xBVEVEKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvcHkgc291cmNlIHRvIHRhcmdldCB0byB1c2UgaXQgYXMgZHVtbXkgdHJhbnNsYXRpb24uXHJcbiAgICAgKiBSZXR1cm5zIGEgY2hhbmdlZCBjb3B5IG9mIHRoaXMgdHJhbnMgdW5pdC5cclxuICAgICAqIHJlY2VpdmVyIGlzIG5vdCBjaGFuZ2VkLlxyXG4gICAgICogKGludGVybmFsIHVzYWdlIG9ubHksIGEgY2xpZW50IHNob3VsZCBjYWxsIGltcG9ydE5ld1RyYW5zVW5pdCBvbiBJVHJhbnNsYXRpb25NZXNzYWdlRmlsZSlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNsb25lV2l0aFNvdXJjZUFzVGFyZ2V0KGlzRGVmYXVsdExhbmc6IGJvb2xlYW4sIGNvcHlDb250ZW50OiBib29sZWFuLCB0YXJnZXRGaWxlOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUpOiBBYnN0cmFjdFRyYW5zVW5pdCB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IDxFbGVtZW50PiB0aGlzLl9lbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICBjb25zdCBjbG9uZSA9IG5ldyBYbGlmZjJUcmFuc1VuaXQoZWxlbWVudCwgdGhpcy5faWQsIHRhcmdldEZpbGUpO1xyXG4gICAgICAgIGNsb25lLnVzZVNvdXJjZUFzVGFyZ2V0KGlzRGVmYXVsdExhbmcsIGNvcHlDb250ZW50KTtcclxuICAgICAgICByZXR1cm4gY2xvbmU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb3B5IHNvdXJjZSB0byB0YXJnZXQgdG8gdXNlIGl0IGFzIGR1bW15IHRyYW5zbGF0aW9uLlxyXG4gICAgICogKGludGVybmFsIHVzYWdlIG9ubHksIGEgY2xpZW50IHNob3VsZCBjYWxsIGNyZWF0ZVRyYW5zbGF0aW9uRmlsZUZvckxhbmcgb24gSVRyYW5zbGF0aW9uTWVzc2FnZUZpbGUpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB1c2VTb3VyY2VBc1RhcmdldChpc0RlZmF1bHRMYW5nOiBib29sZWFuLCBjb3B5Q29udGVudDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3NvdXJjZScpO1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICd0YXJnZXQnKTtcclxuICAgICAgICBpZiAoIXRhcmdldCkge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBzb3VyY2UucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFyZ2V0JykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNEZWZhdWx0TGFuZyB8fCBjb3B5Q29udGVudCkge1xyXG4gICAgICAgICAgICBjb25zdCBzb3VyY2VTdHJpbmcgPSBET01VdGlsaXRpZXMuZ2V0WE1MQ29udGVudChzb3VyY2UpO1xyXG4gICAgICAgICAgICBsZXQgbmV3VGFyZ2V0U3RyaW5nID0gc291cmNlU3RyaW5nO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNJQ1VNZXNzYWdlKHNvdXJjZVN0cmluZykpIHtcclxuICAgICAgICAgICAgICAgIG5ld1RhcmdldFN0cmluZyA9IHRoaXMudHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUoKS5nZXROZXdUcmFuc1VuaXRUYXJnZXRQcmFlZml4KClcclxuICAgICAgICAgICAgICAgICAgICArIHNvdXJjZVN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICsgdGhpcy50cmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSgpLmdldE5ld1RyYW5zVW5pdFRhcmdldFN1ZmZpeCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIERPTVV0aWxpdGllcy5yZXBsYWNlQ29udGVudFdpdGhYTUxDb250ZW50KHRhcmdldCwgbmV3VGFyZ2V0U3RyaW5nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBET01VdGlsaXRpZXMucmVwbGFjZUNvbnRlbnRXaXRoWE1MQ29udGVudCh0YXJnZXQsICcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3NlZ21lbnQnKTtcclxuICAgICAgICBpZiAoc2VnbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoaXNEZWZhdWx0TGFuZykge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudC5zZXRBdHRyaWJ1dGUoJ3N0YXRlJywgdGhpcy5tYXBTdGF0ZVRvTmF0aXZlU3RhdGUoU1RBVEVfRklOQUwpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQuc2V0QXR0cmlidXRlKCdzdGF0ZScsIHRoaXMubWFwU3RhdGVUb05hdGl2ZVN0YXRlKFNUQVRFX05FVykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=