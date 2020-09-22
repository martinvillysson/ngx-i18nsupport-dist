import { format, isNullOrUndefined, isString } from 'util';
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
export class ICUMessage {
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
            choiceString = choiceString + format(' %s {%s}', category.getCategory(), category.getMessageNormalized().asNativeString());
        });
        return format('{%s, %s,%s}', varname, type, choiceString);
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
            if (isNullOrUndefined(translationForCategory)) {
                translatedMessage = category.getMessageNormalized();
            }
            else if (isString(translationForCategory)) {
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
                    throw new Error(format('adding a new category not allowed for select messages ("%s" is not part of message)', categoryName));
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
        throw new Error(format('invalid plural category "%s", allowed are =<n> and %s', categoryName, allowedKeywords));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWN1LW1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtaTE4bnN1cHBvcnQtbGliL3NyYy9pbXBsL2ljdS1tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBR3pELE1BQU0sZUFBZTtJQUVqQixZQUFvQixTQUFpQixFQUFVLFFBQTRCO1FBQXZELGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtJQUFHLENBQUM7SUFFeEUsV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRU0sb0JBQW9CO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0NBQ0o7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQU1uQixZQUFvQixPQUF1QixFQUFFLGVBQXdCO1FBQWpELFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFnQixFQUFFLE9BQTJCO1FBQ3JELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksY0FBYztRQUNqQixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUN2RSxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FB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RDs7Ozs7T0FLRztJQUNLLHdCQUF3QixDQUFDLFlBQW9CO1FBQ2pELE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDNUIsT0FBTztTQUNWO1FBQ0QsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssWUFBWSxDQUFDLEVBQUU7WUFDckQsT0FBTztTQUNWO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsdURBQXVELEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDcEgsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJSUNVTWVzc2FnZSwgSUlDVU1lc3NhZ2VDYXRlZ29yeSwgSUlDVU1lc3NhZ2VUcmFuc2xhdGlvbiwgSU5vcm1hbGl6ZWRNZXNzYWdlfSBmcm9tICcuLi9hcGkvaW5kZXgnO1xyXG5pbXBvcnQge2Zvcm1hdCwgaXNOdWxsT3JVbmRlZmluZWQsIGlzU3RyaW5nfSBmcm9tICd1dGlsJztcclxuaW1wb3J0IHtJTWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9pLW1lc3NhZ2UtcGFyc2VyJztcclxuXHJcbmNsYXNzIE1lc3NhZ2VDYXRlZ29yeSBpbXBsZW1lbnRzIElJQ1VNZXNzYWdlQ2F0ZWdvcnkge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2NhdGVnb3J5OiBzdHJpbmcsIHByaXZhdGUgX21lc3NhZ2U6IElOb3JtYWxpemVkTWVzc2FnZSkge31cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q2F0ZWdvcnkoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2F0ZWdvcnk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE1lc3NhZ2VOb3JtYWxpemVkKCk6IElOb3JtYWxpemVkTWVzc2FnZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBhbiBJQ1UgTWVzc2FnZS5cclxuICogQ3JlYXRlZCBieSBtYXJ0aW4gb24gMDUuMDYuMjAxNy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBJQ1VNZXNzYWdlIGltcGxlbWVudHMgSUlDVU1lc3NhZ2Uge1xyXG5cclxuICAgIHByaXZhdGUgX2lzUGx1cmFsTWVzc2FnZTogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIF9jYXRlZ29yaWVzOiBJSUNVTWVzc2FnZUNhdGVnb3J5W107XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyc2VyOiBJTWVzc2FnZVBhcnNlciwgaXNQbHVyYWxNZXNzYWdlOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5faXNQbHVyYWxNZXNzYWdlID0gaXNQbHVyYWxNZXNzYWdlO1xyXG4gICAgICAgIHRoaXMuX2NhdGVnb3JpZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDYXRlZ29yeShjYXRlZ29yeTogc3RyaW5nLCBtZXNzYWdlOiBJTm9ybWFsaXplZE1lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLl9jYXRlZ29yaWVzLnB1c2gobmV3IE1lc3NhZ2VDYXRlZ29yeShjYXRlZ29yeSwgbWVzc2FnZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSUNVIG1lc3NhZ2UgYXMgbmF0aXZlIHN0cmluZy5cclxuICAgICAqIFRoaXMgaXMsIGhvdyBpdCBpcyBzdG9yZWQsIHNvbWV0aGluZyBsaWtlICd7eCwgcGx1cmFsLCA9MCB7Li59J1xyXG4gICAgICogQHJldHVybiBJQ1UgbWVzc2FnZSBhcyBuYXRpdmUgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXNOYXRpdmVTdHJpbmcoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCB2YXJuYW1lID0gKHRoaXMuaXNQbHVyYWxNZXNzYWdlKCkpID8gJ1ZBUl9QTFVSQUwnIDogJ1ZBUl9TRUxFQ1QnO1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSAodGhpcy5pc1BsdXJhbE1lc3NhZ2UoKSkgPyAncGx1cmFsJyA6ICdzZWxlY3QnO1xyXG4gICAgICAgIGxldCBjaG9pY2VTdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLl9jYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5OiBJSUNVTWVzc2FnZUNhdGVnb3J5KSA9PiB7XHJcbiAgICAgICAgICAgIGNob2ljZVN0cmluZyA9IGNob2ljZVN0cmluZyArIGZvcm1hdCgnICVzIHslc30nLCBjYXRlZ29yeS5nZXRDYXRlZ29yeSgpLCBjYXRlZ29yeS5nZXRNZXNzYWdlTm9ybWFsaXplZCgpLmFzTmF0aXZlU3RyaW5nKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3JtYXQoJ3slcywgJXMsJXN9JywgdmFybmFtZSwgdHlwZSwgY2hvaWNlU3RyaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIElzIGl0IGEgcGx1cmFsIG1lc3NhZ2U/XHJcbiAgICAgKi9cclxuICAgIGlzUGx1cmFsTWVzc2FnZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNQbHVyYWxNZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSXMgaXQgYSBzZWxlY3QgbWVzc2FnZT9cclxuICAgICAqL1xyXG4gICAgaXNTZWxlY3RNZXNzYWdlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5faXNQbHVyYWxNZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWxsIHRoZSBwYXJ0cyBvZiB0aGUgbWVzc2FnZS5cclxuICAgICAqIEUuZy4gdGhlIElDVSBtZXNzYWdlIHt3b2x2ZXMsIHBsdXJhbCwgPTAge25vIHdvbHZlc30gPTEge29uZSB3b2xmfSA9MiB7dHdvIHdvbHZlc30gb3RoZXIge2Egd29sZiBwYWNrfX1cclxuICAgICAqIGhhcyA0IGNhdGVnb3J5IG9iamVjdHMgd2l0aCB0aGUgY2F0ZWdvcmllcyA9MCwgPTEsID0yLCBvdGhlci5cclxuICAgICAqL1xyXG4gICAgZ2V0Q2F0ZWdvcmllcygpOiBJSUNVTWVzc2FnZUNhdGVnb3J5W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYXRlZ29yaWVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNsYXRlIG1lc3NhZ2UgYW5kIHJldHVybiBhIG5ldywgdHJhbnNsYXRlZCBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb24gdGhlIHRyYW5zbGF0aW9uIChoYXNobWFwIG9mIGNhdGVnb3JpZXMgYW5kIHRyYW5zbGF0aW9ucykuXHJcbiAgICAgKiBAcmV0dXJuIG5ldyBtZXNzYWdlIHdpdCB0cmFuc2xhdGVkIGNvbnRlbnQuXHJcbiAgICAgKiBAdGhyb3dzIGFuIGVycm9yIGlmIHRyYW5zbGF0aW9uIGRvZXMgbm90IG1hdGNoIHRoZSBtZXNzYWdlLlxyXG4gICAgICogVGhpcyBpcyB0aGUgY2FzZSwgaWYgdGhlcmUgYXJlIGNhdGVnb3JpZXMgbm90IGNvbnRhaW5lZCBpbiB0aGUgb3JpZ2luYWwgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgdHJhbnNsYXRlKHRyYW5zbGF0aW9uOiBJSUNVTWVzc2FnZVRyYW5zbGF0aW9uKTogSUlDVU1lc3NhZ2Uge1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBuZXcgSUNVTWVzc2FnZSh0aGlzLl9wYXJzZXIsIHRoaXMuaXNQbHVyYWxNZXNzYWdlKCkpO1xyXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRDYXRlZ29yaWVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgICAgIHRoaXMuX2NhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnkpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRyYW5zbGF0ZWRNZXNzYWdlOiBJTm9ybWFsaXplZE1lc3NhZ2U7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uRm9yQ2F0ZWdvcnk6IHN0cmluZ3xJSUNVTWVzc2FnZVRyYW5zbGF0aW9uID0gdHJhbnNsYXRpb25bY2F0ZWdvcnkuZ2V0Q2F0ZWdvcnkoKV07XHJcbiAgICAgICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0cmFuc2xhdGlvbkZvckNhdGVnb3J5KSkge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlZE1lc3NhZ2UgPSBjYXRlZ29yeS5nZXRNZXNzYWdlTm9ybWFsaXplZCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHRyYW5zbGF0aW9uRm9yQ2F0ZWdvcnkpKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVkQ2F0ZWdvcmllcy5hZGQoY2F0ZWdvcnkuZ2V0Q2F0ZWdvcnkoKSk7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVkTWVzc2FnZSA9IHRoaXMuX3BhcnNlci5wYXJzZU5vcm1hbGl6ZWRTdHJpbmcoPHN0cmluZz4gdHJhbnNsYXRpb25Gb3JDYXRlZ29yeSwgbnVsbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGVtYmVkZGVkIElDVSBNZXNzYWdlXHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVkTWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVzc2FnZS5hZGRDYXRlZ29yeShjYXRlZ29yeS5nZXRDYXRlZ29yeSgpLCB0cmFuc2xhdGVkTWVzc2FnZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gbmV3IGNhdGVnb3JpZXMsIHdoaWNoIGFyZSBub3QgcGFydCBvZiB0aGUgb3JpZ2luYWwgbWVzc2FnZVxyXG4gICAgICAgIE9iamVjdC5rZXlzKHRyYW5zbGF0aW9uKS5mb3JFYWNoKChjYXRlZ29yeU5hbWUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0cmFuc2xhdGVkQ2F0ZWdvcmllcy5oYXMoY2F0ZWdvcnlOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RNZXNzYWdlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0KCdhZGRpbmcgYSBuZXcgY2F0ZWdvcnkgbm90IGFsbG93ZWQgZm9yIHNlbGVjdCBtZXNzYWdlcyAoXCIlc1wiIGlzIG5vdCBwYXJ0IG9mIG1lc3NhZ2UpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tWYWxpZFBsdXJhbENhdGVnb3J5KGNhdGVnb3J5TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBlbWJlZGRlZCBJQ1UgTWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0cmFuc2xhdGVkTWVzc2FnZSA9IHRoaXMuX3BhcnNlci5wYXJzZU5vcm1hbGl6ZWRTdHJpbmcoPHN0cmluZz4gdHJhbnNsYXRpb25bY2F0ZWdvcnlOYW1lXSwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5hZGRDYXRlZ29yeShjYXRlZ29yeU5hbWUsIHRyYW5zbGF0ZWRNZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2ssIHdldGhlciBjYXRlZ29yeSBpcyB2YWxpZCBwbHVyYWwgY2F0ZWdvcnkuXHJcbiAgICAgKiBBbGxvd2VkIGFyZSA9biwgJ3plcm8nLCAnb25lJywgJ3R3bycsICdmZXcnLCAnbWFueScgYW5kICdvdGhlcidcclxuICAgICAqIEBwYXJhbSBjYXRlZ29yeU5hbWUgY2F0ZWdvcnlcclxuICAgICAqIEB0aHJvd3MgYW4gZXJyb3IsIGlmIGl0IGlzIG5vdCBhIHZhbGlkIGNhdGVnb3J5IG5hbWVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja1ZhbGlkUGx1cmFsQ2F0ZWdvcnkoY2F0ZWdvcnlOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBhbGxvd2VkS2V5d29yZHMgPSBbJ3plcm8nLCAnb25lJywgJ3R3bycsICdmZXcnLCAnbWFueScsICdvdGhlciddO1xyXG4gICAgICAgIGlmIChjYXRlZ29yeU5hbWUubWF0Y2goLz1cXGQrLykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYWxsb3dlZEtleXdvcmRzLmZpbmQoKGtleSkgPT4ga2V5ID09PSBjYXRlZ29yeU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdCgnaW52YWxpZCBwbHVyYWwgY2F0ZWdvcnkgXCIlc1wiLCBhbGxvd2VkIGFyZSA9PG4+IGFuZCAlcycsIGNhdGVnb3J5TmFtZSwgYWxsb3dlZEtleXdvcmRzKSk7XHJcbiAgICB9XHJcbn1cclxuIl19