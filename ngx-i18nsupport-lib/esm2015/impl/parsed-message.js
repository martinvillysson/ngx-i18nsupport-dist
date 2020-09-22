import { ParsedMessagePartType } from './parsed-message-part';
import { ParsedMessagePartText } from './parsed-message-part-text';
import { ParsedMessagePartPlaceholder } from './parsed-message-part-placeholder';
import { ParsedMessagePartStartTag } from './parsed-message-part-start-tag';
import { ParsedMessagePartEndTag } from './parsed-message-part-end-tag';
import { DOMUtilities } from './dom-utilities';
import { format, isNullOrUndefined } from 'util';
import { ParsedMessagePartICUMessage } from './parsed-message-part-icu-message';
import { ParsedMessagePartICUMessageRef } from './parsed-message-part-icu-message-ref';
import { ParsedMessagePartEmptyTag } from './parsed-message-part-empty-tag';
/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
export class ParsedMessage {
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
        if (isNullOrUndefined(this.getICUMessage())) {
            return this._parser.parseNormalizedString(normalizedString, this);
        }
        else {
            throw new Error(format('cannot translate ICU message with simple string, use translateICUMessage() instead ("%s", "%s")', normalizedString, this.asNativeString()));
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
        if (isNullOrUndefined(icuMessage)) {
            throw new Error(format('this is not an ICU message, use translate() instead ("%s", "%s")', icuTranslation, this.asNativeString()));
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
        if (isNullOrUndefined(this.getICUMessage())) {
            return DOMUtilities.getXMLContent(this._xmlRepresentation);
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
        if (!isNullOrUndefined(e)) {
            errors.placeholderAdded = e;
            hasErrors = true;
        }
        e = this.checkICUMessageRefRemoved();
        if (!isNullOrUndefined(e)) {
            errors.icuMessageRefRemoved = e;
            hasErrors = true;
        }
        e = this.checkICUMessageRefAdded();
        if (!isNullOrUndefined(e)) {
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
        if (!isNullOrUndefined(w)) {
            warnings.placeholderRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagRemoved();
        if (!isNullOrUndefined(w)) {
            warnings.tagRemoved = w;
            hasWarnings = true;
        }
        w = this.checkTagAdded();
        if (!isNullOrUndefined(w)) {
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
        return this._parts.length === 1 && this._parts[0].type === ParsedMessagePartType.ICU_MESSAGE;
    }
    /**
     * Test wether this message contains an ICU message reference.
     * ICU message references are something like <x ID="ICU"../>.
     * @return true, if there is an ICU message reference in the message.
     */
    containsICUMessageRef() {
        return this._parts.findIndex(part => part.type === ParsedMessagePartType.ICU_MESSAGE_REF) >= 0;
    }
    /**
     * If this message is an ICU message, returns its structure.
     * Otherwise this method returns null.
     * @return ICUMessage or null.
     */
    getICUMessage() {
        if (this._parts.length === 1 && this._parts[0].type === ParsedMessagePartType.ICU_MESSAGE) {
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
            if (part.type === ParsedMessagePartType.PLACEHOLDER) {
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
            if (part.type === ParsedMessagePartType.PLACEHOLDER) {
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
            if (part.type === ParsedMessagePartType.ICU_MESSAGE_REF) {
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
            if (part.type === ParsedMessagePartType.ICU_MESSAGE_REF) {
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
            if (part.type === ParsedMessagePartType.START_TAG || part.type === ParsedMessagePartType.EMPTY_TAG) {
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
        this._parts.push(new ParsedMessagePartText(text));
    }
    addPlaceholder(index, disp) {
        this._parts.push(new ParsedMessagePartPlaceholder(index, disp));
    }
    addStartTag(tagname, idcounter) {
        this._parts.push(new ParsedMessagePartStartTag(tagname, idcounter));
    }
    addEndTag(tagname) {
        // check if well formed
        const openTag = this.calculateOpenTagName();
        if (!openTag || openTag !== tagname) {
            // oops, not well formed
            throw new Error(format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagname, openTag, this.asNativeString()));
        }
        this._parts.push(new ParsedMessagePartEndTag(tagname));
    }
    addEmptyTag(tagname, idcounter) {
        this._parts.push(new ParsedMessagePartEmptyTag(tagname, idcounter));
    }
    addICUMessageRef(index, disp) {
        this._parts.push(new ParsedMessagePartICUMessageRef(index, disp));
    }
    addICUMessage(text) {
        this._parts.push(new ParsedMessagePartICUMessage(text, this._parser));
    }
    /**
     * Determine, wether there is an open tag, that is not closed.
     * Returns the latest one or null, if there is no open tag.
     */
    calculateOpenTagName() {
        const openTags = [];
        this._parts.forEach((part) => {
            switch (part.type) {
                case ParsedMessagePartType.START_TAG:
                    openTags.push(part.tagName());
                    break;
                case ParsedMessagePartType.END_TAG:
                    const tagName = part.tagName();
                    if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                        // oops, not well formed
                        const openTag = (openTags.length === 0) ? 'nothing' : openTags[openTags.length - 1];
                        throw new Error(format('unexpected close tag %s (currently open is %s, native xml is "%s")', tagName, openTag, this.asNativeString()));
                    }
                    openTags.pop();
            }
        });
        return openTags.length === 0 ? null : openTags[openTags.length - 1];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VkLW1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL3BhcnNlZC1tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBb0IscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNqRSxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUMxRSxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUV0RSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFN0MsT0FBTyxFQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUUvQyxPQUFPLEVBQUMsMkJBQTJCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUM5RSxPQUFPLEVBQUMsOEJBQThCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUVyRixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUMxRTs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxhQUFhO0lBdUJ0QixZQUFZLE1BQXNCLEVBQUUsYUFBNEI7UUFDNUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQVMsQ0FBQyxnQkFBd0I7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QixJQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDNUQsTUFBTTtnQkFDVixLQUFLLHFCQUFxQixDQUFDLE9BQU87b0JBQzlCLE1BQU0sT0FBTyxHQUE4QixJQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzNELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO3dCQUNwRSx3QkFBd0I7d0JBQ3hCLE1BQU0sT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDcEYsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsb0VBQW9FLEVBQ3ZGLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDakQ7b0JBQ0QsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3RCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGFyc2VkTWVzc2FnZVBhcnQsIFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZX0gZnJvbSAnLi9wYXJzZWQtbWVzc2FnZS1wYXJ0JztcclxuaW1wb3J0IHtQYXJzZWRNZXNzYWdlUGFydFRleHR9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UtcGFydC10ZXh0JztcclxuaW1wb3J0IHtQYXJzZWRNZXNzYWdlUGFydFBsYWNlaG9sZGVyfSBmcm9tICcuL3BhcnNlZC1tZXNzYWdlLXBhcnQtcGxhY2Vob2xkZXInO1xyXG5pbXBvcnQge1BhcnNlZE1lc3NhZ2VQYXJ0U3RhcnRUYWd9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UtcGFydC1zdGFydC10YWcnO1xyXG5pbXBvcnQge1BhcnNlZE1lc3NhZ2VQYXJ0RW5kVGFnfSBmcm9tICcuL3BhcnNlZC1tZXNzYWdlLXBhcnQtZW5kLXRhZyc7XHJcbmltcG9ydCB7SU5vcm1hbGl6ZWRNZXNzYWdlLCBWYWxpZGF0aW9uRXJyb3JzfSBmcm9tICcuLi9hcGkvaS1ub3JtYWxpemVkLW1lc3NhZ2UnO1xyXG5pbXBvcnQge0RPTVV0aWxpdGllc30gZnJvbSAnLi9kb20tdXRpbGl0aWVzJztcclxuaW1wb3J0IHtJTWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9pLW1lc3NhZ2UtcGFyc2VyJztcclxuaW1wb3J0IHtmb3JtYXQsIGlzTnVsbE9yVW5kZWZpbmVkfSBmcm9tICd1dGlsJztcclxuaW1wb3J0IHtJSUNVTWVzc2FnZSwgSUlDVU1lc3NhZ2VUcmFuc2xhdGlvbn0gZnJvbSAnLi4vYXBpL2ktaWN1LW1lc3NhZ2UnO1xyXG5pbXBvcnQge1BhcnNlZE1lc3NhZ2VQYXJ0SUNVTWVzc2FnZX0gZnJvbSAnLi9wYXJzZWQtbWVzc2FnZS1wYXJ0LWljdS1tZXNzYWdlJztcclxuaW1wb3J0IHtQYXJzZWRNZXNzYWdlUGFydElDVU1lc3NhZ2VSZWZ9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UtcGFydC1pY3UtbWVzc2FnZS1yZWYnO1xyXG5pbXBvcnQge0lDVU1lc3NhZ2V9IGZyb20gJy4vaWN1LW1lc3NhZ2UnO1xyXG5pbXBvcnQge1BhcnNlZE1lc3NhZ2VQYXJ0RW1wdHlUYWd9IGZyb20gJy4vcGFyc2VkLW1lc3NhZ2UtcGFydC1lbXB0eS10YWcnO1xyXG4vKipcclxuICogQ3JlYXRlZCBieSBtYXJ0aW4gb24gMDUuMDUuMjAxNy5cclxuICogQSBtZXNzYWdlIHRleHQgcmVhZCBmcm9tIGEgdHJhbnNsYXRpb24gZmlsZS5cclxuICogQ2FuIGNvbnRhaW4gcGxhY2Vob2xkZXJzLCB0YWdzLCB0ZXh0LlxyXG4gKiBUaGlzIGNsYXNzIGlzIGEgcmVwcmVzZW50YXRpb24gaW5kZXBlbmRlbnQgb2YgdGhlIGNvbmNyZXRlIGZvcm1hdC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQYXJzZWRNZXNzYWdlIGltcGxlbWVudHMgSU5vcm1hbGl6ZWRNZXNzYWdlIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlciB0aGF0IGNyZWF0ZWQgdGhpcyBtZXNzYWdlIChkZXRlcm1pbmVzIHRoZSBuYXRpdmUgZm9ybWF0KS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcGFyc2VyOiBJTWVzc2FnZVBhcnNlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtZXNzYWdlIHdoZXJlIHRoaXMgb25lIHN0ZW1zIGZyb20gYXMgdHJhbnNsYXRpb24uXHJcbiAgICAgKiBPcHRpb25hbCwgc2V0IG9ubHkgZm9yIG1lc3NhZ2VzIGNyZWF0ZWQgYnkgY2FsbGluZyB0cmFuc2xhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc291cmNlTWVzc2FnZTogUGFyc2VkTWVzc2FnZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwYXJ0cyBvZiB0aGUgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcGFydHM6IFBhcnNlZE1lc3NhZ2VQYXJ0W107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtZXNzYWdlcyB4bWwgcmVwcmVzZW50YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3htbFJlcHJlc2VudGF0aW9uOiBFbGVtZW50O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBhcnNlcjogSU1lc3NhZ2VQYXJzZXIsIHNvdXJjZU1lc3NhZ2U6IFBhcnNlZE1lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLl9wYXJzZXIgPSBwYXJzZXI7XHJcbiAgICAgICAgdGhpcy5zb3VyY2VNZXNzYWdlID0gc291cmNlTWVzc2FnZTtcclxuICAgICAgICB0aGlzLl9wYXJ0cyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBwYXJzZXIgKGZvciB0ZXN0cyBvbmx5LCBub3QgcGFydCBvZiBBUEkpXHJcbiAgICAgKiBAcmV0dXJuIHBhcnNlclxyXG4gICAgICovXHJcbiAgICBnZXRQYXJzZXIoKTogSU1lc3NhZ2VQYXJzZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbm9ybWFsaXplZCBtZXNzYWdlIGFzIGEgdHJhbnNsYXRpb24gb2YgdGhpcyBvbmUuXHJcbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZFN0cmluZyB0aGUgdHJhbnNsYXRpb24gaW4gbm9ybWFsaXplZCBmb3JtLlxyXG4gICAgICogSWYgdGhlIG1lc3NhZ2UgaXMgYW4gSUNVTWVzc2FnZSAoZ2V0SUNVTWVzc2FnZSByZXR1cm5zIGEgdmFsdWUpLCB1c2UgdHJhbnNsYXRlSUNVTWVzc2FnZSBpbnN0ZWFkLlxyXG4gICAgICogQHRocm93cyBhbiBlcnJvciBpZiBub3JtYWxpemVkIHN0cmluZyBpcyBub3Qgd2VsbCBmb3JtZWQuXHJcbiAgICAgKiBUaHJvd3MgYW4gZXJyb3IgdG9vLCBpZiB0aGlzIGlzIGFuIElDVSBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICB0cmFuc2xhdGUobm9ybWFsaXplZFN0cmluZzogc3RyaW5nKTogSU5vcm1hbGl6ZWRNZXNzYWdlIHtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5nZXRJQ1VNZXNzYWdlKCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJzZXIucGFyc2VOb3JtYWxpemVkU3RyaW5nKDxzdHJpbmc+IG5vcm1hbGl6ZWRTdHJpbmcsIHRoaXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXQoJ2Nhbm5vdCB0cmFuc2xhdGUgSUNVIG1lc3NhZ2Ugd2l0aCBzaW1wbGUgc3RyaW5nLCB1c2UgdHJhbnNsYXRlSUNVTWVzc2FnZSgpIGluc3RlYWQgKFwiJXNcIiwgXCIlc1wiKScsXHJcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkU3RyaW5nLCB0aGlzLmFzTmF0aXZlU3RyaW5nKCkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgbm9ybWFsaXplZCBpY3UgbWVzc2FnZSBhcyBhIHRyYW5zbGF0aW9uIG9mIHRoaXMgb25lLlxyXG4gICAgICogQHBhcmFtIGljdVRyYW5zbGF0aW9uIHRoZSB0cmFuc2xhdGlvbiwgdGhpcyBpcyB0aGUgdHJhbnNsYXRpb24gb2YgdGhlIElDVSBtZXNzYWdlLFxyXG4gICAgICogd2hpY2ggaXMgbm90IGEgc3RyaW5nLCBidXQgYSBjb2xsZWN0aW9ucyBvZiB0aGUgdHJhbnNsYXRpb25zIG9mIHRoZSBkaWZmZXJlbnQgY2F0ZWdvcmllcy5cclxuICAgICAqIFRoZSBtZXNzYWdlIG11c3QgYmUgYW4gSUNVTWVzc2FnZSAoZ2V0SUNVTWVzc2FnZSByZXR1cm5zIGEgdmFsdWUpXHJcbiAgICAgKiBAdGhyb3dzIGFuIGVycm9yIGlmIG5vcm1hbGl6ZWQgc3RyaW5nIGlzIG5vdCB3ZWxsIGZvcm1lZC5cclxuICAgICAqIFRocm93cyBhbiBlcnJvciB0b28sIGlmIHRoaXMgaXMgbm90IGFuIElDVSBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICB0cmFuc2xhdGVJQ1VNZXNzYWdlKGljdVRyYW5zbGF0aW9uOiBJSUNVTWVzc2FnZVRyYW5zbGF0aW9uKTogSU5vcm1hbGl6ZWRNZXNzYWdlIHtcclxuICAgICAgICBjb25zdCBpY3VNZXNzYWdlOiBJSUNVTWVzc2FnZSA9IHRoaXMuZ2V0SUNVTWVzc2FnZSgpO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChpY3VNZXNzYWdlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0KCd0aGlzIGlzIG5vdCBhbiBJQ1UgbWVzc2FnZSwgdXNlIHRyYW5zbGF0ZSgpIGluc3RlYWQgKFwiJXNcIiwgXCIlc1wiKScsXHJcbiAgICAgICAgICAgICAgICBpY3VUcmFuc2xhdGlvbiwgIHRoaXMuYXNOYXRpdmVTdHJpbmcoKSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRJQ1VNZXNzYWdlOiBJSUNVTWVzc2FnZSA9IGljdU1lc3NhZ2UudHJhbnNsYXRlKGljdVRyYW5zbGF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlci5wYXJzZUlDVU1lc3NhZ2UodHJhbnNsYXRlZElDVU1lc3NhZ2UuYXNOYXRpdmVTdHJpbmcoKSwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IG5vcm1hbGl6ZWQgbWVzc2FnZSBmcm9tIGEgbmF0aXZlIHhtbCBzdHJpbmcgYXMgYSB0cmFuc2xhdGlvbiBvZiB0aGlzIG9uZS5cclxuICAgICAqIEBwYXJhbSBuYXRpdmVTdHJpbmcgeG1sIHN0cmluZyBpbiB0aGUgZm9ybWF0IG9mIHRoZSB1bmRlcmx5aW5nIGZpbGUgZm9ybWF0LlxyXG4gICAgICogVGhyb3dzIGFuIGVycm9yIGlmIG5hdGl2ZSBzdHJpbmcgaXMgbm90IGFjY2VwdGFibGUuXHJcbiAgICAgKi9cclxuICAgIHRyYW5zbGF0ZU5hdGl2ZVN0cmluZyhuYXRpdmVTdHJpbmc6IHN0cmluZyk6IElOb3JtYWxpemVkTWVzc2FnZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlci5jcmVhdGVOb3JtYWxpemVkTWVzc2FnZUZyb21YTUxTdHJpbmcobmF0aXZlU3RyaW5nLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG5vcm1hbGl6ZWQgbWVzc2FnZSBhcyBzdHJpbmcuXHJcbiAgICAgKiBAcGFyYW0gZGlzcGxheUZvcm1hdCBvcHRpb25hbCB3YXkgdG8gZGV0ZXJtaW5lIHRoZSBleGFjdCBzeW50YXguXHJcbiAgICAgKiBBbGxvd2VkIGZvcm1hdHMgYXJlIGRlZmluZWQgYXMgY29uc3RhbnRzIE5PUk1BTElaQVRJT05fRk9STUFULi4uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc0Rpc3BsYXlTdHJpbmcoZGlzcGxheUZvcm1hdD86IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5tYXAoKHBhcnQpID0+IHBhcnQuYXNEaXNwbGF5U3RyaW5nKGRpc3BsYXlGb3JtYXQpKS5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG1lc3NhZ2UgY29udGVudCBhcyBmb3JtYXQgZGVwZW5kZW50IG5hdGl2ZSBzdHJpbmcuXHJcbiAgICAgKiBJbmNsdWRlcyBhbGwgZm9ybWF0IHNwZWNpZmljIG1hcmt1cCBsaWtlIDxwaCBpZD1cIklOVEVSUE9MQVRJT05cIiAuLi8+IC4uXHJcbiAgICAgKi9cclxuICAgIGFzTmF0aXZlU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuZ2V0SUNVTWVzc2FnZSgpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gRE9NVXRpbGl0aWVzLmdldFhNTENvbnRlbnQodGhpcy5feG1sUmVwcmVzZW50YXRpb24pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldElDVU1lc3NhZ2UoKS5hc05hdGl2ZVN0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlIHRoZSBtZXNzYWdlLlxyXG4gICAgICogQHJldHVybiBudWxsLCBpZiBvaywgZXJyb3Igb2JqZWN0IG90aGVyd2lzZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHZhbGlkYXRlKCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcclxuICAgICAgICBsZXQgaGFzRXJyb3JzID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JzID0ge307XHJcbiAgICAgICAgbGV0IGU7XHJcbiAgICAgICAgZSA9IHRoaXMuY2hlY2tQbGFjZWhvbGRlckFkZGVkKCk7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChlKSkge1xyXG4gICAgICAgICAgICBlcnJvcnMucGxhY2Vob2xkZXJBZGRlZCA9IGU7XHJcbiAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUgPSB0aGlzLmNoZWNrSUNVTWVzc2FnZVJlZlJlbW92ZWQoKTtcclxuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGUpKSB7XHJcbiAgICAgICAgICAgIGVycm9ycy5pY3VNZXNzYWdlUmVmUmVtb3ZlZCA9IGU7XHJcbiAgICAgICAgICAgIGhhc0Vycm9ycyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUgPSB0aGlzLmNoZWNrSUNVTWVzc2FnZVJlZkFkZGVkKCk7XHJcbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChlKSkge1xyXG4gICAgICAgICAgICBlcnJvcnMuaWN1TWVzc2FnZVJlZkFkZGVkID0gZTtcclxuICAgICAgICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhc0Vycm9ycyA/IGVycm9ycyA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZSB0aGUgbWVzc2FnZSwgY2hlY2sgZm9yIHdhcm5pbmdzIG9ubHkuXHJcbiAgICAgKiBBIHdhcm5pbmcgc2hvd3MsIHRoYXQgdGhlIG1lc3NhZ2UgaXMgYWNjZXB0YWJsZSwgYnV0IG1pc3NlcyBzb21ldGhpbmcuXHJcbiAgICAgKiBFLmcuIGlmIHlvdSByZW1vdmUgYSBwbGFjZWhvbGRlciBvciBhIHNwZWNpYWwgdGFnIGZyb20gdGhlIG9yaWdpbmFsIG1lc3NhZ2UsIHRoaXMgZ2VuZXJhdGVzIGEgd2FybmluZy5cclxuICAgICAqIEByZXR1cm4gbnVsbCwgaWYgbm8gd2FybmluZywgd2FybmluZ3MgYXMgZXJyb3Igb2JqZWN0IG90aGVyd2lzZS5cclxuICAgICAqL1xyXG4gICAgdmFsaWRhdGVXYXJuaW5ncygpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGhhc1dhcm5pbmdzID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25FcnJvcnMgPSB7fTtcclxuICAgICAgICBsZXQgdztcclxuICAgICAgICB3ID0gdGhpcy5jaGVja1BsYWNlaG9sZGVyUmVtb3ZlZCgpO1xyXG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodykpIHtcclxuICAgICAgICAgICAgd2FybmluZ3MucGxhY2Vob2xkZXJSZW1vdmVkID0gdztcclxuICAgICAgICAgICAgaGFzV2FybmluZ3MgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3ID0gdGhpcy5jaGVja1RhZ1JlbW92ZWQoKTtcclxuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHcpKSB7XHJcbiAgICAgICAgICAgIHdhcm5pbmdzLnRhZ1JlbW92ZWQgPSB3O1xyXG4gICAgICAgICAgICBoYXNXYXJuaW5ncyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHcgPSB0aGlzLmNoZWNrVGFnQWRkZWQoKTtcclxuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHcpKSB7XHJcbiAgICAgICAgICAgIHdhcm5pbmdzLnRhZ0FkZGVkID0gdztcclxuICAgICAgICAgICAgaGFzV2FybmluZ3MgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFzV2FybmluZ3MgPyB3YXJuaW5ncyA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IHdldGhlciB0aGlzIG1lc3NhZ2UgaXMgYW4gSUNVIG1lc3NhZ2UuXHJcbiAgICAgKiBAcmV0dXJuIHRydWUsIGlmIGl0IGlzIGFuIElDVSBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBpc0lDVU1lc3NhZ2UoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLl9wYXJ0c1swXS50eXBlID09PSBQYXJzZWRNZXNzYWdlUGFydFR5cGUuSUNVX01FU1NBR0U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IHdldGhlciB0aGlzIG1lc3NhZ2UgY29udGFpbnMgYW4gSUNVIG1lc3NhZ2UgcmVmZXJlbmNlLlxyXG4gICAgICogSUNVIG1lc3NhZ2UgcmVmZXJlbmNlcyBhcmUgc29tZXRoaW5nIGxpa2UgPHggSUQ9XCJJQ1VcIi4uLz4uXHJcbiAgICAgKiBAcmV0dXJuIHRydWUsIGlmIHRoZXJlIGlzIGFuIElDVSBtZXNzYWdlIHJlZmVyZW5jZSBpbiB0aGUgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgY29udGFpbnNJQ1VNZXNzYWdlUmVmKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5maW5kSW5kZXgocGFydCA9PiBwYXJ0LnR5cGUgPT09IFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZS5JQ1VfTUVTU0FHRV9SRUYpID49IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzIG1lc3NhZ2UgaXMgYW4gSUNVIG1lc3NhZ2UsIHJldHVybnMgaXRzIHN0cnVjdHVyZS5cclxuICAgICAqIE90aGVyd2lzZSB0aGlzIG1ldGhvZCByZXR1cm5zIG51bGwuXHJcbiAgICAgKiBAcmV0dXJuIElDVU1lc3NhZ2Ugb3IgbnVsbC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldElDVU1lc3NhZ2UoKTogSUlDVU1lc3NhZ2Uge1xyXG4gICAgICAgIGlmICh0aGlzLl9wYXJ0cy5sZW5ndGggPT09IDEgJiYgdGhpcy5fcGFydHNbMF0udHlwZSA9PT0gUGFyc2VkTWVzc2FnZVBhcnRUeXBlLklDVV9NRVNTQUdFKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGljdVBhcnQgPSA8UGFyc2VkTWVzc2FnZVBhcnRJQ1VNZXNzYWdlPiB0aGlzLl9wYXJ0c1swXTtcclxuICAgICAgICAgICAgcmV0dXJuIGljdVBhcnQuZ2V0SUNVTWVzc2FnZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBmb3IgYWRkZWQgcGxhY2Vob2xkZXIuXHJcbiAgICAgKiBAcmV0dXJuIG51bGwgb3IgbWVzc2FnZSwgaWYgZnVsZmlsbGVkLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoZWNrUGxhY2Vob2xkZXJBZGRlZCgpOiBhbnkge1xyXG4gICAgICAgIGxldCBlID0gbnVsbDtcclxuICAgICAgICBjb25zdCBzdXNwaWNpb3VzSW5kZXhlcyA9IFtdO1xyXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZU1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlUGxhY2Vob2xkZXJzID0gdGhpcy5zb3VyY2VNZXNzYWdlLmFsbFBsYWNlaG9sZGVycygpO1xyXG4gICAgICAgICAgICBjb25zdCBteVBsYWNlaG9sZGVycyA9IHRoaXMuYWxsUGxhY2Vob2xkZXJzKCk7XHJcbiAgICAgICAgICAgIG15UGxhY2Vob2xkZXJzLmZvckVhY2goKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZVBsYWNlaG9sZGVycy5oYXMoaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VzcGljaW91c0luZGV4ZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3VzcGljaW91c0luZGV4ZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIGUgPSAnYWRkZWQgcGxhY2Vob2xkZXIgJyArIHN1c3BpY2lvdXNJbmRleGVzWzBdICsgJywgd2hpY2ggaXMgbm90IGluIG9yaWdpbmFsIG1lc3NhZ2UnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc3VzcGljaW91c0luZGV4ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsU3VzcGljaW91c0luZGV4ZXMgPSAnJztcclxuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgc3VzcGljaW91c0luZGV4ZXMuZm9yRWFjaCgoaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghZmlyc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxTdXNwaWNpb3VzSW5kZXhlcyA9IGFsbFN1c3BpY2lvdXNJbmRleGVzICsgJywgJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFsbFN1c3BpY2lvdXNJbmRleGVzID0gYWxsU3VzcGljaW91c0luZGV4ZXMgKyBpbmRleDtcclxuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlID0gJ2FkZGVkIHBsYWNlaG9sZGVycyAnICsgYWxsU3VzcGljaW91c0luZGV4ZXMgKyAnLCB3aGljaCBhcmUgbm90IGluIG9yaWdpbmFsIG1lc3NhZ2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGZvciByZW1vdmVkIHBsYWNlaG9sZGVyLlxyXG4gICAgICogQHJldHVybiBudWxsIG9yIG1lc3NhZ2UsIGlmIGZ1bGZpbGxlZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja1BsYWNlaG9sZGVyUmVtb3ZlZCgpOiBhbnkge1xyXG4gICAgICAgIGxldCB3ID0gbnVsbDtcclxuICAgICAgICBjb25zdCBzdXNwaWNpb3VzSW5kZXhlcyA9IFtdO1xyXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZU1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlUGxhY2Vob2xkZXJzID0gdGhpcy5zb3VyY2VNZXNzYWdlLmFsbFBsYWNlaG9sZGVycygpO1xyXG4gICAgICAgICAgICBjb25zdCBteVBsYWNlaG9sZGVycyA9IHRoaXMuYWxsUGxhY2Vob2xkZXJzKCk7XHJcbiAgICAgICAgICAgIHNvdXJjZVBsYWNlaG9sZGVycy5mb3JFYWNoKChpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFteVBsYWNlaG9sZGVycy5oYXMoaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VzcGljaW91c0luZGV4ZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3VzcGljaW91c0luZGV4ZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHcgPSAncmVtb3ZlZCBwbGFjZWhvbGRlciAnICsgc3VzcGljaW91c0luZGV4ZXNbMF0gKyAnIGZyb20gb3JpZ2luYWwgbWVzc2FnZSc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdXNwaWNpb3VzSW5kZXhlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxTdXNwaWNpb3VzSW5kZXhlcyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgZmlyc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICBzdXNwaWNpb3VzSW5kZXhlcy5mb3JFYWNoKChpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaXJzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbFN1c3BpY2lvdXNJbmRleGVzID0gYWxsU3VzcGljaW91c0luZGV4ZXMgKyAnLCAnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYWxsU3VzcGljaW91c0luZGV4ZXMgPSBhbGxTdXNwaWNpb3VzSW5kZXhlcyArIGluZGV4O1xyXG4gICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHcgPSAncmVtb3ZlZCBwbGFjZWhvbGRlcnMgJyArIGFsbFN1c3BpY2lvdXNJbmRleGVzICsgJyBmcm9tIG9yaWdpbmFsIG1lc3NhZ2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGZvciBhZGRlZCBJQ1UgTWVzc2FnZSBSZWZzLlxyXG4gICAgICogQHJldHVybiBudWxsIG9yIG1lc3NhZ2UsIGlmIGZ1bGZpbGxlZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0lDVU1lc3NhZ2VSZWZBZGRlZCgpOiBhbnkge1xyXG4gICAgICAgIGxldCBlID0gbnVsbDtcclxuICAgICAgICBjb25zdCBzdXNwaWNpb3VzSW5kZXhlcyA9IFtdO1xyXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZU1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlSUNVUmVmcyA9IHRoaXMuc291cmNlTWVzc2FnZS5hbGxJQ1VNZXNzYWdlUmVmcygpO1xyXG4gICAgICAgICAgICBjb25zdCBteUlDVVJlZnMgPSB0aGlzLmFsbElDVU1lc3NhZ2VSZWZzKCk7XHJcbiAgICAgICAgICAgIG15SUNVUmVmcy5mb3JFYWNoKChpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VJQ1VSZWZzLmhhcyhpbmRleCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdXNwaWNpb3VzSW5kZXhlcy5wdXNoKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdXNwaWNpb3VzSW5kZXhlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgZSA9ICdhZGRlZCBJQ1UgbWVzc2FnZSByZWZlcmVuY2UgJyArIHN1c3BpY2lvdXNJbmRleGVzWzBdICsgJywgd2hpY2ggaXMgbm90IGluIG9yaWdpbmFsIG1lc3NhZ2UnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc3VzcGljaW91c0luZGV4ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsU3VzcGljaW91c0luZGV4ZXMgPSAnJztcclxuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgc3VzcGljaW91c0luZGV4ZXMuZm9yRWFjaCgoaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghZmlyc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxTdXNwaWNpb3VzSW5kZXhlcyA9IGFsbFN1c3BpY2lvdXNJbmRleGVzICsgJywgJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFsbFN1c3BpY2lvdXNJbmRleGVzID0gYWxsU3VzcGljaW91c0luZGV4ZXMgKyBpbmRleDtcclxuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlID0gJ2FkZGVkIElDVSBtZXNzYWdlIHJlZmVyZW5jZXMgJyArIGFsbFN1c3BpY2lvdXNJbmRleGVzICsgJywgd2hpY2ggYXJlIG5vdCBpbiBvcmlnaW5hbCBtZXNzYWdlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBmb3IgcmVtb3ZlZCBJQ1UgTWVzc2FnZSBSZWZzLlxyXG4gICAgICogQHJldHVybiBudWxsIG9yIG1lc3NhZ2UsIGlmIGZ1bGZpbGxlZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0lDVU1lc3NhZ2VSZWZSZW1vdmVkKCk6IGFueSB7XHJcbiAgICAgICAgbGV0IGUgPSBudWxsO1xyXG4gICAgICAgIGNvbnN0IHN1c3BpY2lvdXNJbmRleGVzID0gW107XHJcbiAgICAgICAgaWYgKHRoaXMuc291cmNlTWVzc2FnZSkge1xyXG4gICAgICAgICAgICBjb25zdCBzb3VyY2VJQ1VSZWZzID0gdGhpcy5zb3VyY2VNZXNzYWdlLmFsbElDVU1lc3NhZ2VSZWZzKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG15SUNVUmVmcyA9IHRoaXMuYWxsSUNVTWVzc2FnZVJlZnMoKTtcclxuICAgICAgICAgICAgc291cmNlSUNVUmVmcy5mb3JFYWNoKChpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFteUlDVVJlZnMuaGFzKGluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN1c3BpY2lvdXNJbmRleGVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN1c3BpY2lvdXNJbmRleGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICBlID0gJ3JlbW92ZWQgSUNVIG1lc3NhZ2UgcmVmZXJlbmNlICcgKyBzdXNwaWNpb3VzSW5kZXhlc1swXSArICcgZnJvbSBvcmlnaW5hbCBtZXNzYWdlJztcclxuICAgICAgICB9IGVsc2UgaWYgKHN1c3BpY2lvdXNJbmRleGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgbGV0IGFsbFN1c3BpY2lvdXNJbmRleGVzID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHN1c3BpY2lvdXNJbmRleGVzLmZvckVhY2goKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsU3VzcGljaW91c0luZGV4ZXMgPSBhbGxTdXNwaWNpb3VzSW5kZXhlcyArICcsICc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhbGxTdXNwaWNpb3VzSW5kZXhlcyA9IGFsbFN1c3BpY2lvdXNJbmRleGVzICsgaW5kZXg7XHJcbiAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZSA9ICdyZW1vdmVkIElDVSBtZXNzYWdlIHJlZmVyZW5jZXMgJyArIGFsbFN1c3BpY2lvdXNJbmRleGVzICsgJyBmcm9tIG9yaWdpbmFsIG1lc3NhZ2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbGwgaW5kZXhlcyBvZiBwbGFjZWhvbGRlcnMgdXNlZCBpbiB0aGUgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhbGxQbGFjZWhvbGRlcnMoKTogU2V0PG51bWJlcj4ge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQ8bnVtYmVyPigpO1xyXG4gICAgICAgIHRoaXMucGFydHMoKS5mb3JFYWNoKChwYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09IFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZS5QTEFDRUhPTERFUikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSAoPFBhcnNlZE1lc3NhZ2VQYXJ0UGxhY2Vob2xkZXI+IHBhcnQpLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYWRkKGluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGRpc3AtQXR0cmlidXRlIG9mIHBsYWNlaG9sZGVyXHJcbiAgICAgKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgcGxhY2Vob2xkZXJcclxuICAgICAqIEByZXR1cm4gZGlzcCBvciBudWxsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRQbGFjZWhvbGRlckRpc3AoaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IHBsYWNlSG9sZGVyOiBQYXJzZWRNZXNzYWdlUGFydFBsYWNlaG9sZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBhcnRzKCkuZm9yRWFjaCgocGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocGFydC50eXBlID09PSBQYXJzZWRNZXNzYWdlUGFydFR5cGUuUExBQ0VIT0xERVIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBoUGFydDogUGFyc2VkTWVzc2FnZVBhcnRQbGFjZWhvbGRlciA9IDxQYXJzZWRNZXNzYWdlUGFydFBsYWNlaG9sZGVyPiBwYXJ0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHBoUGFydC5pbmRleCgpID09PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlSG9sZGVyID0gcGhQYXJ0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBsYWNlSG9sZGVyID8gcGxhY2VIb2xkZXIuZGlzcCgpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBhbGwgaW5kZXhlcyBvZiBJQ1UgbWVzc2FnZSByZWZzIHVzZWQgaW4gdGhlIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYWxsSUNVTWVzc2FnZVJlZnMoKTogU2V0PG51bWJlcj4ge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQ8bnVtYmVyPigpO1xyXG4gICAgICAgIHRoaXMucGFydHMoKS5mb3JFYWNoKChwYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09IFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZS5JQ1VfTUVTU0FHRV9SRUYpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gKDxQYXJzZWRNZXNzYWdlUGFydElDVU1lc3NhZ2VSZWY+IHBhcnQpLmluZGV4KCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYWRkKGluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGRpc3AtQXR0cmlidXRlIG9mIGljdSBtZXNzYWdlIHJlZlxyXG4gICAgICogQHBhcmFtIGluZGV4IG9mIHJlZlxyXG4gICAgICogQHJldHVybiBkaXNwIG9yIG51bGxcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldElDVU1lc3NhZ2VSZWZEaXNwKGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBpY3VNZXNzYWdlUmVmUGFydDogUGFyc2VkTWVzc2FnZVBhcnRJQ1VNZXNzYWdlUmVmID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBhcnRzKCkuZm9yRWFjaCgocGFydCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocGFydC50eXBlID09PSBQYXJzZWRNZXNzYWdlUGFydFR5cGUuSUNVX01FU1NBR0VfUkVGKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWZQYXJ0OiBQYXJzZWRNZXNzYWdlUGFydElDVU1lc3NhZ2VSZWYgPSA8UGFyc2VkTWVzc2FnZVBhcnRJQ1VNZXNzYWdlUmVmPiBwYXJ0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlZlBhcnQuaW5kZXgoKSA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpY3VNZXNzYWdlUmVmUGFydCA9IHJlZlBhcnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gaWN1TWVzc2FnZVJlZlBhcnQgPyBpY3VNZXNzYWdlUmVmUGFydC5kaXNwKCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgZm9yIGFkZGVkIHRhZ3MuXHJcbiAgICAgKiBAcmV0dXJuIG51bGwgb3IgbWVzc2FnZSwgaWYgZnVsZmlsbGVkLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoZWNrVGFnQWRkZWQoKTogYW55IHtcclxuICAgICAgICBsZXQgZSA9IG51bGw7XHJcbiAgICAgICAgY29uc3Qgc3VzcGljaW91c1RhZ3MgPSBbXTtcclxuICAgICAgICBpZiAodGhpcy5zb3VyY2VNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZVRhZ3MgPSB0aGlzLnNvdXJjZU1lc3NhZ2UuYWxsVGFncygpO1xyXG4gICAgICAgICAgICBjb25zdCBteVRhZ3MgPSB0aGlzLmFsbFRhZ3MoKTtcclxuICAgICAgICAgICAgbXlUYWdzLmZvckVhY2goKHRhZ05hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghc291cmNlVGFncy5oYXModGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdXNwaWNpb3VzVGFncy5wdXNoKHRhZ05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN1c3BpY2lvdXNUYWdzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICBlID0gJ2FkZGVkIHRhZyA8JyArIHN1c3BpY2lvdXNUYWdzWzBdICsgJz4sIHdoaWNoIGlzIG5vdCBpbiBvcmlnaW5hbCBtZXNzYWdlJztcclxuICAgICAgICB9IGVsc2UgaWYgKHN1c3BpY2lvdXNUYWdzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgbGV0IGFsbFN1c3BpY2lvdXNUYWdzID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHN1c3BpY2lvdXNUYWdzLmZvckVhY2goKHRhZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmaXJzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbFN1c3BpY2lvdXNUYWdzID0gYWxsU3VzcGljaW91c1RhZ3MgKyAnLCAnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYWxsU3VzcGljaW91c1RhZ3MgPSBhbGxTdXNwaWNpb3VzVGFncyArICc8JyArIHRhZyArICc+JztcclxuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlID0gJ2FkZGVkIHRhZ3MgJyArIGFsbFN1c3BpY2lvdXNUYWdzICsgJywgd2hpY2ggYXJlIG5vdCBpbiBvcmlnaW5hbCBtZXNzYWdlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBmb3IgcmVtb3ZlZCB0YWdzLlxyXG4gICAgICogQHJldHVybiBudWxsIG9yIG1lc3NhZ2UsIGlmIGZ1bGZpbGxlZC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja1RhZ1JlbW92ZWQoKTogYW55IHtcclxuICAgICAgICBsZXQgdyA9IG51bGw7XHJcbiAgICAgICAgY29uc3Qgc3VzcGljaW91c1RhZ3MgPSBbXTtcclxuICAgICAgICBpZiAodGhpcy5zb3VyY2VNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZVRhZ3MgPSB0aGlzLnNvdXJjZU1lc3NhZ2UuYWxsVGFncygpO1xyXG4gICAgICAgICAgICBjb25zdCBteVRhZ3MgPSB0aGlzLmFsbFRhZ3MoKTtcclxuICAgICAgICAgICAgc291cmNlVGFncy5mb3JFYWNoKCh0YWdOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW15VGFncy5oYXModGFnTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdXNwaWNpb3VzVGFncy5wdXNoKHRhZ05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN1c3BpY2lvdXNUYWdzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB3ID0gJ3JlbW92ZWQgdGFnIDwnICsgc3VzcGljaW91c1RhZ3NbMF0gKyAnPiBmcm9tIG9yaWdpbmFsIG1lc3NhZ2UnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc3VzcGljaW91c1RhZ3MubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsU3VzcGljaW91c1RhZ3MgPSAnJztcclxuICAgICAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgc3VzcGljaW91c1RhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpcnN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsU3VzcGljaW91c1RhZ3MgPSBhbGxTdXNwaWNpb3VzVGFncyArICcsICc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhbGxTdXNwaWNpb3VzVGFncyA9IGFsbFN1c3BpY2lvdXNUYWdzICsgJzwnICsgdGFnICsgJz4nO1xyXG4gICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHcgPSAncmVtb3ZlZCB0YWdzICcgKyBhbGxTdXNwaWNpb3VzVGFncyArICcgZnJvbSBvcmlnaW5hbCBtZXNzYWdlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgYWxsIHRhZyBuYW1lcyB1c2VkIGluIHRoZSBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFsbFRhZ3MoKTogU2V0PHN0cmluZz4ge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgICAgIHRoaXMucGFydHMoKS5mb3JFYWNoKChwYXJ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09IFBhcnNlZE1lc3NhZ2VQYXJ0VHlwZS5TVEFSVF9UQUcgfHwgcGFydC50eXBlID09PSBQYXJzZWRNZXNzYWdlUGFydFR5cGUuRU1QVFlfVEFHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YWdOYW1lID0gKDxQYXJzZWRNZXNzYWdlUGFydFN0YXJ0VGFnPiBwYXJ0KS50YWdOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYWRkKHRhZ05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFydHMoKTogUGFyc2VkTWVzc2FnZVBhcnRbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFhtbFJlcHJlc2VudGF0aW9uKHhtbFJlcHJlc2VudGF0aW9uOiBFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5feG1sUmVwcmVzZW50YXRpb24gPSB4bWxSZXByZXNlbnRhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBhZGRUZXh0KHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3BhcnRzLnB1c2gobmV3IFBhcnNlZE1lc3NhZ2VQYXJ0VGV4dCh0ZXh0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkUGxhY2Vob2xkZXIoaW5kZXg6IG51bWJlciwgZGlzcDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fcGFydHMucHVzaChuZXcgUGFyc2VkTWVzc2FnZVBhcnRQbGFjZWhvbGRlcihpbmRleCwgZGlzcCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFN0YXJ0VGFnKHRhZ25hbWU6IHN0cmluZywgaWRjb3VudGVyOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKG5ldyBQYXJzZWRNZXNzYWdlUGFydFN0YXJ0VGFnKHRhZ25hbWUsIGlkY291bnRlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEVuZFRhZyh0YWduYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBjaGVjayBpZiB3ZWxsIGZvcm1lZFxyXG4gICAgICAgIGNvbnN0IG9wZW5UYWcgPSB0aGlzLmNhbGN1bGF0ZU9wZW5UYWdOYW1lKCk7XHJcbiAgICAgICAgaWYgKCFvcGVuVGFnIHx8IG9wZW5UYWcgIT09IHRhZ25hbWUpIHtcclxuICAgICAgICAgICAgLy8gb29wcywgbm90IHdlbGwgZm9ybWVkXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXQoJ3VuZXhwZWN0ZWQgY2xvc2UgdGFnICVzIChjdXJyZW50bHkgb3BlbiBpcyAlcywgbmF0aXZlIHhtbCBpcyBcIiVzXCIpJyxcclxuICAgICAgICAgICAgICAgIHRhZ25hbWUsIG9wZW5UYWcsIHRoaXMuYXNOYXRpdmVTdHJpbmcoKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKG5ldyBQYXJzZWRNZXNzYWdlUGFydEVuZFRhZyh0YWduYW1lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkRW1wdHlUYWcodGFnbmFtZTogc3RyaW5nLCBpZGNvdW50ZXI6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3BhcnRzLnB1c2gobmV3IFBhcnNlZE1lc3NhZ2VQYXJ0RW1wdHlUYWcodGFnbmFtZSwgaWRjb3VudGVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkSUNVTWVzc2FnZVJlZihpbmRleDogbnVtYmVyLCBkaXNwKSB7XHJcbiAgICAgICAgdGhpcy5fcGFydHMucHVzaChuZXcgUGFyc2VkTWVzc2FnZVBhcnRJQ1VNZXNzYWdlUmVmKGluZGV4LCBkaXNwKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkSUNVTWVzc2FnZSh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKG5ldyBQYXJzZWRNZXNzYWdlUGFydElDVU1lc3NhZ2UodGV4dCwgdGhpcy5fcGFyc2VyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmUsIHdldGhlciB0aGVyZSBpcyBhbiBvcGVuIHRhZywgdGhhdCBpcyBub3QgY2xvc2VkLlxyXG4gICAgICogUmV0dXJucyB0aGUgbGF0ZXN0IG9uZSBvciBudWxsLCBpZiB0aGVyZSBpcyBubyBvcGVuIHRhZy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVPcGVuVGFnTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG9wZW5UYWdzID0gW107XHJcbiAgICAgICAgdGhpcy5fcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHBhcnQudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBQYXJzZWRNZXNzYWdlUGFydFR5cGUuU1RBUlRfVEFHOlxyXG4gICAgICAgICAgICAgICAgICAgIG9wZW5UYWdzLnB1c2goKDxQYXJzZWRNZXNzYWdlUGFydFN0YXJ0VGFnPiBwYXJ0KS50YWdOYW1lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBQYXJzZWRNZXNzYWdlUGFydFR5cGUuRU5EX1RBRzpcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWdOYW1lID0gKDxQYXJzZWRNZXNzYWdlUGFydEVuZFRhZz4gcGFydCkudGFnTmFtZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcGVuVGFncy5sZW5ndGggPT09IDAgfHwgb3BlblRhZ3Nbb3BlblRhZ3MubGVuZ3RoIC0gMV0gIT09IHRhZ05hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb29wcywgbm90IHdlbGwgZm9ybWVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5UYWcgPSAob3BlblRhZ3MubGVuZ3RoID09PSAwKSA/ICdub3RoaW5nJyA6IG9wZW5UYWdzW29wZW5UYWdzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0KCd1bmV4cGVjdGVkIGNsb3NlIHRhZyAlcyAoY3VycmVudGx5IG9wZW4gaXMgJXMsIG5hdGl2ZSB4bWwgaXMgXCIlc1wiKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdOYW1lLCBvcGVuVGFnLCB0aGlzLmFzTmF0aXZlU3RyaW5nKCkpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgb3BlblRhZ3MucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3BlblRhZ3MubGVuZ3RoID09PSAwID8gbnVsbCA6IG9wZW5UYWdzW29wZW5UYWdzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==