"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedMessage = void 0;
const parsed_message_part_1 = require("./parsed-message-part");
const parsed_message_part_text_1 = require("./parsed-message-part-text");
const parsed_message_part_placeholder_1 = require("./parsed-message-part-placeholder");
const parsed_message_part_start_tag_1 = require("./parsed-message-part-start-tag");
const parsed_message_part_end_tag_1 = require("./parsed-message-part-end-tag");
const dom_utilities_1 = require("./dom-utilities");
const util_1 = require("util");
const parsed_message_part_icu_message_1 = require("./parsed-message-part-icu-message");
const parsed_message_part_icu_message_ref_1 = require("./parsed-message-part-icu-message-ref");
const parsed_message_part_empty_tag_1 = require("./parsed-message-part-empty-tag");
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
        if (util_1.isNullOrUndefined(this.getICUMessage())) {
            return this._parser.parseNormalizedString(normalizedString, this);
        }
        else {
            throw new Error(util_1.format('cannot translate ICU message with simple string, use translateICUMessage() instead ("%s", "%s")', normalizedString, this.asNativeString()));
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
        if (util_1.isNullOrUndefined(icuMessage)) {
            throw new Error(util_1.format('this is not an ICU message, use translate() instead ("%s", "%s")', icuTranslation, this.asNativeString()));
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
        if (util_1.isNullOrUndefined(this.getICUMessage())) {
            return dom_utilities_1.DOMUtilities.getXMLContent(this._xmlRepresentation);
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
        if (!util_1.isNullOrUndefined(e)) {
            errors.placeholderAdded = e;
            hasErrors = true;
        }
        e = this.checkICUMessageRefRemoved();
        if (!util_1.isNullOrUndefined(e)) {
            errors.icuMessageRefRemoved = e;
            hasErrors = true;
        }
        e = this.checkICUMessageRefAdded();
        if (!util_1.isNullOrUndefined(e)) {
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
        if (!util_1.isNullOrUndefined(w)) {
            warnings.placeholderRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagRemoved();
        if (!util_1.isNullOrUndefined(w)) {
            warnings.tagRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagAdded();
        if (!util_1.isNullOrUndefined(w)) {
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
        return this._parts.length === 1 && this._parts[0].type === parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE;
    }
    /**
     * Test wether this message contains an ICU message reference.
     * ICU message references are something like <x ID="ICU"../>.
     * @return true, if there is an ICU message reference in the message.
     */
    containsICUMessageRef() {
        return this._parts.findIndex(part => part.type === parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF) >= 0;
    }
    /**
     * If this message is an ICU message, returns its structure.
     * Otherwise this method returns null.
     * @return ICUMessage or null.
     */
    getICUMessage() {
        if (this._parts.length === 1 && this._parts[0].type === parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE) {
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
            if (part.type === parsed_message_part_1.ParsedMessagePartType.PLACEHOLDER) {
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
            if (part.type === parsed_message_part_1.ParsedMessagePartType.PLACEHOLDER) {
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
            if (part.type === parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF) {
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
            if (part.type === parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF) {
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
            if (part.type === parsed_message_part_1.ParsedMessagePartType.START_TAG || part.type === parsed_message_part_1.ParsedMessagePartType.EMPTY_TAG) {
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
        this._parts.push(new parsed_message_part_text_1.ParsedMessagePartText(text));
    }
    addPlaceholder(index, disp) {
        this._parts.push(new parsed_message_part_placeholder_1.ParsedMessagePartPlaceholder(index, disp));
    }
    addStartTag(tagname, idcounter) {
        this._parts.push(new parsed_message_part_start_tag_1.ParsedMessagePartStartTag(tagname, idcounter));
    }
    addEndTag(tagname) {
        // check if well formed
        const openTag = this.calculateOpenTagName();
        if (!openTag || openTag !== tagname) {
            // oops, not well formed
            throw new Error(util_1.format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagname, openTag, this.asNativeString()));
        }
        this._parts.push(new parsed_message_part_end_tag_1.ParsedMessagePartEndTag(tagname));
    }
    addEmptyTag(tagname, idcounter) {
        this._parts.push(new parsed_message_part_empty_tag_1.ParsedMessagePartEmptyTag(tagname, idcounter));
    }
    addICUMessageRef(index, disp) {
        this._parts.push(new parsed_message_part_icu_message_ref_1.ParsedMessagePartICUMessageRef(index, disp));
    }
    addICUMessage(text) {
        this._parts.push(new parsed_message_part_icu_message_1.ParsedMessagePartICUMessage(text, this._parser));
    }
    /**
     * Determine, wether there is an open tag, that is not closed.
     * Returns the latest one or null, if there is no open tag.
     */
    calculateOpenTagName() {
        const openTags = [];
        this._parts.forEach((part) => {
            switch (part.type) {
                case parsed_message_part_1.ParsedMessagePartType.START_TAG:
                    openTags.push(part.tagName());
                    break;
                case parsed_message_part_1.ParsedMessagePartType.END_TAG:
                    const tagName = part.tagName();
                    if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                        // oops, not well formed
                        const openTag = (openTags.length === 0) ? 'nothing' : openTags[openTags.length - 1];
                        throw new Error(util_1.format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagName, openTag, this.asNativeString()));
                    }
                    openTags.pop();
            }
        });
        return openTags.length === 0 ? null : openTags[openTags.length - 1];
    }
}
exports.ParsedMessage = ParsedMessage;
//# sourceMappingURL=parsed-message.js.map