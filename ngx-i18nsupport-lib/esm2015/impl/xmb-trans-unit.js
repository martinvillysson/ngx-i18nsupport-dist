import { DOMUtilities } from './dom-utilities';
import { AbstractTransUnit } from './abstract-trans-unit';
import { XmbMessageParser } from './xmb-message-parser';
/**
 * Created by martin on 01.05.2017.
 * A Translation Unit in an XMB file.
 */
export class XmbTransUnit extends AbstractTransUnit {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1iLXRyYW5zLXVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3htYi10cmFucy11bml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUd0RDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sWUFBYSxTQUFRLGlCQUFpQjtJQUUvQyxZQUFZLFFBQWlCLEVBQUUsR0FBVyxFQUFFLHdCQUFrRDtRQUMxRixLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssTUFBTSxDQUFDLGlCQUFpQixDQUFDLFlBQW9CO1FBQ2pELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ1gsT0FBTztnQkFDSCxVQUFVLEVBQUUsWUFBWTtnQkFDeEIsVUFBVSxFQUFFLENBQUM7YUFDaEIsQ0FBQztTQUNMO2FBQU07WUFDSCxPQUFPO2dCQUNILFVBQVUsRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7Z0JBQzVDLFVBQVUsRUFBRSxZQUFZLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzlFLENBQUM7U0FDTDtJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsZUFBZSxDQUFDLGdCQUF3QjtRQUNuRCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFB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O0lBQ2pCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxjQUFjLENBQUMsV0FBbUI7UUFDckMsNEJBQTRCO0lBQ2hDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUMsT0FBZTtRQUM3Qiw0QkFBNEI7SUFDaEMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUs7UUFDUixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksZ0JBQWdCO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksUUFBUSxDQUFDLFFBQWlCO1FBQzdCLDRCQUE0QjtJQUNoQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksdUJBQXVCLENBQUMsYUFBc0IsRUFBRSxXQUFvQixFQUFFLFVBQW9DO1FBQzdHLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxpQkFBaUIsQ0FBQyxhQUFzQixFQUFFLFdBQW9CO1FBQ2pFLGFBQWE7SUFDakIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ08sZUFBZSxDQUFDLFdBQW1CO1FBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBRUoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZX0gZnJvbSAnLi4vYXBpL2ktdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZSc7XHJcbmltcG9ydCB7SU5vcm1hbGl6ZWRNZXNzYWdlfSBmcm9tICcuLi9hcGkvaS1ub3JtYWxpemVkLW1lc3NhZ2UnO1xyXG5pbXBvcnQge0lUcmFuc1VuaXR9IGZyb20gJy4uL2FwaS9pLXRyYW5zLXVuaXQnO1xyXG5pbXBvcnQge0lOb3RlfSBmcm9tICcuLi9hcGkvaS1ub3RlJztcclxuaW1wb3J0IHtET01VdGlsaXRpZXN9IGZyb20gJy4vZG9tLXV0aWxpdGllcyc7XHJcbmltcG9ydCB7QWJzdHJhY3RUcmFuc1VuaXR9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnMtdW5pdCc7XHJcbmltcG9ydCB7WG1iTWVzc2FnZVBhcnNlcn0gZnJvbSAnLi94bWItbWVzc2FnZS1wYXJzZXInO1xyXG5pbXBvcnQge1BhcnNlZE1lc3NhZ2V9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UnO1xyXG5pbXBvcnQge0Fic3RyYWN0TWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9hYnN0cmFjdC1tZXNzYWdlLXBhcnNlcic7XHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAwMS4wNS4yMDE3LlxyXG4gKiBBIFRyYW5zbGF0aW9uIFVuaXQgaW4gYW4gWE1CIGZpbGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFhtYlRyYW5zVW5pdCBleHRlbmRzIEFic3RyYWN0VHJhbnNVbml0IGltcGxlbWVudHMgSVRyYW5zVW5pdCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX2VsZW1lbnQ6IEVsZW1lbnQsIF9pZDogc3RyaW5nLCBfdHJhbnNsYXRpb25NZXNzYWdlc0ZpbGU6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSkge1xyXG4gICAgICAgIHN1cGVyKF9lbGVtZW50LCBfaWQsIF90cmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZXMgc29tZXRoaW5nIGxpa2UgJ2M6XFx4eHg6NycgYW5kIHJldHVybnMgc291cmNlIGFuZCBsaW5lbnVtYmVyLlxyXG4gICAgICogQHBhcmFtIHNvdXJjZUFuZFBvcyBzb21ldGhpbmcgbGlrZSAnYzpcXHh4eDo3JywgbGFzdCBjb2xvbiBpcyB0aGUgc2VwYXJhdG9yXHJcbiAgICAgKiBAcmV0dXJuIHNvdXJjZSBhbmQgbGluZW51bWJlclxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBwYXJzZVNvdXJjZUFuZFBvcyhzb3VyY2VBbmRQb3M6IHN0cmluZyk6IHsgc291cmNlZmlsZTogc3RyaW5nLCBsaW5lbnVtYmVyIH0ge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gc291cmNlQW5kUG9zLmxhc3RJbmRleE9mKCc6Jyk7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc291cmNlZmlsZTogc291cmNlQW5kUG9zLFxyXG4gICAgICAgICAgICAgICAgbGluZW51bWJlcjogMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2VmaWxlOiBzb3VyY2VBbmRQb3Muc3Vic3RyaW5nKDAsIGluZGV4KSxcclxuICAgICAgICAgICAgICAgIGxpbmVudW1iZXI6IFhtYlRyYW5zVW5pdC5wYXJzZUxpbmVOdW1iZXIoc291cmNlQW5kUG9zLnN1YnN0cmluZyhpbmRleCArIDEpKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBwYXJzZUxpbmVOdW1iZXIobGluZU51bWJlclN0cmluZzogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KGxpbmVOdW1iZXJTdHJpbmcsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBjb250ZW50IHRvIHRyYW5zbGF0ZS5cclxuICAgICAqIFNvdXJjZSBwYXJ0cyBhcmUgZXhjbHVkZWQgaGVyZS5cclxuICAgICAqIEByZXR1cm4gc291cmNlIGNvbnRlbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvdXJjZUNvbnRlbnQoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgbXNnQ29udGVudCA9IERPTVV0aWxpdGllcy5nZXRYTUxDb250ZW50KHRoaXMuX2VsZW1lbnQpO1xyXG4gICAgICAgIGNvbnN0IHJlU291cmNlRWxlbTogUmVnRXhwID0gLzxzb3VyY2U+Lio8XFwvc291cmNlPi9nO1xyXG4gICAgICAgIG1zZ0NvbnRlbnQgPSBtc2dDb250ZW50LnJlcGxhY2UocmVTb3VyY2VFbGVtLCAnJyk7XHJcbiAgICAgICAgcmV0dXJuIG1zZ0NvbnRlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0LCB3ZXRoZXIgc2V0dGluZyBvZiBzb3VyY2UgY29udGVudCBpcyBzdXBwb3J0ZWQuXHJcbiAgICAgKiBJZiBub3QsIHNldFNvdXJjZUNvbnRlbnQgaW4gdHJhbnMtdW5pdCB3aWxsIGRvIG5vdGhpbmcuXHJcbiAgICAgKiB4dGIgZG9lcyBub3Qgc3VwcG9ydCB0aGlzLCBhbGwgb3RoZXIgZm9ybWF0cyBkby5cclxuICAgICAqL1xyXG4gICAgc3VwcG9ydHNTZXRTb3VyY2VDb250ZW50KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBuZXcgc291cmNlIGNvbnRlbnQgaW4gdGhlIHRyYW5zdW5pdC5cclxuICAgICAqIE5vcm1hbGx5LCB0aGlzIGlzIGRvbmUgYnkgbmctZXh0cmFjdC5cclxuICAgICAqIE1ldGhvZCBvbmx5IGV4aXN0cyB0byBhbGxvdyB4bGlmZm1lcmdlIHRvIG1lcmdlIG1pc3NpbmcgY2hhbmdlZCBzb3VyY2UgY29udGVudC5cclxuICAgICAqIEBwYXJhbSBuZXdDb250ZW50IHRoZSBuZXcgY29udGVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFNvdXJjZUNvbnRlbnQobmV3Q29udGVudDogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgcGFyc2VyIHVzZWQgZm9yIG5vcm1hbGl6ZWQgbWVzc2FnZXMuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtZXNzYWdlUGFyc2VyKCk6IEFic3RyYWN0TWVzc2FnZVBhcnNlciB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBYbWJNZXNzYWdlUGFyc2VyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgb3JpZ2luYWwgdGV4dCB2YWx1ZSwgdGhhdCBpcyB0byBiZSB0cmFuc2xhdGVkLCBhcyBub3JtYWxpemVkIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVTb3VyY2VDb250ZW50Tm9ybWFsaXplZCgpOiBQYXJzZWRNZXNzYWdlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlUGFyc2VyKCkuY3JlYXRlTm9ybWFsaXplZE1lc3NhZ2VGcm9tWE1MKHRoaXMuX2VsZW1lbnQsIG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIHRyYW5zbGF0ZWQgdmFsdWUgKGNvbnRhaW5pbmcgYWxsIG1hcmt1cCwgZGVwZW5kcyBvbiB0aGUgY29uY3JldGUgZm9ybWF0IHVzZWQpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFyZ2V0Q29udGVudCgpOiBzdHJpbmcge1xyXG4gICAgICAgIC8vIGluIGZhY3QsIHRhcmdldCBhbmQgc291cmNlIGFyZSBqdXN0IHRoZSBzYW1lIGluIHhtYlxyXG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZUNvbnRlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSB0cmFuc2xhdGVkIHZhbHVlLCBidXQgYWxsIHBsYWNlaG9sZGVycyBhcmUgcmVwbGFjZWQgd2l0aCB7e259fSAoc3RhcnRpbmcgYXQgMClcclxuICAgICAqIGFuZCBhbGwgZW1iZWRkZWQgaHRtbCBpcyByZXBsYWNlZCBieSBkaXJlY3QgaHRtbCBtYXJrdXAuXHJcbiAgICAgKi9cclxuICAgIHRhcmdldENvbnRlbnROb3JtYWxpemVkKCk6IElOb3JtYWxpemVkTWVzc2FnZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBYbWJNZXNzYWdlUGFyc2VyKCkuY3JlYXRlTm9ybWFsaXplZE1lc3NhZ2VGcm9tWE1MKHRoaXMuX2VsZW1lbnQsIHRoaXMuc291cmNlQ29udGVudE5vcm1hbGl6ZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0ZSBvZiB0aGUgdHJhbnNsYXRpb24uXHJcbiAgICAgKiAobm90IHN1cHBvcnRlZCBpbiB4bWIpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBuYXRpdmVUYXJnZXRTdGF0ZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBudWxsOyAvLyBub3Qgc3VwcG9ydGVkIGluIHhtYlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwIGFuIGFic3RyYWN0IHN0YXRlIChuZXcsIHRyYW5zbGF0ZWQsIGZpbmFsKSB0byBhIGNvbmNyZXRlIHN0YXRlIHVzZWQgaW4gdGhlIHhtbC5cclxuICAgICAqIFJldHVybnMgdGhlIHN0YXRlIHRvIGJlIHVzZWQgaW4gdGhlIHhtbC5cclxuICAgICAqIEBwYXJhbSBzdGF0ZSBvbmUgb2YgQ29uc3RhbnRzLlNUQVRFLi4uXHJcbiAgICAgKiBAcmV0dXJucyBhIG5hdGl2ZSBzdGF0ZSAoZGVwZW5kcyBvbiBjb25jcmV0ZSBmb3JtYXQpXHJcbiAgICAgKiBAdGhyb3dzIGVycm9yLCBpZiBzdGF0ZSBpcyBpbnZhbGlkLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWFwU3RhdGVUb05hdGl2ZVN0YXRlKHN0YXRlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcCBhIG5hdGl2ZSBzdGF0ZSAoZm91bmQgaW4gdGhlIGRvY3VtZW50KSB0byBhbiBhYnN0cmFjdCBzdGF0ZSAobmV3LCB0cmFuc2xhdGVkLCBmaW5hbCkuXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBhYnN0cmFjdCBzdGF0ZS5cclxuICAgICAqIEBwYXJhbSBuYXRpdmVTdGF0ZSBuYXRpdmVTdGF0ZVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWFwTmF0aXZlU3RhdGVUb1N0YXRlKG5hdGl2ZVN0YXRlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBuYXRpdmVTdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBzdGF0ZSBpbiB4bWwuXHJcbiAgICAgKiAobm90IHN1cHBvcnRlZCBpbiB4bWIpXHJcbiAgICAgKiBAcGFyYW0gbmF0aXZlU3RhdGUgbmF0aXZlU3RhdGVcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNldE5hdGl2ZVRhcmdldFN0YXRlKG5hdGl2ZVN0YXRlOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGZvciB4bWJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbCB0aGUgc291cmNlIGVsZW1lbnRzIGluIHRoZSB0cmFucyB1bml0LlxyXG4gICAgICogVGhlIHNvdXJjZSBlbGVtZW50IGlzIGEgcmVmZXJlbmNlIHRvIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZS5cclxuICAgICAqIEl0IGNvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSB0ZW1wbGF0ZSBmaWxlIGFuZCBhIGxpbmUgbnVtYmVyIHdpdGggdGhlIHBvc2l0aW9uIGluc2lkZSB0aGUgdGVtcGxhdGUuXHJcbiAgICAgKiBJdCBpcyBqdXN0IGEgaGVscCBmb3IgdHJhbnNsYXRvcnMgdG8gZmluZCB0aGUgY29udGV4dCBmb3IgdGhlIHRyYW5zbGF0aW9uLlxyXG4gICAgICogVGhpcyBpcyBzZXQgd2hlbiB1c2luZyBBbmd1bGFyIDQuMCBvciBncmVhdGVyLlxyXG4gICAgICogT3RoZXJ3aXNlIGl0IGp1c3QgcmV0dXJucyBhbiBlbXB0eSBhcnJheS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvdXJjZVJlZmVyZW5jZXMoKTogeyBzb3VyY2VmaWxlOiBzdHJpbmcsIGxpbmVudW1iZXI6IG51bWJlciB9W10ge1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUVsZW1lbnRzID0gdGhpcy5fZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc291cmNlJyk7XHJcbiAgICAgICAgY29uc3Qgc291cmNlUmVmczogeyBzb3VyY2VmaWxlOiBzdHJpbmcsIGxpbmVudW1iZXI6IG51bWJlciB9W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW0gPSBzb3VyY2VFbGVtZW50cy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBjb25zdCBzb3VyY2VBbmRQb3M6IHN0cmluZyA9IERPTVV0aWxpdGllcy5nZXRQQ0RBVEEoZWxlbSk7XHJcbiAgICAgICAgICAgIHNvdXJjZVJlZnMucHVzaChYbWJUcmFuc1VuaXQucGFyc2VTb3VyY2VBbmRQb3Moc291cmNlQW5kUG9zKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzb3VyY2VSZWZzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHNvdXJjZSByZWYgZWxlbWVudHMgaW4gdGhlIHRyYW5zdW5pdC5cclxuICAgICAqIE5vcm1hbGx5LCB0aGlzIGlzIGRvbmUgYnkgbmctZXh0cmFjdC5cclxuICAgICAqIE1ldGhvZCBvbmx5IGV4aXN0cyB0byBhbGxvdyB4bGlmZm1lcmdlIHRvIG1lcmdlIG1pc3Npbmcgc291cmNlIHJlZnMuXHJcbiAgICAgKiBAcGFyYW0gc291cmNlUmVmcyB0aGUgc291cmNlcmVmcyB0byBzZXQuIE9sZCBvbmVzIGFyZSByZW1vdmVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0U291cmNlUmVmZXJlbmNlcyhzb3VyY2VSZWZzOiB7c291cmNlZmlsZTogc3RyaW5nLCBsaW5lbnVtYmVyOiBudW1iZXJ9W10pIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUFsbFNvdXJjZVJlZmVyZW5jZXMoKTtcclxuICAgICAgICBsZXQgaW5zZXJ0UG9zaXRpb24gPSB0aGlzLl9lbGVtZW50LmNoaWxkTm9kZXMuaXRlbSgwKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gc291cmNlUmVmcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBjb25zdCByZWYgPSBzb3VyY2VSZWZzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSB0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XHJcbiAgICAgICAgICAgIHNvdXJjZS5hcHBlbmRDaGlsZCh0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocmVmLnNvdXJjZWZpbGUgKyAnOicgKyByZWYubGluZW51bWJlci50b1N0cmluZygxMCkpKTtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5pbnNlcnRCZWZvcmUoc291cmNlLCBpbnNlcnRQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGluc2VydFBvc2l0aW9uID0gc291cmNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbW92ZUFsbFNvdXJjZVJlZmVyZW5jZXMoKSB7XHJcbiAgICAgICAgY29uc3Qgc291cmNlRWxlbWVudHMgPSB0aGlzLl9lbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzb3VyY2UnKTtcclxuICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZWxlbSA9IHNvdXJjZUVsZW1lbnRzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIHRvQmVSZW1vdmVkLnB1c2goZWxlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRvQmVSZW1vdmVkLmZvckVhY2goKGVsZW0pID0+IHtlbGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbSk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlc2NyaXB0aW9uIHNldCBpbiB0aGUgdGVtcGxhdGUgYXMgdmFsdWUgb2YgdGhlIGkxOG4tYXR0cmlidXRlLlxyXG4gICAgICogZS5nLiBpMThuPVwibXlkZXNjcmlwdGlvblwiLlxyXG4gICAgICogSW4geG1iIHRoaXMgaXMgc3RvcmVkIGluIHRoZSBhdHRyaWJ1dGUgXCJkZXNjXCIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGVzYycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1lYW5pbmcgKGludGVudCkgc2V0IGluIHRoZSB0ZW1wbGF0ZSBhcyB2YWx1ZSBvZiB0aGUgaTE4bi1hdHRyaWJ1dGUuXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBwYXJ0IGluIGZyb250IG9mIHRoZSB8IHN5bWJvbC5cclxuICAgICAqIGUuZy4gaTE4bj1cIm1lYW5pbmd8bXlkZXNjcmlwdGlvblwiLlxyXG4gICAgICogSW4geG1iIHRoaXMgaXMgc3RvcmVkIGluIHRoZSBhdHRyaWJ1dGUgXCJtZWFuaW5nXCIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtZWFuaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuZ2V0QXR0cmlidXRlKCdtZWFuaW5nJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0LCB3ZXRoZXIgc2V0dGluZyBvZiBkZXNjcmlwdGlvbiBhbmQgbWVhbmluZyBpcyBzdXBwb3J0ZWQuXHJcbiAgICAgKiBJZiBub3QsIHNldERlc2NyaXB0aW9uIGFuZCBzZXRNZWFuaW5nIHdpbGwgZG8gbm90aGluZy5cclxuICAgICAqIHh0YiBkb2VzIG5vdCBzdXBwb3J0IHRoaXMsIGFsbCBvdGhlciBmb3JtYXRzIGRvLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3VwcG9ydHNTZXREZXNjcmlwdGlvbkFuZE1lYW5pbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIGRlc2NyaXB0aW9uIHByb3BlcnR5IG9mIHRyYW5zLXVuaXQuXHJcbiAgICAgKiBAcGFyYW0gZGVzY3JpcHRpb24gZGVzY3JpcHRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkLCBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2UgbWVhbmluZyBwcm9wZXJ0eSBvZiB0cmFucy11bml0LlxyXG4gICAgICogQHBhcmFtIG1lYW5pbmcgbWVhbmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWVhbmluZyhtZWFuaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkLCBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYWxsIG5vdGVzIG9mIHRoZSB0cmFucy11bml0LlxyXG4gICAgICogVGhlcmUgYXJlIE5PIG5vdGVzIGluIHhtYi94dGJcclxuICAgICAqL1xyXG4gICAgcHVibGljIG5vdGVzKCk6IElOb3RlW10ge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlc3QsIHdldGhlciBzZXR0aW5nIG9mIG5vdGVzIGlzIHN1cHBvcnRlZC5cclxuICAgICAqIElmIG5vdCwgc2V0Tm90ZXMgd2lsbCBkbyBub3RoaW5nLlxyXG4gICAgICogeHRiIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgYWxsIG90aGVyIGZvcm1hdHMgZG8uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdXBwb3J0c1NldE5vdGVzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBub3RlcyB0byB0cmFucyB1bml0LlxyXG4gICAgICogQHBhcmFtIG5ld05vdGVzIHRoZSBub3RlcyB0byBhZGQuXHJcbiAgICAgKiBOT1QgU3VwcG9ydGVkIGluIHhtYi94dGJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldE5vdGVzKG5ld05vdGVzOiBJTm90ZVtdKSB7XHJcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCwgZG8gbm90aGluZ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29weSBzb3VyY2UgdG8gdGFyZ2V0IHRvIHVzZSBpdCBhcyBkdW1teSB0cmFuc2xhdGlvbi5cclxuICAgICAqIFJldHVybnMgYSBjaGFuZ2VkIGNvcHkgb2YgdGhpcyB0cmFucyB1bml0LlxyXG4gICAgICogcmVjZWl2ZXIgaXMgbm90IGNoYW5nZWQuXHJcbiAgICAgKiAoaW50ZXJuYWwgdXNhZ2Ugb25seSwgYSBjbGllbnQgc2hvdWxkIGNhbGwgaW1wb3J0TmV3VHJhbnNVbml0IG9uIElUcmFuc2xhdGlvbk1lc3NhZ2VGaWxlKVxyXG4gICAgICogSW4geG1iIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8sIGJlY2F1c2UgdGhlcmUgaXMgb25seSBhIHRhcmdldCwgbm8gc291cmNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xvbmVXaXRoU291cmNlQXNUYXJnZXQoaXNEZWZhdWx0TGFuZzogYm9vbGVhbiwgY29weUNvbnRlbnQ6IGJvb2xlYW4sIHRhcmdldEZpbGU6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSk6IEFic3RyYWN0VHJhbnNVbml0IHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvcHkgc291cmNlIHRvIHRhcmdldCB0byB1c2UgaXQgYXMgZHVtbXkgdHJhbnNsYXRpb24uXHJcbiAgICAgKiAoaW50ZXJuYWwgdXNhZ2Ugb25seSwgYSBjbGllbnQgc2hvdWxkIGNhbGwgY3JlYXRlVHJhbnNsYXRpb25GaWxlRm9yTGFuZyBvbiBJVHJhbnNsYXRpb25NZXNzYWdlRmlsZSlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHVzZVNvdXJjZUFzVGFyZ2V0KGlzRGVmYXVsdExhbmc6IGJvb2xlYW4sIGNvcHlDb250ZW50OiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0cmFuc2xhdGlvbiB0byBhIGdpdmVuIHN0cmluZyAoaW5jbHVkaW5nIG1hcmt1cCkuXHJcbiAgICAgKiBJbiBmYWN0LCB4bWIgY2Fubm90IGJlIHRyYW5zbGF0ZWQuXHJcbiAgICAgKiBTbyB0aGlzIHRocm93cyBhbiBlcnJvci5cclxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbiB0cmFuc2xhdGlvblxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNsYXRlTmF0aXZlKHRyYW5zbGF0aW9uOiBzdHJpbmcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW5ub3QgdHJhbnNsYXRlIHhtYiBmaWxlcywgdXNlIHh0YiBpbnN0ZWFkLicpO1xyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=