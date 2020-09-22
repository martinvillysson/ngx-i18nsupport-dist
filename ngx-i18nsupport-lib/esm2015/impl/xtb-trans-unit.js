import { isNullOrUndefined } from 'util';
import { DOMUtilities } from './dom-utilities';
import { AbstractTransUnit } from './abstract-trans-unit';
import { XmbMessageParser } from './xmb-message-parser';
/**
 * Created by martin on 23.05.2017.
 * A Translation Unit in an XTB file.
 */
export class XtbTransUnit extends AbstractTransUnit {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHRiLXRyYW5zLXVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3h0Yi10cmFucy11bml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUt2QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDeEQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFHdEQ7OztHQUdHO0FBRUgsTUFBTSxPQUFPLFlBQWEsU0FBUSxpQkFBaUI7SUFJL0MsWUFBWSxRQUFpQixFQUFFLEdBQVcsRUFBRSx3QkFBa0QsRUFDbEYsMEJBQTZDO1FBQ3JELEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLDBCQUEwQixHQUFHLDBCQUEwQixDQUFDO0lBQ2pFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksYUFBYTtRQUNoQixJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMxRDthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsd0JBQXdCO1FBQ3BCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLGdCQUFnQixDQUFDLFVBQWtCO1FBQ3RDLHlEQUF5RDtJQUM3RCxDQUFDO0lBRUQ7O09BRUc7SUFDTyxhQUFhO1FBQ25CLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsNEJBQTRCO0lBQy9ELENBQUM7SUFFRDs7T0FFRztJQUNJLDZC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LHVCQUF1QixDQUFDLGFBQXNCLEVBQUUsV0FBb0IsRUFBRSxVQUFvQztRQUM3RyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksaUJBQWlCLENBQUMsYUFBc0IsRUFBRSxXQUFvQjtRQUNqRSxhQUFhO0lBQ2pCLENBQUM7SUFFRDs7O09BR0c7SUFDTyxlQUFlLENBQUMsV0FBbUI7UUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM3QixJQUFJLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2hDLFdBQVcsR0FBRyxFQUFFLENBQUM7U0FDcEI7UUFDRCxZQUFZLENBQUMsNEJBQTRCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FFSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNOdWxsT3JVbmRlZmluZWR9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZX0gZnJvbSAnLi4vYXBpL2ktdHJhbnNsYXRpb24tbWVzc2FnZXMtZmlsZSc7XHJcbmltcG9ydCB7SU5vcm1hbGl6ZWRNZXNzYWdlfSBmcm9tICcuLi9hcGkvaS1ub3JtYWxpemVkLW1lc3NhZ2UnO1xyXG5pbXBvcnQge0lUcmFuc1VuaXR9IGZyb20gJy4uL2FwaS9pLXRyYW5zLXVuaXQnO1xyXG5pbXBvcnQge0lOb3RlfSBmcm9tICcuLi9hcGkvaS1ub3RlJztcclxuaW1wb3J0IHtET01VdGlsaXRpZXN9IGZyb20gJy4vZG9tLXV0aWxpdGllcyc7XHJcbmltcG9ydCB7QWJzdHJhY3RUcmFuc1VuaXR9IGZyb20gJy4vYWJzdHJhY3QtdHJhbnMtdW5pdCc7XHJcbmltcG9ydCB7WG1iTWVzc2FnZVBhcnNlcn0gZnJvbSAnLi94bWItbWVzc2FnZS1wYXJzZXInO1xyXG5pbXBvcnQge1BhcnNlZE1lc3NhZ2V9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UnO1xyXG5pbXBvcnQge0Fic3RyYWN0TWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9hYnN0cmFjdC1tZXNzYWdlLXBhcnNlcic7XHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IG1hcnRpbiBvbiAyMy4wNS4yMDE3LlxyXG4gKiBBIFRyYW5zbGF0aW9uIFVuaXQgaW4gYW4gWFRCIGZpbGUuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIFh0YlRyYW5zVW5pdCBleHRlbmRzIEFic3RyYWN0VHJhbnNVbml0IGltcGxlbWVudHMgSVRyYW5zVW5pdCB7XHJcblxyXG4gICAgcHJpdmF0ZSBfc291cmNlVHJhbnNVbml0RnJvbU1hc3RlcjogQWJzdHJhY3RUcmFuc1VuaXQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX2VsZW1lbnQ6IEVsZW1lbnQsIF9pZDogc3RyaW5nLCBfdHJhbnNsYXRpb25NZXNzYWdlc0ZpbGU6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSxcclxuICAgICAgICAgICAgICAgIF9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyOiBBYnN0cmFjdFRyYW5zVW5pdCkge1xyXG4gICAgICAgIHN1cGVyKF9lbGVtZW50LCBfaWQsIF90cmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSk7XHJcbiAgICAgICAgdGhpcy5fc291cmNlVHJhbnNVbml0RnJvbU1hc3RlciA9IF9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGNvbnRlbnQgdG8gdHJhbnNsYXRlLlxyXG4gICAgICogU291cmNlIHBhcnRzIGFyZSBleGNsdWRlZCBoZXJlLlxyXG4gICAgICogQHJldHVybiBjb250ZW50IHRvIHRyYW5zbGF0ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNvdXJjZUNvbnRlbnQoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5fc291cmNlVHJhbnNVbml0RnJvbU1hc3Rlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlVHJhbnNVbml0RnJvbU1hc3Rlci5zb3VyY2VDb250ZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCwgd2V0aGVyIHNldHRpbmcgb2Ygc291cmNlIGNvbnRlbnQgaXMgc3VwcG9ydGVkLlxyXG4gICAgICogSWYgbm90LCBzZXRTb3VyY2VDb250ZW50IGluIHRyYW5zLXVuaXQgd2lsbCBkbyBub3RoaW5nLlxyXG4gICAgICogeHRiIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgYWxsIG90aGVyIGZvcm1hdHMgZG8uXHJcbiAgICAgKi9cclxuICAgIHN1cHBvcnRzU2V0U291cmNlQ29udGVudCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgbmV3IHNvdXJjZSBjb250ZW50IGluIHRoZSB0cmFuc3VuaXQuXHJcbiAgICAgKiBOb3JtYWxseSwgdGhpcyBpcyBkb25lIGJ5IG5nLWV4dHJhY3QuXHJcbiAgICAgKiBNZXRob2Qgb25seSBleGlzdHMgdG8gYWxsb3cgeGxpZmZtZXJnZSB0byBtZXJnZSBtaXNzaW5nIGNoYW5nZWQgc291cmNlIGNvbnRlbnQuXHJcbiAgICAgKiBAcGFyYW0gbmV3Q29udGVudCB0aGUgbmV3IGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRTb3VyY2VDb250ZW50KG5ld0NvbnRlbnQ6IHN0cmluZykge1xyXG4gICAgICAgIC8vIHh0YiBoYXMgbm8gc291cmNlIGNvbnRlbnQsIHRoZXkgYXJlIHBhcnQgb2YgdGhlIG1hc3RlclxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgcGFyc2VyIHVzZWQgZm9yIG5vcm1hbGl6ZWQgbWVzc2FnZXMuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtZXNzYWdlUGFyc2VyKCk6IEFic3RyYWN0TWVzc2FnZVBhcnNlciB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBYbWJNZXNzYWdlUGFyc2VyKCk7IC8vIG5vIHR5cG8hLCBTYW1lIGFzIGZvciBYbWJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBvcmlnaW5hbCB0ZXh0IHZhbHVlLCB0aGF0IGlzIHRvIGJlIHRyYW5zbGF0ZWQsIGFzIG5vcm1hbGl6ZWQgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZVNvdXJjZUNvbnRlbnROb3JtYWxpemVkKCk6IFBhcnNlZE1lc3NhZ2Uge1xyXG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyLmNyZWF0ZVNvdXJjZUNvbnRlbnROb3JtYWxpemVkKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIHRyYW5zbGF0ZWQgdmFsdWUgKGNvbnRhaW5pbmcgYWxsIG1hcmt1cCwgZGVwZW5kcyBvbiB0aGUgY29uY3JldGUgZm9ybWF0IHVzZWQpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdGFyZ2V0Q29udGVudCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBET01VdGlsaXRpZXMuZ2V0WE1MQ29udGVudCh0aGlzLl9lbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSB0cmFuc2xhdGVkIHZhbHVlLCBidXQgYWxsIHBsYWNlaG9sZGVycyBhcmUgcmVwbGFjZWQgd2l0aCB7e259fSAoc3RhcnRpbmcgYXQgMClcclxuICAgICAqIGFuZCBhbGwgZW1iZWRkZWQgaHRtbCBpcyByZXBsYWNlZCBieSBkaXJlY3QgaHRtbCBtYXJrdXAuXHJcbiAgICAgKi9cclxuICAgIHRhcmdldENvbnRlbnROb3JtYWxpemVkKCk6IElOb3JtYWxpemVkTWVzc2FnZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhcnNlcigpLmNyZWF0ZU5vcm1hbGl6ZWRNZXNzYWdlRnJvbVhNTCh0aGlzLl9lbGVtZW50LCB0aGlzLnNvdXJjZUNvbnRlbnROb3JtYWxpemVkKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhdGUgb2YgdGhlIHRyYW5zbGF0aW9uLlxyXG4gICAgICogKG5vdCBzdXBwb3J0ZWQgaW4geG1iKVxyXG4gICAgICogSWYgd2UgaGF2ZSBhIG1hc3Rlciwgd2UgYXNzdW1lZCBpdCBpcyB0cmFuc2xhdGVkIGlmIHRoZSBjb250ZW50IGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgbWFzdGVycyBvbmUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBuYXRpdmVUYXJnZXRTdGF0ZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUNvbnRlbnQgPSB0aGlzLl9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyLnNvdXJjZUNvbnRlbnQoKTtcclxuICAgICAgICAgICAgaWYgKCFzb3VyY2VDb250ZW50IHx8IHNvdXJjZUNvbnRlbnQgPT09IHRoaXMudGFyZ2V0Q29udGVudCgpIHx8ICF0aGlzLnRhcmdldENvbnRlbnQoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICduZXcnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdmaW5hbCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIG5vdCBzdXBwb3J0ZWQgaW4geG1iXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXAgYW4gYWJzdHJhY3Qgc3RhdGUgKG5ldywgdHJhbnNsYXRlZCwgZmluYWwpIHRvIGEgY29uY3JldGUgc3RhdGUgdXNlZCBpbiB0aGUgeG1sLlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RhdGUgdG8gYmUgdXNlZCBpbiB0aGUgeG1sLlxyXG4gICAgICogQHBhcmFtIHN0YXRlIG9uZSBvZiBDb25zdGFudHMuU1RBVEUuLi5cclxuICAgICAqIEByZXR1cm5zIGEgbmF0aXZlIHN0YXRlIChkZXBlbmRzIG9uIGNvbmNyZXRlIGZvcm1hdClcclxuICAgICAqIEB0aHJvd3MgZXJyb3IsIGlmIHN0YXRlIGlzIGludmFsaWQuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtYXBTdGF0ZVRvTmF0aXZlU3RhdGUoc3RhdGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwIGEgbmF0aXZlIHN0YXRlIChmb3VuZCBpbiB0aGUgZG9jdW1lbnQpIHRvIGFuIGFic3RyYWN0IHN0YXRlIChuZXcsIHRyYW5zbGF0ZWQsIGZpbmFsKS5cclxuICAgICAqIFJldHVybnMgdGhlIGFic3RyYWN0IHN0YXRlLlxyXG4gICAgICogQHBhcmFtIG5hdGl2ZVN0YXRlIG5hdGl2ZVN0YXRlXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtYXBOYXRpdmVTdGF0ZVRvU3RhdGUobmF0aXZlU3RhdGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIG5hdGl2ZVN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IHN0YXRlIGluIHhtbC5cclxuICAgICAqIChub3Qgc3VwcG9ydGVkIGluIHhtYilcclxuICAgICAqIEBwYXJhbSBuYXRpdmVTdGF0ZSBuYXRpdmVTdGF0ZVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2V0TmF0aXZlVGFyZ2V0U3RhdGUobmF0aXZlU3RhdGU6IHN0cmluZykge1xyXG4gICAgICAgIC8vIFRPRE8gc29tZSBsb2dpYyB0byBzdG9yZSBpdCBhbnl3aGVyZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSBzb3VyY2UgZWxlbWVudHMgaW4gdGhlIHRyYW5zIHVuaXQuXHJcbiAgICAgKiBUaGUgc291cmNlIGVsZW1lbnQgaXMgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIHRlbXBsYXRlLlxyXG4gICAgICogSXQgY29udGFpbnMgdGhlIG5hbWUgb2YgdGhlIHRlbXBsYXRlIGZpbGUgYW5kIGEgbGluZSBudW1iZXIgd2l0aCB0aGUgcG9zaXRpb24gaW5zaWRlIHRoZSB0ZW1wbGF0ZS5cclxuICAgICAqIEl0IGlzIGp1c3QgYSBoZWxwIGZvciB0cmFuc2xhdG9ycyB0byBmaW5kIHRoZSBjb250ZXh0IGZvciB0aGUgdHJhbnNsYXRpb24uXHJcbiAgICAgKiBUaGlzIGlzIHNldCB3aGVuIHVzaW5nIEFuZ3VsYXIgNC4wIG9yIGdyZWF0ZXIuXHJcbiAgICAgKiBPdGhlcndpc2UgaXQganVzdCByZXR1cm5zIGFuIGVtcHR5IGFycmF5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc291cmNlUmVmZXJlbmNlcygpOiB7IHNvdXJjZWZpbGU6IHN0cmluZywgbGluZW51bWJlcjogbnVtYmVyIH1bXSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NvdXJjZVRyYW5zVW5pdEZyb21NYXN0ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZVRyYW5zVW5pdEZyb21NYXN0ZXIuc291cmNlUmVmZXJlbmNlcygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0LCB3ZXRoZXIgc2V0dGluZyBvZiBzb3VyY2UgcmVmcyBpcyBzdXBwb3J0ZWQuXHJcbiAgICAgKiBJZiBub3QsIHNldFNvdXJjZVJlZmVyZW5jZXMgd2lsbCBkbyBub3RoaW5nLlxyXG4gICAgICogeHRiIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgYWxsIG90aGVyIGZvcm1hdHMgZG8uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdXBwb3J0c1NldFNvdXJjZVJlZmVyZW5jZXMoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHNvdXJjZSByZWYgZWxlbWVudHMgaW4gdGhlIHRyYW5zdW5pdC5cclxuICAgICAqIE5vcm1hbGx5LCB0aGlzIGlzIGRvbmUgYnkgbmctZXh0cmFjdC5cclxuICAgICAqIE1ldGhvZCBvbmx5IGV4aXN0cyB0byBhbGxvdyB4bGlmZm1lcmdlIHRvIG1lcmdlIG1pc3Npbmcgc291cmNlIHJlZnMuXHJcbiAgICAgKiBAcGFyYW0gc291cmNlUmVmcyB0aGUgc291cmNlcmVmcyB0byBzZXQuIE9sZCBvbmVzIGFyZSByZW1vdmVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0U291cmNlUmVmZXJlbmNlcyhzb3VyY2VSZWZzOiB7c291cmNlZmlsZTogc3RyaW5nLCBsaW5lbnVtYmVyOiBudW1iZXJ9W10pIHtcclxuICAgICAgICAvLyB4dGIgaGFzIG5vIHNvdXJjZSByZWZzLCB0aGV5IGFyZSBwYXJ0IG9mIHRoZSBtYXN0ZXJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZXNjcmlwdGlvbiBzZXQgaW4gdGhlIHRlbXBsYXRlIGFzIHZhbHVlIG9mIHRoZSBpMThuLWF0dHJpYnV0ZS5cclxuICAgICAqIGUuZy4gaTE4bj1cIm15ZGVzY3JpcHRpb25cIi5cclxuICAgICAqIEluIHh0YiBvbmx5IHRoZSBtYXN0ZXIgc3RvcmVzIGl0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGVzY3JpcHRpb24oKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5fc291cmNlVHJhbnNVbml0RnJvbU1hc3Rlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlVHJhbnNVbml0RnJvbU1hc3Rlci5kZXNjcmlwdGlvbigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtZWFuaW5nIChpbnRlbnQpIHNldCBpbiB0aGUgdGVtcGxhdGUgYXMgdmFsdWUgb2YgdGhlIGkxOG4tYXR0cmlidXRlLlxyXG4gICAgICogVGhpcyBpcyB0aGUgcGFydCBpbiBmcm9udCBvZiB0aGUgfCBzeW1ib2wuXHJcbiAgICAgKiBlLmcuIGkxOG49XCJtZWFuaW5nfG15ZGVzY3JpcHRpb25cIi5cclxuICAgICAqIEluIHh0YiBvbmx5IHRoZSBtYXN0ZXIgc3RvcmVzIGl0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbWVhbmluZygpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2VUcmFuc1VuaXRGcm9tTWFzdGVyLm1lYW5pbmcoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0LCB3ZXRoZXIgc2V0dGluZyBvZiBkZXNjcmlwdGlvbiBhbmQgbWVhbmluZyBpcyBzdXBwb3J0ZWQuXHJcbiAgICAgKiBJZiBub3QsIHNldERlc2NyaXB0aW9uIGFuZCBzZXRNZWFuaW5nIHdpbGwgZG8gbm90aGluZy5cclxuICAgICAqIHh0YiBkb2VzIG5vdCBzdXBwb3J0IHRoaXMsIGFsbCBvdGhlciBmb3JtYXRzIGRvLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3VwcG9ydHNTZXREZXNjcmlwdGlvbkFuZE1lYW5pbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIGRlc2NyaXB0aW9uIHByb3BlcnR5IG9mIHRyYW5zLXVuaXQuXHJcbiAgICAgKiBAcGFyYW0gZGVzY3JpcHRpb24gZGVzY3JpcHRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkLCBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2UgbWVhbmluZyBwcm9wZXJ0eSBvZiB0cmFucy11bml0LlxyXG4gICAgICogQHBhcmFtIG1lYW5pbmcgbWVhbmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWVhbmluZyhtZWFuaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkLCBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYWxsIG5vdGVzIG9mIHRoZSB0cmFucy11bml0LlxyXG4gICAgICogVGhlcmUgYXJlIE5PIG5vdGVzIGluIHhtYi94dGJcclxuICAgICAqL1xyXG4gICAgcHVibGljIG5vdGVzKCk6IElOb3RlW10ge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlc3QsIHdldGhlciBzZXR0aW5nIG9mIG5vdGVzIGlzIHN1cHBvcnRlZC5cclxuICAgICAqIElmIG5vdCwgc2V0Tm90ZXMgd2lsbCBkbyBub3RoaW5nLlxyXG4gICAgICogeHRiIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgYWxsIG90aGVyIGZvcm1hdHMgZG8uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdXBwb3J0c1NldE5vdGVzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBub3RlcyB0byB0cmFucyB1bml0LlxyXG4gICAgICogQHBhcmFtIG5ld05vdGVzIHRoZSBub3RlcyB0byBhZGQuXHJcbiAgICAgKiBOT1QgU3VwcG9ydGVkIGluIHhtYi94dGJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldE5vdGVzKG5ld05vdGVzOiBJTm90ZVtdKSB7XHJcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCwgZG8gbm90aGluZ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29weSBzb3VyY2UgdG8gdGFyZ2V0IHRvIHVzZSBpdCBhcyBkdW1teSB0cmFuc2xhdGlvbi5cclxuICAgICAqIFJldHVybnMgYSBjaGFuZ2VkIGNvcHkgb2YgdGhpcyB0cmFucyB1bml0LlxyXG4gICAgICogcmVjZWl2ZXIgaXMgbm90IGNoYW5nZWQuXHJcbiAgICAgKiAoaW50ZXJuYWwgdXNhZ2Ugb25seSwgYSBjbGllbnQgc2hvdWxkIGNhbGwgaW1wb3J0TmV3VHJhbnNVbml0IG9uIElUcmFuc2xhdGlvbk1lc3NhZ2VGaWxlKVxyXG4gICAgICogSW4geHRiIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8sIGJlY2F1c2UgdGhlcmUgaXMgb25seSBhIHRhcmdldCwgbm8gc291cmNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY2xvbmVXaXRoU291cmNlQXNUYXJnZXQoaXNEZWZhdWx0TGFuZzogYm9vbGVhbiwgY29weUNvbnRlbnQ6IGJvb2xlYW4sIHRhcmdldEZpbGU6IElUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSk6IEFic3RyYWN0VHJhbnNVbml0IHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvcHkgc291cmNlIHRvIHRhcmdldCB0byB1c2UgaXQgYXMgZHVtbXkgdHJhbnNsYXRpb24uXHJcbiAgICAgKiAoaW50ZXJuYWwgdXNhZ2Ugb25seSwgYSBjbGllbnQgc2hvdWxkIGNhbGwgY3JlYXRlVHJhbnNsYXRpb25GaWxlRm9yTGFuZyBvbiBJVHJhbnNsYXRpb25NZXNzYWdlRmlsZSlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHVzZVNvdXJjZUFzVGFyZ2V0KGlzRGVmYXVsdExhbmc6IGJvb2xlYW4sIGNvcHlDb250ZW50OiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0cmFuc2xhdGlvbiB0byBhIGdpdmVuIHN0cmluZyAoaW5jbHVkaW5nIG1hcmt1cCkuXHJcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb24gdHJhbnNsYXRpb25cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHRyYW5zbGF0ZU5hdGl2ZSh0cmFuc2xhdGlvbjogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5fZWxlbWVudDtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodHJhbnNsYXRpb24pKSB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERPTVV0aWxpdGllcy5yZXBsYWNlQ29udGVudFdpdGhYTUxDb250ZW50KHRhcmdldCwgdHJhbnNsYXRpb24pO1xyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=