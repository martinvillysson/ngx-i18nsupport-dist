"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgxTranslateExtractor = void 0;
const ngx_i18nsupport_lib_1 = require("@ngx-i18nsupport/ngx-i18nsupport-lib");
const file_util_1 = require("../common/file-util");
const util_1 = require("../common/util");
const ngx_translate_extraction_pattern_1 = require("./ngx-translate-extraction-pattern");
class NgxTranslateExtractor {
    constructor(messagesFile, extractionPatternString) {
        this.messagesFile = messagesFile;
        this.extractionPattern = new ngx_translate_extraction_pattern_1.NgxTranslateExtractionPattern(extractionPatternString);
    }
    /**
     * Check, wether extractionPattern has valid syntax.
     * @param extractionPatternString extractionPatternString
     * @return null, if pattern is ok, string describing the error, if it is not ok.
     */
    static checkPattern(extractionPatternString) {
        try {
            if (new ngx_translate_extraction_pattern_1.NgxTranslateExtractionPattern(extractionPatternString)) {
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
            file_util_1.FileUtil.replaceContent(outputFile, JSON.stringify(translations, null, 4), 'UTF-8');
        }
        else {
            if (file_util_1.FileUtil.exists(outputFile)) {
                file_util_1.FileUtil.deleteFile(outputFile);
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
                const messagetext = tu.targetContentNormalized().asDisplayString(ngx_i18nsupport_lib_1.NORMALIZATION_FORMAT_NGXTRANSLATE);
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
        if (util_1.isNullOrUndefined(id)) {
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
        if (util_1.isNullOrUndefined(object)) {
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
exports.NgxTranslateExtractor = NgxTranslateExtractor;
NgxTranslateExtractor.DefaultExtractionPattern = '@@|ngx-translate';
//# sourceMappingURL=ngx-translate-extractor.js.map