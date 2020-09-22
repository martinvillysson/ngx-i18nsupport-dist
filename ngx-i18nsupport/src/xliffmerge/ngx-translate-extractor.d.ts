import { ITranslationMessagesFile } from '@ngx-i18nsupport/ngx-i18nsupport-lib';
export declare class NgxTranslateExtractor {
    private messagesFile;
    static DefaultExtractionPattern: string;
    private extractionPattern;
    /**
     * Check, wether extractionPattern has valid syntax.
     * @param extractionPatternString extractionPatternString
     * @return null, if pattern is ok, string describing the error, if it is not ok.
     */
    static checkPattern(extractionPatternString: string): string;
    static extract(messagesFile: ITranslationMessagesFile, extractionPattern: string, outputFile: string): void;
    constructor(messagesFile: ITranslationMessagesFile, extractionPatternString: string);
    /**
     * Extact messages and write them to a file.
     * @param outputFile outputFile
     */
    extractTo(outputFile: string): void;
    /**
     *  Extract messages and convert them to ngx translations.
     *  @return the translation objects.
     */
    private extract;
    /**
     * Check, wether this tu should be extracted for ngx-translate usage, and return its id for ngx-translate.
     * There are 2 possibilities:
     * 1. description is set to "ngx-translate" and meaning contains the id.
     * 2. id is explicitly set to a string.
     * @param tu tu
     * @return an ngx id or null, if this tu should not be extracted.
     */
    private ngxTranslateIdFromTU;
    /**
     * Test, wether ID was explicitly set (via i18n="@myid).
     * Just heuristic, an ID is explicitly, if it does not look like a generated one.
     * @param id id
     * @return wether ID was explicitly set (via i18n="@myid).
     */
    private isExplicitlySetId;
    /**
     * Convert list of relevant TUs to ngx translations object.
     * @param msgList msgList
     */
    private toNgxTranslations;
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
    private putInTranslationObject;
}
