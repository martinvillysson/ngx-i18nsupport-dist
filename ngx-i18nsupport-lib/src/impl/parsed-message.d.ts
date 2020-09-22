import { ParsedMessagePart } from './parsed-message-part';
import { INormalizedMessage, ValidationErrors } from '../api/i-normalized-message';
import { IMessageParser } from './i-message-parser';
import { IICUMessage, IICUMessageTranslation } from '../api/i-icu-message';
/**
 * Created by martin on 05.05.2017.
 * A message text read from a translation file.
 * Can contain placeholders, tags, text.
 * This class is a representation independent of the concrete format.
 */
export declare class ParsedMessage implements INormalizedMessage {
    /**
     * Parser that created this message (determines the native format).
     */
    private _parser;
    /**
     * The message where this one stems from as translation.
     * Optional, set only for messages created by calling translate.
     */
    private sourceMessage;
    /**
     * The parts of the message.
     */
    private _parts;
    /**
     * messages xml representation.
     */
    private _xmlRepresentation;
    constructor(parser: IMessageParser, sourceMessage: ParsedMessage);
    /**
     * Get the parser (for tests only, not part of API)
     * @return parser
     */
    getParser(): IMessageParser;
    /**
     * Create a new normalized message as a translation of this one.
     * @param normalizedString the translation in normalized form.
     * If the message is an ICUMessage (getICUMessage returns a value), use translateICUMessage instead.
     * @throws an error if normalized string is not well formed.
     * Throws an error too, if this is an ICU message.
     */
    translate(normalizedString: string): INormalizedMessage;
    /**
     * Create a new normalized icu message as a translation of this one.
     * @param icuTranslation the translation, this is the translation of the ICU message,
     * which is not a string, but a collections of the translations of the different categories.
     * The message must be an ICUMessage (getICUMessage returns a value)
     * @throws an error if normalized string is not well formed.
     * Throws an error too, if this is not an ICU message.
     */
    translateICUMessage(icuTranslation: IICUMessageTranslation): INormalizedMessage;
    /**
     * Create a new normalized message from a native xml string as a translation of this one.
     * @param nativeString xml string in the format of the underlying file format.
     * Throws an error if native string is not acceptable.
     */
    translateNativeString(nativeString: string): INormalizedMessage;
    /**
     * normalized message as string.
     * @param displayFormat optional way to determine the exact syntax.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     */
    asDisplayString(displayFormat?: string): string;
    /**
     * Returns the message content as format dependent native string.
     * Includes all format specific markup like <ph id="INTERPOLATION" ../> ..
     */
    asNativeString(): string;
    /**
     * Validate the message.
     * @return null, if ok, error object otherwise.
     */
    validate(): ValidationErrors | null;
    /**
     * Validate the message, check for warnings only.
     * A warning shows, that the message is acceptable, but misses something.
     * E.g. if you remove a placeholder or a special tag from the original message, this generates a warning.
     * @return null, if no warning, warnings as error object otherwise.
     */
    validateWarnings(): ValidationErrors | null;
    /**
     * Test wether this message is an ICU message.
     * @return true, if it is an ICU message.
     */
    isICUMessage(): boolean;
    /**
     * Test wether this message contains an ICU message reference.
     * ICU message references are something like <x ID="ICU"../>.
     * @return true, if there is an ICU message reference in the message.
     */
    containsICUMessageRef(): boolean;
    /**
     * If this message is an ICU message, returns its structure.
     * Otherwise this method returns null.
     * @return ICUMessage or null.
     */
    getICUMessage(): IICUMessage;
    /**
     * Check for added placeholder.
     * @return null or message, if fulfilled.
     */
    private checkPlaceholderAdded;
    /**
     * Check for removed placeholder.
     * @return null or message, if fulfilled.
     */
    private checkPlaceholderRemoved;
    /**
     * Check for added ICU Message Refs.
     * @return null or message, if fulfilled.
     */
    private checkICUMessageRefAdded;
    /**
     * Check for removed ICU Message Refs.
     * @return null or message, if fulfilled.
     */
    private checkICUMessageRefRemoved;
    /**
     * Get all indexes of placeholders used in the message.
     */
    private allPlaceholders;
    /**
     * Return the disp-Attribute of placeholder
     * @param index index of placeholder
     * @return disp or null
     */
    getPlaceholderDisp(index: number): string;
    /**
     * Get all indexes of ICU message refs used in the message.
     */
    private allICUMessageRefs;
    /**
     * Return the disp-Attribute of icu message ref
     * @param index of ref
     * @return disp or null
     */
    getICUMessageRefDisp(index: number): string;
    /**
     * Check for added tags.
     * @return null or message, if fulfilled.
     */
    private checkTagAdded;
    /**
     * Check for removed tags.
     * @return null or message, if fulfilled.
     */
    private checkTagRemoved;
    /**
     * Get all tag names used in the message.
     */
    private allTags;
    parts(): ParsedMessagePart[];
    setXmlRepresentation(xmlRepresentation: Element): void;
    addText(text: string): void;
    addPlaceholder(index: number, disp: string): void;
    addStartTag(tagname: string, idcounter: number): void;
    addEndTag(tagname: string): void;
    addEmptyTag(tagname: string, idcounter: number): void;
    addICUMessageRef(index: number, disp: any): void;
    addICUMessage(text: string): void;
    /**
     * Determine, wether there is an open tag, that is not closed.
     * Returns the latest one or null, if there is no open tag.
     */
    private calculateOpenTagName;
}
