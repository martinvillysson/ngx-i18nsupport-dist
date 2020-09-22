/**
 * Helper class to parse ngx translate extraction pattern
 * and to decide wether a given message matches the pattern.
 */
export class NgxTranslateExtractionPattern {
    /**
     * Construct the pattern from given description string
     * @param extractionPatternString extractionPatternString
     * @throws an error, if there is a syntax error
     */
    constructor(extractionPatternString) {
        this.extractionPatternString = extractionPatternString;
        const parts = extractionPatternString.split('|');
        this._matchExplicitId = false;
        this._descriptionPatterns = [];
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '@@') {
                if (this._matchExplicitId) {
                    throw new Error('extraction pattern must not contain @@ twice');
                }
                this._matchExplicitId = true;
            }
            else {
                const errorString = this.checkValidDescriptionPattern(part);
                if (errorString) {
                    throw new Error(errorString);
                }
                this._descriptionPatterns.push(part);
            }
        }
    }
    /**
     * Check, wether an explicitly set id matches the pattern.
     * @param id id
     * @return wether an explicitly set id matches the pattern.
     */
    isExplicitIdMatched(id) {
        return id && this._matchExplicitId;
    }
    /**
     * Check, wether a given description matches the pattern.
     * @param description description
     * @return wether a given description matches the pattern.
     */
    isDescriptionMatched(description) {
        return this._descriptionPatterns.indexOf(description) >= 0;
    }
    checkValidDescriptionPattern(descriptionPattern) {
        if (!descriptionPattern) {
            return 'empty value not allowed';
        }
        if (/^[a-zA-Z_][a-zA-Z_-]*$/.test(descriptionPattern)) {
            return null; // it is ok
        }
        else {
            return 'description pattern must be an identifier containing only letters, digits, _ or -';
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXRyYW5zbGF0ZS1leHRyYWN0aW9uLXBhdHRlcm4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy94bGlmZm1lcmdlL3NyYy94bGlmZm1lcmdlL25neC10cmFuc2xhdGUtZXh0cmFjdGlvbi1wYXR0ZXJuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUNILE1BQU0sT0FBTyw2QkFBNkI7SUFLdEM7Ozs7T0FJRztJQUNILFlBQW9CLHVCQUErQjtRQUEvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQVE7UUFDL0MsTUFBTSxLQUFLLEdBQUcsdUJBQXVCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztRQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNmLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7aUJBQ25FO2dCQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7YUFDaEM7aUJBQU07Z0JBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLFdBQVcsRUFBRTtvQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNoQztnQkFDRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hDO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLG1CQUFtQixDQUFDLEVBQVU7UUFDakMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksb0JBQW9CLENBQUMsV0FBbUI7UUFDM0MsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRU8sNEJBQTRCLENBQUMsa0JBQTBCO1FBQzNELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNyQixPQUFPLHlCQUF5QixDQUFDO1NBQ3BDO1FBQ0QsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUNuRCxPQUFPLElBQUksQ0FBQyxDQUFDLFdBQVc7U0FDM0I7YUFBTTtZQUNILE9BQU8sbUZBQW1GLENBQUM7U0FDOUY7SUFDTCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogSGVscGVyIGNsYXNzIHRvIHBhcnNlIG5neCB0cmFuc2xhdGUgZXh0cmFjdGlvbiBwYXR0ZXJuXHJcbiAqIGFuZCB0byBkZWNpZGUgd2V0aGVyIGEgZ2l2ZW4gbWVzc2FnZSBtYXRjaGVzIHRoZSBwYXR0ZXJuLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuIHtcclxuXHJcbiAgICBwcml2YXRlIF9tYXRjaEV4cGxpY2l0SWQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIF9kZXNjcmlwdGlvblBhdHRlcm5zOiBzdHJpbmdbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCB0aGUgcGF0dGVybiBmcm9tIGdpdmVuIGRlc2NyaXB0aW9uIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nIGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nXHJcbiAgICAgKiBAdGhyb3dzIGFuIGVycm9yLCBpZiB0aGVyZSBpcyBhIHN5bnRheCBlcnJvclxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBwYXJ0cyA9IGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nLnNwbGl0KCd8Jyk7XHJcbiAgICAgICAgdGhpcy5fbWF0Y2hFeHBsaWNpdElkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fZGVzY3JpcHRpb25QYXR0ZXJucyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcGFydCA9IHBhcnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAocGFydCA9PT0gJ0BAJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX21hdGNoRXhwbGljaXRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0cmFjdGlvbiBwYXR0ZXJuIG11c3Qgbm90IGNvbnRhaW4gQEAgdHdpY2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX21hdGNoRXhwbGljaXRJZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclN0cmluZyA9IHRoaXMuY2hlY2tWYWxpZERlc2NyaXB0aW9uUGF0dGVybihwYXJ0KTtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvclN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZXNjcmlwdGlvblBhdHRlcm5zLnB1c2gocGFydCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjaywgd2V0aGVyIGFuIGV4cGxpY2l0bHkgc2V0IGlkIG1hdGNoZXMgdGhlIHBhdHRlcm4uXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEByZXR1cm4gd2V0aGVyIGFuIGV4cGxpY2l0bHkgc2V0IGlkIG1hdGNoZXMgdGhlIHBhdHRlcm4uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpc0V4cGxpY2l0SWRNYXRjaGVkKGlkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gaWQgJiYgdGhpcy5fbWF0Y2hFeHBsaWNpdElkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2ssIHdldGhlciBhIGdpdmVuIGRlc2NyaXB0aW9uIG1hdGNoZXMgdGhlIHBhdHRlcm4uXHJcbiAgICAgKiBAcGFyYW0gZGVzY3JpcHRpb24gZGVzY3JpcHRpb25cclxuICAgICAqIEByZXR1cm4gd2V0aGVyIGEgZ2l2ZW4gZGVzY3JpcHRpb24gbWF0Y2hlcyB0aGUgcGF0dGVybi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzRGVzY3JpcHRpb25NYXRjaGVkKGRlc2NyaXB0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVzY3JpcHRpb25QYXR0ZXJucy5pbmRleE9mKGRlc2NyaXB0aW9uKSA+PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tWYWxpZERlc2NyaXB0aW9uUGF0dGVybihkZXNjcmlwdGlvblBhdHRlcm46IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCFkZXNjcmlwdGlvblBhdHRlcm4pIHtcclxuICAgICAgICAgICAgcmV0dXJuICdlbXB0eSB2YWx1ZSBub3QgYWxsb3dlZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgvXlthLXpBLVpfXVthLXpBLVpfLV0qJC8udGVzdChkZXNjcmlwdGlvblBhdHRlcm4pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBpdCBpcyBva1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZGVzY3JpcHRpb24gcGF0dGVybiBtdXN0IGJlIGFuIGlkZW50aWZpZXIgY29udGFpbmluZyBvbmx5IGxldHRlcnMsIGRpZ2l0cywgXyBvciAtJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19