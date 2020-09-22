/**
 * Created by martin on 05.05.2017.
 * A part of a parsed message.
 * Can be a text, a placeholder, a tag
 */
export declare enum ParsedMessagePartType {
    TEXT = 0,
    PLACEHOLDER = 1,
    START_TAG = 2,
    END_TAG = 3,
    EMPTY_TAG = 4,
    ICU_MESSAGE = 5,
    ICU_MESSAGE_REF = 6
}
export declare abstract class ParsedMessagePart {
    type: ParsedMessagePartType;
    constructor(type: ParsedMessagePartType);
    /**
     * String representation of the part.
     * @param format optional way to determine the exact syntax.
     * Allowed formats are defined as constants NORMALIZATION_FORMAT...
     */
    abstract asDisplayString(format?: string): string;
}
