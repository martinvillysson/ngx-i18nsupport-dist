/**
 * Created by martin on 04.06.2017.
 * A tokenizer for ICU messages.
 */
export declare const TEXT = "TEXT";
export declare const CURLY_BRACE_OPEN = "CURLY_BRACE_OPEN";
export declare const CURLY_BRACE_CLOSE = "CURLY_BRACE_CLOSE";
export declare const COMMA = "COMMA";
export declare const PLURAL = "PLURAL";
export declare const SELECT = "SELECT";
export interface ICUToken {
    type: string;
    value: any;
}
export declare class ICUMessageTokenizer {
    private lexer;
    private getLexer;
    private containsNonWhiteSpace;
    tokenize(normalizedMessage: string): ICUToken[];
    input(normalizedMessage: string): void;
    next(): ICUToken;
    peek(): ICUToken;
}
