import { NORMALIZATION_FORMAT_NGXTRANSLATE } from '@ngx-i18nsupport/ngx-i18nsupport-lib';
import { FileUtil } from '../common/file-util';
import { isNullOrUndefined } from '../common/util';
import { NgxTranslateExtractionPattern } from './ngx-translate-extraction-pattern';
export class NgxTranslateExtractor {
    constructor(messagesFile, extractionPatternString) {
        this.messagesFile = messagesFile;
        this.extractionPattern = new NgxTranslateExtractionPattern(extractionPatternString);
    }
    /**
     * Check, wether extractionPattern has valid syntax.
     * @param extractionPatternString extractionPatternString
     * @return null, if pattern is ok, string describing the error, if it is not ok.
     */
    static checkPattern(extractionPatternString) {
        try {
            if (new NgxTranslateExtractionPattern(extractionPatternString)) {
                return null;
            }
        }
        catch (error) {
            return error.message;
        }
        return null;
    }
    static extract(messagesFile, extractionPattern, outputFile) {
        new NgxTranslateExtractor(messagesFile, extractionPattern).extractTo(outputFile);
    }
    /**
     * Extact messages and write them to a file.
     * @param outputFile outputFile
     */
    extractTo(outputFile) {
        const translations = this.toNgxTranslations(this.extract());
        if (translations && Object.keys(translations).length > 0) {
            FileUtil.replaceContent(outputFile, JSON.stringify(translations, null, 4), 'UTF-8');
        }
        else {
            if (FileUtil.exists(outputFile)) {
                FileUtil.deleteFile(outputFile);
            }
        }
    }
    /**
     *  Extract messages and convert them to ngx translations.
     *  @return the translation objects.
     */
    extract() {
        const result = [];
        this.messagesFile.forEachTransUnit((tu) => {
            const ngxId = this.ngxTranslateIdFromTU(tu);
            if (ngxId) {
                const messagetext = tu.targetContentNormalized().asDisplayString(NORMALIZATION_FORMAT_NGXTRANSLATE);
                result.push({ id: ngxId, message: messagetext });
            }
        });
        return result;
    }
    /**
     * Check, wether this tu should be extracted for ngx-translate usage, and return its id for ngx-translate.
     * There are 2 possibilities:
     * 1. description is set to "ngx-translate" and meaning contains the id.
     * 2. id is explicitly set to a string.
     * @param tu tu
     * @return an ngx id or null, if this tu should not be extracted.
     */
    ngxTranslateIdFromTU(tu) {
        if (this.isExplicitlySetId(tu.id)) {
            if (this.extractionPattern.isExplicitIdMatched(tu.id)) {
                return tu.id;
            }
            else {
                return null;
            }
        }
        const description = tu.description();
        if (description && this.extractionPattern.isDescriptionMatched(description)) {
            return tu.meaning();
        }
    }
    /**
     * Test, wether ID was explicitly set (via i18n="@myid).
     * Just heuristic, an ID is explicitly, if it does not look like a generated one.
     * @param id id
     * @return wether ID was explicitly set (via i18n="@myid).
     */
    isExplicitlySetId(id) {
        if (isNullOrUndefined(id)) {
            return false;
        }
        // generated IDs are either decimal or sha1 hex
        const reForGeneratedId = /^[0-9a-f]{11,}$/;
        return !reForGeneratedId.test(id);
    }
    /**
     * Convert list of relevant TUs to ngx translations object.
     * @param msgList msgList
     */
    toNgxTranslations(msgList) {
        const translationObject = {};
        msgList.forEach((msg) => {
            this.putInTranslationObject(translationObject, msg);
        });
        return translationObject;
    }
    /**
     * Put a new messages into the translation data object.
     * If you add, e.g. "{id: 'myapp.example', message: 'test'}",
     * the translation object will then contain an object myapp that has property example:
     * {myapp: {
     *   example: 'test'
     *   }}
     * @param translationObject translationObject
     * @param msg msg
     */
    putInTranslationObject(translationObject, msg) {
        let firstPartOfId;
        let restOfId;
        const indexOfDot = msg.id.indexOf('.');
        if (indexOfDot === 0 || indexOfDot === (msg.id.length - 1)) {
            throw new Error('bad nxg-translate id "' + msg.id + '"');
        }
        if (indexOfDot < 0) {
            firstPartOfId = msg.id;
            restOfId = '';
        }
        else {
            firstPartOfId = msg.id.substring(0, indexOfDot);
            restOfId = msg.id.substring(indexOfDot + 1);
        }
        let object = translationObject[firstPartOfId];
        if (isNullOrUndefined(object)) {
            if (restOfId === '') {
                translationObject[firstPartOfId] = msg.message;
                return;
            }
            object = {};
            translationObject[firstPartOfId] = object;
        }
        else {
            if (restOfId === '') {
                throw new Error('duplicate id praefix "' + msg.id + '"');
            }
        }
        this.putInTranslationObject(object, { id: restOfId, message: msg.message });
    }
}
NgxTranslateExtractor.DefaultExtractionPattern = '@@|ngx-translate';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXRyYW5zbGF0ZS1leHRyYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy94bGlmZm1lcmdlL3NyYy94bGlmZm1lcmdlL25neC10cmFuc2xhdGUtZXh0cmFjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUMsaUNBQWlDLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUM3SCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLDZCQUE2QixFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUF3QmpGLE1BQU0sT0FBTyxxQkFBcUI7SUF5QjlCLFlBQW9CLFlBQXNDLEVBQUUsdUJBQStCO1FBQXZFLGlCQUFZLEdBQVosWUFBWSxDQUEwQjtRQUN0RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUF0QkQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsdUJBQStCO1FBQ3RELElBQUk7WUFDRixJQUFJLElBQUksNkJBQTZCLENBQUMsdUJBQXVCLENBQUMsRUFBRTtnQkFDNUQsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNGO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7U0FDeEI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFzQyxFQUFFLGlCQUF5QixFQUFFLFVBQWtCO1FBQ3ZHLElBQUkscUJBQXFCLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFNRDs7O09BR0c7SUFDSSxTQUFTLENBQUMsVUFB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Qzs7QUFqSmEsOENBQXdCLEdBQUcsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0lUcmFuc2xhdGlvbk1lc3NhZ2VzRmlsZSwgSVRyYW5zVW5pdCwgTk9STUFMSVpBVElPTl9GT1JNQVRfTkdYVFJBTlNMQVRFfSBmcm9tICdAbmd4LWkxOG5zdXBwb3J0L25neC1pMThuc3VwcG9ydC1saWInO1xyXG5pbXBvcnQge0ZpbGVVdGlsfSBmcm9tICcuLi9jb21tb24vZmlsZS11dGlsJztcclxuaW1wb3J0IHtpc051bGxPclVuZGVmaW5lZH0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xyXG5pbXBvcnQge05neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJufSBmcm9tICcuL25neC10cmFuc2xhdGUtZXh0cmFjdGlvbi1wYXR0ZXJuJztcclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgcm9vYm0gb24gMTUuMDMuMjAxNy5cclxuICogQSB0b29sIGZvciBleHRyYWN0aW5nIG1lc3NhZ2VzIGluIG5neC10cmFuc2xhdGUgZm9ybWF0LlxyXG4gKiBHZW5lcmF0ZXMgYSBqc29uLWZpbGUgdG8gYmUgdXNlZCB3aXRoIG5neC10cmFuc2xhdGUuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoZSBpbnRlcmZhY2UgdXNlZCBmb3IgdHJhbnNsYXRpb25zIGluIG5neC10cmFuc2xhdGUuXHJcbiAqIEEgaGFzaCB0aGF0IGNvbnRhaW5zIGVpdGhlciB0aGUgdHJhbnNsYXRpb24gb3IgYW5vdGhlciBoYXNoLlxyXG4gKi9cclxuaW50ZXJmYWNlIE5neFRyYW5zbGF0aW9ucyB7XHJcbiAgICBbaWQ6IHN0cmluZ106IE5neFRyYW5zbGF0aW9ucyB8IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIGludGVybmFsLFxyXG4gKiBhIG1lc3NhZ2Ugd2l0aCBpZCAoYSBkb3Qtc2VwYXJhdGVkIHN0cmluZykuXHJcbiAqL1xyXG5pbnRlcmZhY2UgTmd4TWVzc2FnZSB7XHJcbiAgICBpZDogc3RyaW5nOyAvLyBkb3Qgc2VwYXJhdGVkIG5hbWUsIGUuZy4gXCJteWFwcC5zZXJ2aWNlMS5tZXNzYWdlMVwiXHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7IC8vIHRoZSBtZXNzYWdlLCBwbGFjZWhvbGRlciBhcmUgaW4ge3tufX0gc3ludGF4LCBlLmcuIFwiYSB0ZXN0IHdpdGggdmFsdWU6IHt7MH19XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOZ3hUcmFuc2xhdGVFeHRyYWN0b3Ige1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgRGVmYXVsdEV4dHJhY3Rpb25QYXR0ZXJuID0gJ0BAfG5neC10cmFuc2xhdGUnO1xyXG4gICAgcHJpdmF0ZSBleHRyYWN0aW9uUGF0dGVybjogTmd4VHJhbnNsYXRlRXh0cmFjdGlvblBhdHRlcm47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjaywgd2V0aGVyIGV4dHJhY3Rpb25QYXR0ZXJuIGhhcyB2YWxpZCBzeW50YXguXHJcbiAgICAgKiBAcGFyYW0gZXh0cmFjdGlvblBhdHRlcm5TdHJpbmcgZXh0cmFjdGlvblBhdHRlcm5TdHJpbmdcclxuICAgICAqIEByZXR1cm4gbnVsbCwgaWYgcGF0dGVybiBpcyBvaywgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGVycm9yLCBpZiBpdCBpcyBub3Qgb2suXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2hlY2tQYXR0ZXJuKGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAobmV3IE5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuKGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3QobWVzc2FnZXNGaWxlOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUsIGV4dHJhY3Rpb25QYXR0ZXJuOiBzdHJpbmcsIG91dHB1dEZpbGU6IHN0cmluZykge1xyXG4gICAgICAgIG5ldyBOZ3hUcmFuc2xhdGVFeHRyYWN0b3IobWVzc2FnZXNGaWxlLCBleHRyYWN0aW9uUGF0dGVybikuZXh0cmFjdFRvKG91dHB1dEZpbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVzc2FnZXNGaWxlOiBJVHJhbnNsYXRpb25NZXNzYWdlc0ZpbGUsIGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmV4dHJhY3Rpb25QYXR0ZXJuID0gbmV3IE5neFRyYW5zbGF0ZUV4dHJhY3Rpb25QYXR0ZXJuKGV4dHJhY3Rpb25QYXR0ZXJuU3RyaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEV4dGFjdCBtZXNzYWdlcyBhbmQgd3JpdGUgdGhlbSB0byBhIGZpbGUuXHJcbiAgICAgKiBAcGFyYW0gb3V0cHV0RmlsZSBvdXRwdXRGaWxlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBleHRyYWN0VG8ob3V0cHV0RmlsZTogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb25zOiBOZ3hUcmFuc2xhdGlvbnMgPSB0aGlzLnRvTmd4VHJhbnNsYXRpb25zKHRoaXMuZXh0cmFjdCgpKTtcclxuICAgICAgICBpZiAodHJhbnNsYXRpb25zICYmIE9iamVjdC5rZXlzKHRyYW5zbGF0aW9ucykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBGaWxlVXRpbC5yZXBsYWNlQ29udGVudChvdXRwdXRGaWxlLCBKU09OLnN0cmluZ2lmeSh0cmFuc2xhdGlvbnMsIG51bGwsIDQpLCAnVVRGLTgnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoRmlsZVV0aWwuZXhpc3RzKG91dHB1dEZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICBGaWxlVXRpbC5kZWxldGVGaWxlKG91dHB1dEZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIEV4dHJhY3QgbWVzc2FnZXMgYW5kIGNvbnZlcnQgdGhlbSB0byBuZ3ggdHJhbnNsYXRpb25zLlxyXG4gICAgICogIEByZXR1cm4gdGhlIHRyYW5zbGF0aW9uIG9iamVjdHMuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZXh0cmFjdCgpOiBOZ3hNZXNzYWdlW10ge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdDogTmd4TWVzc2FnZVtdID0gW107XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlc0ZpbGUuZm9yRWFjaFRyYW5zVW5pdCgodHU6IElUcmFuc1VuaXQpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgbmd4SWQgPSB0aGlzLm5neFRyYW5zbGF0ZUlkRnJvbVRVKHR1KTtcclxuICAgICAgICAgICAgaWYgKG5neElkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdldGV4dCA9IHR1LnRhcmdldENvbnRlbnROb3JtYWxpemVkKCkuYXNEaXNwbGF5U3RyaW5nKE5PUk1BTElaQVRJT05fRk9STUFUX05HWFRSQU5TTEFURSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7aWQ6IG5neElkLCBtZXNzYWdlOiBtZXNzYWdldGV4dH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrLCB3ZXRoZXIgdGhpcyB0dSBzaG91bGQgYmUgZXh0cmFjdGVkIGZvciBuZ3gtdHJhbnNsYXRlIHVzYWdlLCBhbmQgcmV0dXJuIGl0cyBpZCBmb3Igbmd4LXRyYW5zbGF0ZS5cclxuICAgICAqIFRoZXJlIGFyZSAyIHBvc3NpYmlsaXRpZXM6XHJcbiAgICAgKiAxLiBkZXNjcmlwdGlvbiBpcyBzZXQgdG8gXCJuZ3gtdHJhbnNsYXRlXCIgYW5kIG1lYW5pbmcgY29udGFpbnMgdGhlIGlkLlxyXG4gICAgICogMi4gaWQgaXMgZXhwbGljaXRseSBzZXQgdG8gYSBzdHJpbmcuXHJcbiAgICAgKiBAcGFyYW0gdHUgdHVcclxuICAgICAqIEByZXR1cm4gYW4gbmd4IGlkIG9yIG51bGwsIGlmIHRoaXMgdHUgc2hvdWxkIG5vdCBiZSBleHRyYWN0ZWQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbmd4VHJhbnNsYXRlSWRGcm9tVFUodHU6IElUcmFuc1VuaXQpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0aGlzLmlzRXhwbGljaXRseVNldElkKHR1LmlkKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5leHRyYWN0aW9uUGF0dGVybi5pc0V4cGxpY2l0SWRNYXRjaGVkKHR1LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR1LmlkO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0dS5kZXNjcmlwdGlvbigpO1xyXG4gICAgICAgIGlmIChkZXNjcmlwdGlvbiAmJiB0aGlzLmV4dHJhY3Rpb25QYXR0ZXJuLmlzRGVzY3JpcHRpb25NYXRjaGVkKGRlc2NyaXB0aW9uKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHUubWVhbmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlc3QsIHdldGhlciBJRCB3YXMgZXhwbGljaXRseSBzZXQgKHZpYSBpMThuPVwiQG15aWQpLlxyXG4gICAgICogSnVzdCBoZXVyaXN0aWMsIGFuIElEIGlzIGV4cGxpY2l0bHksIGlmIGl0IGRvZXMgbm90IGxvb2sgbGlrZSBhIGdlbmVyYXRlZCBvbmUuXHJcbiAgICAgKiBAcGFyYW0gaWQgaWRcclxuICAgICAqIEByZXR1cm4gd2V0aGVyIElEIHdhcyBleHBsaWNpdGx5IHNldCAodmlhIGkxOG49XCJAbXlpZCkuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaXNFeHBsaWNpdGx5U2V0SWQoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBnZW5lcmF0ZWQgSURzIGFyZSBlaXRoZXIgZGVjaW1hbCBvciBzaGExIGhleFxyXG4gICAgICAgIGNvbnN0IHJlRm9yR2VuZXJhdGVkSWQgPSAvXlswLTlhLWZdezExLH0kLztcclxuICAgICAgICByZXR1cm4gIXJlRm9yR2VuZXJhdGVkSWQudGVzdChpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGxpc3Qgb2YgcmVsZXZhbnQgVFVzIHRvIG5neCB0cmFuc2xhdGlvbnMgb2JqZWN0LlxyXG4gICAgICogQHBhcmFtIG1zZ0xpc3QgbXNnTGlzdFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRvTmd4VHJhbnNsYXRpb25zKG1zZ0xpc3Q6IE5neE1lc3NhZ2VbXSk6IE5neFRyYW5zbGF0aW9ucyB7XHJcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb25PYmplY3Q6IE5neFRyYW5zbGF0aW9ucyA9IHt9O1xyXG4gICAgICAgIG1zZ0xpc3QuZm9yRWFjaCgobXNnOiBOZ3hNZXNzYWdlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucHV0SW5UcmFuc2xhdGlvbk9iamVjdCh0cmFuc2xhdGlvbk9iamVjdCwgbXNnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJhbnNsYXRpb25PYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQdXQgYSBuZXcgbWVzc2FnZXMgaW50byB0aGUgdHJhbnNsYXRpb24gZGF0YSBvYmplY3QuXHJcbiAgICAgKiBJZiB5b3UgYWRkLCBlLmcuIFwie2lkOiAnbXlhcHAuZXhhbXBsZScsIG1lc3NhZ2U6ICd0ZXN0J31cIixcclxuICAgICAqIHRoZSB0cmFuc2xhdGlvbiBvYmplY3Qgd2lsbCB0aGVuIGNvbnRhaW4gYW4gb2JqZWN0IG15YXBwIHRoYXQgaGFzIHByb3BlcnR5IGV4YW1wbGU6XHJcbiAgICAgKiB7bXlhcHA6IHtcclxuICAgICAqICAgZXhhbXBsZTogJ3Rlc3QnXHJcbiAgICAgKiAgIH19XHJcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb25PYmplY3QgdHJhbnNsYXRpb25PYmplY3RcclxuICAgICAqIEBwYXJhbSBtc2cgbXNnXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcHV0SW5UcmFuc2xhdGlvbk9iamVjdCh0cmFuc2xhdGlvbk9iamVjdDogTmd4VHJhbnNsYXRpb25zLCBtc2c6IE5neE1lc3NhZ2UpIHtcclxuICAgICAgICBsZXQgZmlyc3RQYXJ0T2ZJZDogc3RyaW5nO1xyXG4gICAgICAgIGxldCByZXN0T2ZJZDogc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IGluZGV4T2ZEb3QgPSBtc2cuaWQuaW5kZXhPZignLicpO1xyXG4gICAgICAgIGlmIChpbmRleE9mRG90ID09PSAwIHx8IGluZGV4T2ZEb3QgPT09IChtc2cuaWQubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgbnhnLXRyYW5zbGF0ZSBpZCBcIicgKyBtc2cuaWQgKyAnXCInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluZGV4T2ZEb3QgPCAwKSB7XHJcbiAgICAgICAgICAgIGZpcnN0UGFydE9mSWQgPSBtc2cuaWQ7XHJcbiAgICAgICAgICAgIHJlc3RPZklkID0gJyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlyc3RQYXJ0T2ZJZCA9IG1zZy5pZC5zdWJzdHJpbmcoMCwgaW5kZXhPZkRvdCk7XHJcbiAgICAgICAgICAgIHJlc3RPZklkID0gbXNnLmlkLnN1YnN0cmluZyhpbmRleE9mRG90ICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvYmplY3QgPSB0cmFuc2xhdGlvbk9iamVjdFtmaXJzdFBhcnRPZklkXTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQob2JqZWN0KSkge1xyXG4gICAgICAgICAgICBpZiAocmVzdE9mSWQgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbk9iamVjdFtmaXJzdFBhcnRPZklkXSA9IG1zZy5tZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbk9iamVjdFtmaXJzdFBhcnRPZklkXSA9IG9iamVjdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAocmVzdE9mSWQgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBpZCBwcmFlZml4IFwiJyArIG1zZy5pZCArICdcIicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHV0SW5UcmFuc2xhdGlvbk9iamVjdCg8Tmd4VHJhbnNsYXRpb25zPiBvYmplY3QsIHtpZDogcmVzdE9mSWQsIG1lc3NhZ2U6IG1zZy5tZXNzYWdlfSk7XHJcbiAgICB9XHJcbn1cclxuIl19