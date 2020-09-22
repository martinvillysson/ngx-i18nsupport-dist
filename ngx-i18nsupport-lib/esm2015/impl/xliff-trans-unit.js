import { STATE_NEW, STATE_TRANSLATED, STATE_FINAL } from '../api/constants';
import { DOMUtilities } from './dom-utilities';
import { AbstractTransUnit } from './abstract-trans-unit';
import { XliffMessageParser } from './xliff-message-parser';
import { isNullOrUndefined } from 'util';
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XLIFF 1.2 file.
 */
export class XliffTransUnit extends AbstractTransUnit {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGxpZmYtdHJhbnMtdW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1pMThuc3VwcG9ydC1saWIvc3JjL2ltcGwveGxpZmYtdHJhbnMtdW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBSzFFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUcxRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDdkM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGNBQWUsU0FBUSxpQkFBaUI7SUFFakQsWUFBWSxRQUFpQixFQUFFLEdBQVcsRUFBRSx3QkFBa0Q7UUFDMUYsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sYUFBYTtRQUNoQixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyRixPQUFPLFlBQVksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksZ0JBQWdCLENBQUMsVUFBa0I7UUFDdEMsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULHNFQUFzRTtZQUN0RSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFB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RTtzQkFDekUsWUFBWTtzQkFDWixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO2FBQ3RFO1lBQ0QsWUFBWSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztTQUN0RTthQUFNO1lBQ0gsWUFBWSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN6RDtRQUNELElBQUksYUFBYSxFQUFFO1lBQ2YsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDekU7YUFBTTtZQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0wsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTVEFURV9ORVcsIFNUQVRFX1RSQU5TTEFURUQsIFNUQVRFX0ZJTkFMfSBmcm9tICcuLi9hcGkvY29uc3RhbnRzJztcclxuaW1wb3J0IHtJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGV9IGZyb20gJy4uL2FwaS9pLXRyYW5zbGF0aW9uLW1lc3NhZ2VzLWZpbGUnO1xyXG5pbXBvcnQge0lOb3JtYWxpemVkTWVzc2FnZX0gZnJvbSAnLi4vYXBpL2ktbm9ybWFsaXplZC1tZXNzYWdlJztcclxuaW1wb3J0IHtJVHJhbnNVbml0fSBmcm9tICcuLi9hcGkvaS10cmFucy11bml0JztcclxuaW1wb3J0IHtJTm90ZX0gZnJvbSAnLi4vYXBpL2ktbm90ZSc7XHJcbmltcG9ydCB7RE9NVXRpbGl0aWVzfSBmcm9tICcuL2RvbS11dGlsaXRpZXMnO1xyXG5pbXBvcnQge0Fic3RyYWN0VHJhbnNVbml0fSBmcm9tICcuL2Fic3RyYWN0LXRyYW5zLXVuaXQnO1xyXG5pbXBvcnQge1hsaWZmTWVzc2FnZVBhcnNlcn0gZnJvbSAnLi94bGlmZi1tZXNzYWdlLXBhcnNlcic7XHJcbmltcG9ydCB7UGFyc2VkTWVzc2FnZX0gZnJvbSAnLi9wYXJzZWQtbWVzc2FnZSc7XHJcbmltcG9ydCB7QWJzdHJhY3RNZXNzYWdlUGFyc2VyfSBmcm9tICcuL2Fic3RyYWN0LW1lc3NhZ2UtcGFyc2VyJztcclxuaW1wb3J0IHtpc051bGxPclVuZGVmaW5lZH0gZnJvbSAndXRpbCc7XHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAwMS4wNS4yMDE3LlxyXG4gKiBBIFRyYW5zbGF0aW9uIFVuaXQgaW4gYW4gWExJRkYgMS4yIGZpbGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFhsaWZmVHJhbnNVbml0IGV4dGVuZHMgQWJzdHJhY3RUcmFuc1VuaXQgaW1wbGVtZW50cyBJVHJhbnNVbml0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfZWxlbWVudDogRWxlbWVudCwgX2lkOiBzdHJpbmcsIF90cmFuc2xhdGlvbk1lc3NhZ2VzRmlsZTogSVRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlKSB7XHJcbiAgICAgICAgc3VwZXIoX2VsZW1lbnQsIF9pZCwgX3RyYW5zbGF0aW9uTWVzc2FnZXNGaWxlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc291cmNlQ29udGVudCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzb3VyY2UnKTtcclxuICAgICAgICByZXR1cm4gRE9NVXRpbGl0aWVzLmdldFhNTENvbnRlbnQoc291cmNlRWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgbmV3IHNvdXJjZSBjb250ZW50IGluIHRoZSB0cmFuc3VuaXQuXHJcbiAgICAgKiBOb3JtYWxseSwgdGhpcyBpcyBkb25lIGJ5IG5nLWV4dHJhY3QuXHJcbiAgICAgKiBNZXRob2Qgb25seSBleGlzdHMgdG8gYWxsb3cgeGxpZmZtZXJnZSB0byBtZXJnZSBtaXNzaW5nIGNoYW5nZWQgc291cmNlIGNvbnRlbnQuXHJcbiAgICAgKiBAcGFyYW0gbmV3Q29udGVudCB0aGUgbmV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRTb3VyY2VDb250ZW50KG5ld0NvbnRlbnQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBzb3VyY2UgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzb3VyY2UnKTtcclxuICAgICAgICBpZiAoIXNvdXJjZSkge1xyXG4gICAgICAgICAgICAvLyBzaG91bGQgbm90IGhhcHBlbiwgdGhlcmUgYWx3YXlzIGhhcyB0byBiZSBhIHNvdXJjZSwgYnV0IHdobyBrbm93cy4uXHJcbiAgICAgICAgICAgIHNvdXJjZSA9IHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRE9NVXRpbGl0aWVzLnJlcGxhY2VDb250ZW50V2l0aFhNTENvbnRlbnQoc291cmNlLCBuZXdDb250ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIHBhcnNlciB1c2VkIGZvciBub3JtYWxpemVkIG1lc3NhZ2VzLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWVzc2FnZVBhcnNlcigpOiBBYnN0cmFjdE1lc3NhZ2VQYXJzZXIge1xyXG4gICAgICAgIHJldHVybiBuZXcgWGxpZmZNZXNzYWdlUGFyc2VyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb3JpZ2luYWwgdGV4dCB2YWx1ZSwgdGhhdCBpcyB0byBiZSB0cmFuc2xhdGVkLCBhcyBub3JtYWxpemVkIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVTb3VyY2VDb250ZW50Tm9ybWFsaXplZCgpOiBQYXJzZWRNZXNzYWdlIHtcclxuICAgICAgICBjb25zdCBzb3VyY2VFbGVtZW50ID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9lbGVtZW50LCAnc291cmNlJyk7XHJcbiAgICAgICAgaWYgKHNvdXJjZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhcnNlcigpLmNyZWF0ZU5vcm1hbGl6ZWRNZXNzYWdlRnJvbVhNTChzb3VyY2VFbGVtZW50LCBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgdHJhbnNsYXRlZCB2YWx1ZSAoY29udGFpbmluZyBhbGwgbWFya3VwLCBkZXBlbmRzIG9uIHRoZSBjb25jcmV0ZSBmb3JtYXQgdXNlZCkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0YXJnZXRDb250ZW50KCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3RhcmdldCcpO1xyXG4gICAgICAgIHJldHVybiBET01VdGlsaXRpZXMuZ2V0WE1MQ29udGVudCh0YXJnZXRFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSB0cmFuc2xhdGVkIHZhbHVlLCBidXQgYWxsIHBsYWNlaG9sZGVycyBhcmUgcmVwbGFjZWQgd2l0aCB7e259fSAoc3RhcnRpbmcgYXQgMClcclxuICAgICAqIGFuZCBhbGwgZW1iZWRkZWQgaHRtbCBpcyByZXBsYWNlZCBieSBkaXJlY3QgaHRtbCBtYXJrdXAuXHJcbiAgICAgKi9cclxuICAgIHRhcmdldENvbnRlbnROb3JtYWxpemVkKCk6IElOb3JtYWxpemVkTWVzc2FnZSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IERPTVV0aWxpdGllcy5nZXRGaXJzdEVsZW1lbnRCeVRhZ05hbWUodGhpcy5fZWxlbWVudCwgJ3RhcmdldCcpO1xyXG4gICAgICAgIHJldHVybiBuZXcgWGxpZmZNZXNzYWdlUGFyc2VyKCkuY3JlYXRlTm9ybWFsaXplZE1lc3NhZ2VGcm9tWE1MKHRhcmdldEVsZW1lbnQsIHRoaXMuc291cmNlQ29udGVudE5vcm1hbGl6ZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0ZSBvZiB0aGUgdHJhbnNsYXRpb24gYXMgc3RvcmVkIGluIHRoZSB4bWwuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBuYXRpdmVUYXJnZXRTdGF0ZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICd0YXJnZXQnKTtcclxuICAgICAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3N0YXRlJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IHN0YXRlIGluIHhtbC5cclxuICAgICAqIEBwYXJhbSBuYXRpdmVTdGF0ZSBuYXRpdmVTdGF0ZVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2V0TmF0aXZlVGFyZ2V0U3RhdGUobmF0aXZlU3RhdGU6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICd0YXJnZXQnKTtcclxuICAgICAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xyXG4gICAgICAgICAgICB0YXJnZXRFbGVtZW50LnNldEF0dHJpYnV0ZSgnc3RhdGUnLCBuYXRpdmVTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwIGFuIGFic3RyYWN0IHN0YXRlIChuZXcsIHRyYW5zbGF0ZWQsIGZpbmFsKSB0byBhIGNvbmNyZXRlIHN0YXRlIHVzZWQgaW4gdGhlIHhtbC5cclxuICAgICAqIFJldHVybnMgdGhlIHN0YXRlIHRvIGJlIHVzZWQgaW4gdGhlIHhtbC5cclxuICAgICAqIEBwYXJhbSBzdGF0ZSBvbmUgb2YgQ29uc3RhbnRzLlNUQVRFLi4uXHJcbiAgICAgKiBAcmV0dXJucyBhIG5hdGl2ZSBzdGF0ZSAoZGVwZW5kcyBvbiBjb25jcmV0ZSBmb3JtYXQpXHJcbiAgICAgKiBAdGhyb3dzIGVycm9yLCBpZiBzdGF0ZSBpcyBpbnZhbGlkLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWFwU3RhdGVUb05hdGl2ZVN0YXRlKHN0YXRlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAoIHN0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgU1RBVEVfTkVXOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICduZXcnO1xyXG4gICAgICAgICAgICBjYXNlIFNUQVRFX1RSQU5TTEFURUQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZWQnO1xyXG4gICAgICAgICAgICBjYXNlIFNUQVRFX0ZJTkFMOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdmaW5hbCc7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gc3RhdGUgJyArICBzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwIGEgbmF0aXZlIHN0YXRlIChmb3VuZCBpbiB0aGUgZG9jdW1lbnQpIHRvIGFuIGFic3RyYWN0IHN0YXRlIChuZXcsIHRyYW5zbGF0ZWQsIGZpbmFsKS5cclxuICAgICAqIFJldHVybnMgdGhlIGFic3RyYWN0IHN0YXRlLlxyXG4gICAgICogQHBhcmFtIG5hdGl2ZVN0YXRlIG5hdGl2ZVN0YXRlXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtYXBOYXRpdmVTdGF0ZVRvU3RhdGUobmF0aXZlU3RhdGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoICggbmF0aXZlU3RhdGUpIHtcclxuICAgICAgICAgICAgY2FzZSAnbmV3JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9ORVc7XHJcbiAgICAgICAgICAgIGNhc2UgJ25lZWRzLXRyYW5zbGF0aW9uJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9ORVc7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RyYW5zbGF0ZWQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX1RSQU5TTEFURUQ7XHJcbiAgICAgICAgICAgIGNhc2UgJ25lZWRzLWFkYXB0YXRpb24nOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX1RSQU5TTEFURUQ7XHJcbiAgICAgICAgICAgIGNhc2UgJ25lZWRzLWwxMG4nOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX1RSQU5TTEFURUQ7XHJcbiAgICAgICAgICAgIGNhc2UgJ25lZWRzLXJldmlldy1hZGFwdGF0aW9uJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9UUkFOU0xBVEVEO1xyXG4gICAgICAgICAgICBjYXNlICduZWVkcy1yZXZpZXctbDEwbic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfVFJBTlNMQVRFRDtcclxuICAgICAgICAgICAgY2FzZSAnbmVlZHMtcmV2aWV3LXRyYW5zbGF0aW9uJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9UUkFOU0xBVEVEO1xyXG4gICAgICAgICAgICBjYXNlICdmaW5hbCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfRklOQUw7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NpZ25lZC1vZmYnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX0ZJTkFMO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX05FVztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGwgdGhlIHNvdXJjZSBlbGVtZW50cyBpbiB0aGUgdHJhbnMgdW5pdC5cclxuICAgICAqIFRoZSBzb3VyY2UgZWxlbWVudCBpcyBhIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgdGVtcGxhdGUuXHJcbiAgICAgKiBJdCBjb250YWlucyB0aGUgbmFtZSBvZiB0aGUgdGVtcGxhdGUgZmlsZSBhbmQgYSBsaW5lIG51bWJlciB3aXRoIHRoZSBwb3NpdGlvbiBpbnNpZGUgdGhlIHRlbXBsYXRlLlxyXG4gICAgICogSXQgaXMganVzdCBhIGhlbHAgZm9yIHRyYW5zbGF0b3JzIHRvIGZpbmQgdGhlIGNvbnRleHQgZm9yIHRoZSB0cmFuc2xhdGlvbi5cclxuICAgICAqIFRoaXMgaXMgc2V0IHdoZW4gdXNpbmcgQW5ndWxhciA0LjAgb3IgZ3JlYXRlci5cclxuICAgICAqIE90aGVyd2lzZSBpdCBqdXN0IHJldHVybnMgYW4gZW1wdHkgYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzb3VyY2VSZWZlcmVuY2VzKCk6IHtzb3VyY2VmaWxlOiBzdHJpbmcsIGxpbmVudW1iZXI6IG51bWJlcn1bXSB7XHJcbiAgICAgICAgY29uc3Qgc291cmNlRWxlbWVudHMgPSB0aGlzLl9lbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjb250ZXh0LWdyb3VwJyk7XHJcbiAgICAgICAgY29uc3Qgc291cmNlUmVmczogeyBzb3VyY2VmaWxlOiBzdHJpbmcsIGxpbmVudW1iZXI6IG51bWJlciB9W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW0gPSBzb3VyY2VFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBpZiAoZWxlbS5nZXRBdHRyaWJ1dGUoJ3B1cnBvc2UnKSA9PT0gJ2xvY2F0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGV4dEVsZW1lbnRzID0gZWxlbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY29udGV4dCcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZWZpbGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjb250ZXh0RWxlbWVudHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0RWxlbSA9IGNvbnRleHRFbGVtZW50cy5pdGVtKGopO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0RWxlbS5nZXRBdHRyaWJ1dGUoJ2NvbnRleHQtdHlwZScpID09PSAnc291cmNlZmlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlZmlsZSA9IERPTVV0aWxpdGllcy5nZXRQQ0RBVEEoY29udGV4dEVsZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dEVsZW0uZ2V0QXR0cmlidXRlKCdjb250ZXh0LXR5cGUnKSA9PT0gJ2xpbmVudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQoRE9NVXRpbGl0aWVzLmdldFBDREFUQShjb250ZXh0RWxlbSksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzb3VyY2VSZWZzLnB1c2goe3NvdXJjZWZpbGU6IHNvdXJjZWZpbGUsIGxpbmVudW1iZXI6IGxpbmVudW1iZXJ9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc291cmNlUmVmcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzb3VyY2UgcmVmIGVsZW1lbnRzIGluIHRoZSB0cmFuc3VuaXQuXHJcbiAgICAgKiBOb3JtYWxseSwgdGhpcyBpcyBkb25lIGJ5IG5nLWV4dHJhY3QuXHJcbiAgICAgKiBNZXRob2Qgb25seSBleGlzdHMgdG8gYWxsb3cgeGxpZmZtZXJnZSB0byBtZXJnZSBtaXNzaW5nIHNvdXJjZSByZWZzLlxyXG4gICAgICogQHBhcmFtIHNvdXJjZVJlZnMgdGhlIHNvdXJjZXJlZnMgdG8gc2V0LiBPbGQgb25lcyBhcmUgcmVtb3ZlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFNvdXJjZVJlZmVyZW5jZXMoc291cmNlUmVmczoge3NvdXJjZWZpbGU6IHN0cmluZywgbGluZW51bWJlcjogbnVtYmVyfVtdKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBbGxTb3VyY2VSZWZlcmVuY2VzKCk7XHJcbiAgICAgICAgc291cmNlUmVmcy5mb3JFYWNoKChyZWYpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY29udGV4dEdyb3VwID0gdGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvbnRleHQtZ3JvdXAnKTtcclxuICAgICAgICAgICAgY29udGV4dEdyb3VwLnNldEF0dHJpYnV0ZSgncHVycG9zZScsICdsb2NhdGlvbicpO1xyXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0U291cmNlID0gdGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvbnRleHQnKTtcclxuICAgICAgICAgICAgY29udGV4dFNvdXJjZS5zZXRBdHRyaWJ1dGUoJ2NvbnRleHQtdHlwZScsICdzb3VyY2VmaWxlJyk7XHJcbiAgICAgICAgICAgIGNvbnRleHRTb3VyY2UuYXBwZW5kQ2hpbGQodGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHJlZi5zb3VyY2VmaWxlKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHRMaW5lID0gdGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvbnRleHQnKTtcclxuICAgICAgICAgICAgY29udGV4dExpbmUuc2V0QXR0cmlidXRlKCdjb250ZXh0LXR5cGUnLCAnbGluZW51bWJlcicpO1xyXG4gICAgICAgICAgICBjb250ZXh0TGluZS5hcHBlbmRDaGlsZCh0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocmVmLmxpbmVudW1iZXIudG9TdHJpbmcoMTApKSk7XHJcbiAgICAgICAgICAgIGNvbnRleHRHcm91cC5hcHBlbmRDaGlsZChjb250ZXh0U291cmNlKTtcclxuICAgICAgICAgICAgY29udGV4dEdyb3VwLmFwcGVuZENoaWxkKGNvbnRleHRMaW5lKTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChjb250ZXh0R3JvdXApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlQWxsU291cmNlUmVmZXJlbmNlcygpIHtcclxuICAgICAgICBjb25zdCBzb3VyY2VFbGVtZW50cyA9IHRoaXMuX2VsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NvbnRleHQtZ3JvdXAnKTtcclxuICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZWxlbSA9IHNvdXJjZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmIChlbGVtLmdldEF0dHJpYnV0ZSgncHVycG9zZScpID09PSAnbG9jYXRpb24nKSB7XHJcbiAgICAgICAgICAgICAgICB0b0JlUmVtb3ZlZC5wdXNoKGVsZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRvQmVSZW1vdmVkLmZvckVhY2goKGVsZW0pID0+IHtlbGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbSk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlc2NyaXB0aW9uIHNldCBpbiB0aGUgdGVtcGxhdGUgYXMgdmFsdWUgb2YgdGhlIGkxOG4tYXR0cmlidXRlLlxyXG4gICAgICogZS5nLiBpMThuPVwibXlkZXNjcmlwdGlvblwiLlxyXG4gICAgICogSW4geGxpZmYgdGhpcyBpcyBzdG9yZWQgYXMgYSBub3RlIGVsZW1lbnQgd2l0aCBhdHRyaWJ1dGUgZnJvbT1cImRlc2NyaXB0aW9uXCIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG5vdGVFbGVtID0gdGhpcy5maW5kTm90ZUVsZW1lbnRXaXRoRnJvbUF0dHJpYnV0ZSgnZGVzY3JpcHRpb24nKTtcclxuICAgICAgICBpZiAobm90ZUVsZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIERPTVV0aWxpdGllcy5nZXRQQ0RBVEEobm90ZUVsZW0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYW5nZSBkZXNjcmlwdGlvbiBwcm9wZXJ0eSBvZiB0cmFucy11bml0LlxyXG4gICAgICogQHBhcmFtIGRlc2NyaXB0aW9uIGRlc2NyaXB0aW9uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXREZXNjcmlwdGlvbihkZXNjcmlwdGlvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IG5vdGVFbGVtID0gdGhpcy5maW5kTm90ZUVsZW1lbnRXaXRoRnJvbUF0dHJpYnV0ZSgnZGVzY3JpcHRpb24nKTtcclxuICAgICAgICBpZiAoZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQobm90ZUVsZW0pKSB7XHJcbiAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBpdFxyXG4gICAgICAgICAgICAgICBub3RlRWxlbSA9IHRoaXMuY3JlYXRlTm90ZUVsZW1lbnRXaXRoRnJvbUF0dHJpYnV0ZSgnZGVzY3JpcHRpb24nLCBkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgRE9NVXRpbGl0aWVzLnJlcGxhY2VDb250ZW50V2l0aFhNTENvbnRlbnQobm90ZUVsZW0sIGRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChub3RlRWxlbSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBub2RlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGVFbGVtZW50V2l0aEZyb21BdHRyaWJ1dGUoJ2Rlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIGEgbm90ZSBlbGVtZW50IHdpdGggYXR0cmlidXRlIGZyb209JzxhdHRyVmFsdWU+J1xyXG4gICAgICogQHBhcmFtIGF0dHJWYWx1ZSBhdHRyVmFsdWVcclxuICAgICAqIEByZXR1cm4gZWxlbWVudCBvciBudWxsIGlzIGFic2VudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGZpbmROb3RlRWxlbWVudFdpdGhGcm9tQXR0cmlidXRlKGF0dHJWYWx1ZTogc3RyaW5nKTogRWxlbWVudCB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnRzID0gdGhpcy5fZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbm90ZScpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm90ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdGVFbGVtID0gbm90ZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmIChub3RlRWxlbS5nZXRBdHRyaWJ1dGUoJ2Zyb20nKSA9PT0gYXR0clZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbm90ZUVsZW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYWxsIG5vdGUgZWxlbWVudHMgd2hlcmUgZnJvbSBhdHRyaWJ1dGUgaXMgbm90IGRlc2NyaXB0aW9uIG9yIG1lYW5pbmdcclxuICAgICAqIEByZXR1cm4gZWxlbWVudHNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBmaW5kQWxsQWRkaXRpb25hbE5vdGVFbGVtZW50cygpOiBFbGVtZW50W10ge1xyXG4gICAgICAgIGNvbnN0IG5vdGVFbGVtZW50cyA9IHRoaXMuX2VsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ25vdGUnKTtcclxuICAgICAgICBjb25zdCByZXN1bHQ6IEVsZW1lbnRbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm90ZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdGVFbGVtID0gbm90ZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGZyb21BdHRyaWJ1dGUgPSBub3RlRWxlbS5nZXRBdHRyaWJ1dGUoJ2Zyb20nKTtcclxuICAgICAgICAgICAgaWYgKGZyb21BdHRyaWJ1dGUgIT09ICdkZXNjcmlwdGlvbicgJiYgZnJvbUF0dHJpYnV0ZSAhPT0gJ21lYW5pbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub3RlRWxlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBub3RlIGVsZW1lbnQgd2l0aCBhdHRyaWJ1dGUgZnJvbT0nPGF0dHJWYWx1ZT4nXHJcbiAgICAgKiBAcGFyYW0gZnJvbUF0dHJWYWx1ZSB2YWx1ZSBvZiBcImZyb21cIiBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSBjb250ZW50IHRleHQgdmFsdWUgb2Ygbm90ZSBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHRoZSBuZXcgY3JlYXRlZCBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY3JlYXRlTm90ZUVsZW1lbnRXaXRoRnJvbUF0dHJpYnV0ZShmcm9tQXR0clZhbHVlOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IEVsZW1lbnQge1xyXG4gICAgICAgIGNvbnN0IG5vdGVFbGVtZW50ID0gdGhpcy5fZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ25vdGUnKTtcclxuICAgICAgICBpZiAoZnJvbUF0dHJWYWx1ZSkge1xyXG4gICAgICAgICAgICBub3RlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Zyb20nLCBmcm9tQXR0clZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm90ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdwcmlvcml0eScsICcxJyk7XHJcbiAgICAgICAgaWYgKGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgRE9NVXRpbGl0aWVzLnJlcGxhY2VDb250ZW50V2l0aFhNTENvbnRlbnQobm90ZUVsZW1lbnQsIGNvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKG5vdGVFbGVtZW50KTtcclxuICAgICAgICByZXR1cm4gbm90ZUVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgbm90ZSBlbGVtZW50IHdpdGggYXR0cmlidXRlIGZyb209JzxhdHRyVmFsdWU+J1xyXG4gICAgICogQHBhcmFtIGF0dHJWYWx1ZSBhdHRyVmFsdWVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZW1vdmVOb3RlRWxlbWVudFdpdGhGcm9tQXR0cmlidXRlKGF0dHJWYWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbnQgPSB0aGlzLmZpbmROb3RlRWxlbWVudFdpdGhGcm9tQXR0cmlidXRlKGF0dHJWYWx1ZSk7XHJcbiAgICAgICAgaWYgKG5vdGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQ2hpbGQobm90ZUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhbGwgbm90ZSBlbGVtZW50cyB3aGVyZSBhdHRyaWJ1dGUgXCJmcm9tXCIgaXMgbm90IGRlc2NyaXB0aW9uIG9yIG1lYW5pbmcuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlQWxsQWRkaXRpb25hbE5vdGVFbGVtZW50cygpIHtcclxuICAgICAgICBjb25zdCBub3RlRWxlbWVudHMgPSB0aGlzLmZpbmRBbGxBZGRpdGlvbmFsTm90ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgbm90ZUVsZW1lbnRzLmZvckVhY2goKG5vdGVFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQ2hpbGQobm90ZUVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1lYW5pbmcgKGludGVudCkgc2V0IGluIHRoZSB0ZW1wbGF0ZSBhcyB2YWx1ZSBvZiB0aGUgaTE4bi1hdHRyaWJ1dGUuXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBwYXJ0IGluIGZyb250IG9mIHRoZSB8IHN5bWJvbC5cclxuICAgICAqIGUuZy4gaTE4bj1cIm1lYW5pbmd8bXlkZXNjcmlwdGlvblwiLlxyXG4gICAgICogSW4geGxpZmYgdGhpcyBpcyBzdG9yZWQgYXMgYSBub3RlIGVsZW1lbnQgd2l0aCBhdHRyaWJ1dGUgZnJvbT1cIm1lYW5pbmdcIi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG1lYW5pbmcoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBub3RlRWxlbSA9IHRoaXMuZmluZE5vdGVFbGVtZW50V2l0aEZyb21BdHRyaWJ1dGUoJ21lYW5pbmcnKTtcclxuICAgICAgICBpZiAobm90ZUVsZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIERPTVV0aWxpdGllcy5nZXRQQ0RBVEEobm90ZUVsZW0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYW5nZSBtZWFuaW5nIHByb3BlcnR5IG9mIHRyYW5zLXVuaXQuXHJcbiAgICAgKiBAcGFyYW0gIG1lYW5pbmcgbWVhbmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWVhbmluZyhtZWFuaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgbm90ZUVsZW0gPSB0aGlzLmZpbmROb3RlRWxlbWVudFdpdGhGcm9tQXR0cmlidXRlKCdtZWFuaW5nJyk7XHJcbiAgICAgICAgaWYgKG1lYW5pbmcpIHtcclxuICAgICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKG5vdGVFbGVtKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGl0XHJcbiAgICAgICAgICAgICAgICBub3RlRWxlbSA9IHRoaXMuY3JlYXRlTm90ZUVsZW1lbnRXaXRoRnJvbUF0dHJpYnV0ZSgnbWVhbmluZycsIG1lYW5pbmcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgRE9NVXRpbGl0aWVzLnJlcGxhY2VDb250ZW50V2l0aFhNTENvbnRlbnQobm90ZUVsZW0sIG1lYW5pbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChub3RlRWxlbSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBub2RlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGVFbGVtZW50V2l0aEZyb21BdHRyaWJ1dGUoJ21lYW5pbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbGwgbm90ZXMgb2YgdGhlIHRyYW5zLXVuaXQuXHJcbiAgICAgKiBOb3RlcyBhcmUgcmVtYXJrcyBtYWRlIGJ5IGEgdHJhbnNsYXRvci5cclxuICAgICAqIChkZXNjcmlwdGlvbiBhbmQgbWVhbmluZyBhcmUgbm90IGluY2x1ZGVkIGhlcmUhKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbm90ZXMoKTogSU5vdGVbXSB7XHJcbiAgICAgICAgY29uc3Qgbm90ZUVsZW1lbXRzOiBFbGVtZW50W10gPSB0aGlzLmZpbmRBbGxBZGRpdGlvbmFsTm90ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgcmV0dXJuIG5vdGVFbGVtZW10cy5tYXAoZWxlbSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmcm9tOiBlbGVtLmdldEF0dHJpYnV0ZSgnZnJvbScpLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogRE9NVXRpbGl0aWVzLmdldFBDREFUQShlbGVtKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlc3QsIHdldGhlciBzZXR0aW5nIG9mIG5vdGVzIGlzIHN1cHBvcnRlZC5cclxuICAgICAqIElmIG5vdCwgc2V0Tm90ZXMgd2lsbCBkbyBub3RoaW5nLlxyXG4gICAgICogeHRiIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgYWxsIG90aGVyIGZvcm1hdHMgZG8uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdXBwb3J0c1NldE5vdGVzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIG5vdGVzIHRvIHRyYW5zIHVuaXQuXHJcbiAgICAgKiBAcGFyYW0gbmV3Tm90ZXMgdGhlIG5vdGVzIHRvIGFkZC5cclxuICAgICAqIEB0aHJvd3MgYW4gRXJyb3IgaWYgYW55IG5vdGUgY29udGFpbnMgZGVzY3JpcHRpb24gb3IgbWVhbmluZyBhcyBmcm9tIGF0dHJpYnV0ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldE5vdGVzKG5ld05vdGVzOiBJTm90ZVtdKSB7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChuZXdOb3RlcykpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja05vdGVzKG5ld05vdGVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBbGxBZGRpdGlvbmFsTm90ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChuZXdOb3RlcykpIHtcclxuICAgICAgICAgICAgbmV3Tm90ZXMuZm9yRWFjaCgobm90ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZUVsZW0gPSB0aGlzLmNyZWF0ZU5vdGVFbGVtZW50V2l0aEZyb21BdHRyaWJ1dGUobm90ZS5mcm9tLCBub3RlLnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHRyYW5zbGF0aW9uIHRvIGEgZ2l2ZW4gc3RyaW5nIChpbmNsdWRpbmcgbWFya3VwKS5cclxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbiB0cmFuc2xhdGlvblxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNsYXRlTmF0aXZlKHRyYW5zbGF0aW9uOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9lbGVtZW50LCAndGFyZ2V0Jyk7XHJcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9lbGVtZW50LCAnc291cmNlJyk7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IERPTVV0aWxpdGllcy5jcmVhdGVGb2xsb3dpbmdTaWJsaW5nKCd0YXJnZXQnLCBzb3VyY2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBET01VdGlsaXRpZXMucmVwbGFjZUNvbnRlbnRXaXRoWE1MQ29udGVudCh0YXJnZXQsIDxzdHJpbmc+IHRyYW5zbGF0aW9uKTtcclxuICAgICAgICB0aGlzLnNldFRhcmdldFN0YXRlKFNUQVRFX1RSQU5TTEFURUQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29weSBzb3VyY2UgdG8gdGFyZ2V0IHRvIHVzZSBpdCBhcyBkdW1teSB0cmFuc2xhdGlvbi5cclxuICAgICAqIFJldHVybnMgYSBjaGFuZ2VkIGNvcHkgb2YgdGhpcyB0cmFucyB1bml0LlxyXG4gICAgICogcmVjZWl2ZXIgaXMgbm90IGNoYW5nZWQuXHJcbiAgICAgKiAoaW50ZXJuYWwgdXNhZ2Ugb25seSwgYSBjbGllbnQgc2hvdWxkIGNhbGwgaW1wb3J0TmV3VHJhbnNVbml0IG9uIElUcmFuc2xhdGlvbk1lc3NhZ2VGaWxlKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xvbmVXaXRoU291cmNlQXNUYXJnZXQoaXNEZWZhdWx0TGFuZzogYm9vbGVhbiwgY29weUNvbnRlbnQ6IGJvb2xlYW4sIHRhcmdldEZpbGU6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSk6IEFic3RyYWN0VHJhbnNVbml0IHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gPEVsZW1lbnQ+IHRoaXMuX2VsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIGNvbnN0IGNsb25lID0gbmV3IFhsaWZmVHJhbnNVbml0KGVsZW1lbnQsIHRoaXMuX2lkLCB0YXJnZXRGaWxlKTtcclxuICAgICAgICBjbG9uZS51c2VTb3VyY2VBc1RhcmdldChpc0RlZmF1bHRMYW5nLCBjb3B5Q29udGVudCk7XHJcbiAgICAgICAgcmV0dXJuIGNsb25lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29weSBzb3VyY2UgdG8gdGFyZ2V0IHRvIHVzZSBpdCBhcyBkdW1teSB0cmFuc2xhdGlvbi5cclxuICAgICAqIChpbnRlcm5hbCB1c2FnZSBvbmx5LCBhIGNsaWVudCBzaG91bGQgY2FsbCBjcmVhdGVUcmFuc2xhdGlvbkZpbGVGb3JMYW5nIG9uIElUcmFuc2xhdGlvbk1lc3NhZ2VGaWxlKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdXNlU291cmNlQXNUYXJnZXQoaXNEZWZhdWx0TGFuZzogYm9vbGVhbiwgY29weUNvbnRlbnQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzb3VyY2UgPSBET01VdGlsaXRpZXMuZ2V0Rmlyc3RFbGVtZW50QnlUYWdOYW1lKHRoaXMuX2VsZW1lbnQsICdzb3VyY2UnKTtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gRE9NVXRpbGl0aWVzLmdldEZpcnN0RWxlbWVudEJ5VGFnTmFtZSh0aGlzLl9lbGVtZW50LCAndGFyZ2V0Jyk7XHJcbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gRE9NVXRpbGl0aWVzLmNyZWF0ZUZvbGxvd2luZ1NpYmxpbmcoJ3RhcmdldCcsIHNvdXJjZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0RlZmF1bHRMYW5nIHx8IGNvcHlDb250ZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZVN0cmluZyA9IERPTVV0aWxpdGllcy5nZXRYTUxDb250ZW50KHNvdXJjZSk7XHJcbiAgICAgICAgICAgIGxldCBuZXdUYXJnZXRTdHJpbmcgPSBzb3VyY2VTdHJpbmc7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0lDVU1lc3NhZ2Uoc291cmNlU3RyaW5nKSkge1xyXG4gICAgICAgICAgICAgICAgbmV3VGFyZ2V0U3RyaW5nID0gdGhpcy50cmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSgpLmdldE5ld1RyYW5zVW5pdFRhcmdldFByYWVmaXgoKVxyXG4gICAgICAgICAgICAgICAgICAgICsgc291cmNlU3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgKyB0aGlzLnRyYW5zbGF0aW9uTWVzc2FnZXNGaWxlKCkuZ2V0TmV3VHJhbnNVbml0VGFyZ2V0U3VmZml4KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRE9NVXRpbGl0aWVzLnJlcGxhY2VDb250ZW50V2l0aFhNTENvbnRlbnQodGFyZ2V0LCBuZXdUYXJnZXRTdHJpbmcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIERPTVV0aWxpdGllcy5yZXBsYWNlQ29udGVudFdpdGhYTUxDb250ZW50KHRhcmdldCwgJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNEZWZhdWx0TGFuZykge1xyXG4gICAgICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKCdzdGF0ZScsIHRoaXMubWFwU3RhdGVUb05hdGl2ZVN0YXRlKFNUQVRFX0ZJTkFMKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZSgnc3RhdGUnLCB0aGlzLm1hcFN0YXRlVG9OYXRpdmVTdGF0ZShTVEFURV9ORVcpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19