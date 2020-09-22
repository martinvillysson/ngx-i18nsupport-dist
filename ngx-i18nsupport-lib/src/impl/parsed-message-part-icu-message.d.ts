import { ParsedMessagePart } from './parsed-message-part';
import { IICUMessage } from '../api/index';
import { IMessageParser } from './i-message-parser';
/**
 * Created by martin on 02.06.2017.
 * A message part consisting of an icu message.
 * There can only be one icu message in a parsed message.
 * Syntax of ICU message is '{' <keyname> ',' 'select'|'plural' ',' (<category> '{' text '}')+ '}'
 */
export declare class ParsedMessagePartICUMessage extends ParsedMessagePart {
    private _parser;
    private _message;
    private _messageText;
    private _tokenizer;
    constructor(icuMessageText: string, _parser: IMessageParser);
    /**
     * Test wether text might be an ICU message.
     * Should at least start with something like '{<name>, select, ..' or '{<name>, plural, ...'
     * @param icuMessageText icuMessageText
     * @return wether text might be an ICU message.
     */
    static looksLikeICUMessage(icuMessageText: string): boolean;
    asDisplayString(displayFormat?: string): string;
    /**
     * return the parsed message.
     * @return parsed message
     */
    getICUMessage(): IICUMessage;
    /**
     * Parse the message.
     * @param text message text to parse
     * @throws an error if the syntax is not ok in any way.
     */
    private parseICUMessage;
    /**
     * Parse the message to check, wether it might be an ICU message.
     * Should at least start with something like '{<name>, select, ..' or '{<name>, plural, ...'
     * @param text message text to parse
     */
    private looksLikeICUMessage;
    /**
     * Read next token and expect, that it is of the given type.
     * @param tokentype expected type.
     * @return Token
     * @throws error, if next token has wrong type.
     */
    private expectNext;
    /**
     * Parse XML text to normalized message.
     * @param message message in format dependent xml syntax.
     * @return normalized message
     */
    private parseNativeSubMessage;
}
