/**
 * Created by martin on 14.05.2017.
 * A tokenizer for normalized messages.
 */
export declare const TEXT = "TEXT";
export declare const START_TAG = "START_TAG";
export declare const END_TAG = "END_TAG";
export declare const EMPTY_TAG = "EMPTY_TAG";
export declare const PLACEHOLDER = "PLACEHOLDER";
export declare const ICU_MESSAGE_REF = "ICU_MESSAGE_REF";
export declare const ICU_MESSAGE = "ICU_MESSAGE";
export interface Token {
    type: string;
    value: any;
}
export declare class ParsedMesageTokenizer {
    private getLexer;
    tokenize(normalizedMessage: string): Token[];
}
