"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICUMessage = void 0;
const util_1 = require("util");
class MessageCategory {
    constructor(_category, _message) {
        this._category = _category;
        this._message = _message;
    }
    getCategory() {
        return this._category;
    }
    getMessageNormalized() {
        return this._message;
    }
}
/**
 * Implementation of an ICU Message.
 * Created by martin on 05.06.2017.
 */
class ICUMessage {
    constructor(_parser, isPluralMessage) {
        this._parser = _parser;
        this._isPluralMessage = isPluralMessage;
        this._categories = [];
    }
    addCategory(category, message) {
        this._categories.push(new MessageCategory(category, message));
    }
    /**
     * ICU message as native string.
     * This is, how it is stored, something like '{x, plural, =0 {..}'
     * @return ICU message as native string.
     */
    asNativeString() {
        const varname = (this.isPluralMessage()) ? 'VAR_PLURAL' : 'VAR_SELECT';
        const type = (this.isPluralMessage()) ? 'plural' : 'select';
        let choiceString = '';
        this._categories.forEach((category) => {
            choiceString = choiceString + util_1.format(' %s {%s}', category.getCategory(), category.getMessageNormalized().asNativeString());
        });
        return util_1.format('{%s, %s,%s}', varname, type, choiceString);
    }
    /**
     * Is it a plural message?
     */
    isPluralMessage() {
        return this._isPluralMessage;
    }
    /**
     * Is it a select message?
     */
    isSelectMessage() {
        return !this._isPluralMessage;
    }
    /**
     * All the parts of the message.
     * E.g. the ICU message {wolves, plural, =0 {no wolves} =1 {one wolf} =2 {two wolves} other {a wolf pack}}
     * has 4 category objects with the categories =0, =1, =2, other.
     */
    getCategories() {
        return this._categories;
    }
    /**
     * Translate message and return a new, translated message
     * @param translation the translation (hashmap of categories and translations).
     * @return new message wit translated content.
     * @throws an error if translation does not match the message.
     * This is the case, if there are categories not contained in the original message.
     */
    translate(translation) {
        const message = new ICUMessage(this._parser, this.isPluralMessage());
        const translatedCategories = new Set();
        this._categories.forEach((category) => {
            let translatedMessage;
            const translationForCategory = translation[category.getCategory()];
            if (util_1.isNullOrUndefined(translationForCategory)) {
                translatedMessage = category.getMessageNormalized();
            }
            else if (util_1.isString(translationForCategory)) {
                translatedCategories.add(category.getCategory());
                translatedMessage = this._parser.parseNormalizedString(translationForCategory, null);
            }
            else {
                // TODO embedded ICU Message
                translatedMessage = null;
            }
            message.addCategory(category.getCategory(), translatedMessage);
        });
        // new categories, which are not part of the original message
        Object.keys(translation).forEach((categoryName) => {
            if (!translatedCategories.has(categoryName)) {
                if (this.isSelectMessage()) {
                    throw new Error(util_1.format('adding a new category not allowed for select messages ("%s" is not part of message)', categoryName));
                }
                else {
                    this.checkValidPluralCategory(categoryName);
                    // TODO embedded ICU Message
                    let translatedMessage = this._parser.parseNormalizedString(translation[categoryName], null);
                    message.addCategory(categoryName, translatedMessage);
                }
            }
        });
        return message;
    }
    /**
     * Check, wether category is valid plural category.
     * Allowed are =n, 'zero', 'one', 'two', 'few', 'many' and 'other'
     * @param categoryName category
     * @throws an error, if it is not a valid category name
     */
    checkValidPluralCategory(categoryName) {
        const allowedKeywords = ['zero', 'one', 'two', 'few', 'many', 'other'];
        if (categoryName.match(/=\d+/)) {
            return;
        }
        if (allowedKeywords.find((key) => key === categoryName)) {
            return;
        }
        throw new Error(util_1.format('invalid plural category "%s", allowed are =<n> and %s', categoryName, allowedKeywords));
    }
}
exports.ICUMessage = ICUMessage;
//# sourceMappingURL=icu-message.js.map