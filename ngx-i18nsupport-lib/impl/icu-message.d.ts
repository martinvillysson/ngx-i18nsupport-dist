import { IICUMessage, IICUMessageCategory, IICUMessageTranslation, INormalizedMessage } from '../api/index';
import { IMessageParser } from './i-message-parser';
/**
 * Implementation of an ICU Message.
 * Created by martin on 05.06.2017.
 */
export declare class ICUMessage implements IICUMessage {
    private _parser;
    private _isPluralMessage;
    private _categories;
    constructor(_parser: IMessageParser, isPluralMessage: boolean);
    addCategory(category: string, message: INormalizedMessage): void;
    /**
     * ICU message as native string.
     * This is, how it is stored, something like '{x, plural, =0 {..}'
     * @return ICU message as native string.
     */
    asNativeString(): string;
    /**
     * Is it a plural message?
     */
    isPluralMessage(): boolean;
    /**
     * Is it a select message?
     */
    isSelectMessage(): boolean;
    /**
     * All the parts of the message.
     * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
     * has 4 category objects with the categories =0, =1, =2, other.
     */
    getCategories(): IICUMessageCategory[];
    /**
     * Translate message and return a new, translated message
     * @param translation the translation (hashmap of categories and translations).
     * @return new message wit translated content.
     * @throws an error if translation does not match the message.
     * This is the case, if there are categories not contained in the original message.
     */
    translate(translation: IICUMessageTranslation): IICUMessage;
    /**
     * Check, wether category is valid plural category.
     * Allowed are =n, 'zero', 'one', 'two', 'few', 'many' and 'other'
     * @param categoryName category
     * @throws an error, if it is not a valid category name
     */
    private checkValidPluralCategory;
}
