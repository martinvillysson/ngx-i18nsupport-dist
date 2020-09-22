"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtbTransUnit = void 0;
const util_1 = require("util");
const dom_utilities_1 = require("./dom-utilities");
const abstract_trans_unit_1 = require("./abstract-trans-unit");
const xmb_message_parser_1 = require("./xmb-message-parser");
/**
 * Created by martin on 23.05.2017.
 * A Translation Unit in an XTB file.
 */
class XtbTransUnit extends abstract_trans_unit_1.AbstractTransUnit {
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
        return new xmb_message_parser_1.XmbMessageParser(); // no typo!, Same as for Xmb
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
        return dom_utilities_1.DOMUtilities.getXMLContent(this._element);
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
        if (util_1.isNullOrUndefined(translation)) {
            translation = '';
        }
        dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(target, translation);
    }
}
exports.XtbTransUnit = XtbTransUnit;
//# sourceMappingURL=xtb-trans-unit.js.map