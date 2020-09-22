"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTransUnit = void 0;
const internalapi_1 = require("./internalapi");
const abstract_translation_messages_file_1 = require("./abstract-translation-messages-file");
const util_1 = require("util");
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
        if (util_1.isNullOrUndefined(this._sourceContentNormalized)) {
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
        if (this.translationMessagesFile() instanceof abstract_translation_messages_file_1.AbstractTranslationMessagesFile) {
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
        if (!util_1.isNullOrUndefined(errorInFromNote)) {
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
        if (util_1.isString(translation)) {
            translationNative = translation;
        }
        else {
            translationNative = translation.asNativeString();
        }
        this.translateNative(translationNative);
        this.setTargetState(internalapi_1.STATE_TRANSLATED);
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
exports.AbstractTransUnit = AbstractTransUnit;
//# sourceMappingURL=abstract-trans-unit.js.map