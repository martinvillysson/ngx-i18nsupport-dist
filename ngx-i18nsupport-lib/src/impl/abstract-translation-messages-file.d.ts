import { ITranslationMessagesFile } from '../api/i-translation-messages-file';
import { ITransUnit } from '../api/i-trans-unit';
/**
 * Created by roobm on 09.05.2017.
 * Abstract superclass for all implementations of ITranslationMessagesFile.
 */
export declare abstract class AbstractTranslationMessagesFile implements ITranslationMessagesFile {
    protected _filename: string;
    protected _encoding: string;
    protected _parsedDocument: Document;
    protected _fileEndsWithEOL: boolean;
    protected transUnits: ITransUnit[];
    protected _warnings: string[];
    protected _numberOfTransUnitsWithMissingId: number;
    protected _numberOfUntranslatedTransUnits: number;
    protected _numberOfReviewedTransUnits: number;
    protected targetPraefix: string;
    protected targetSuffix: string;
    protected constructor();
    /**
     * Parse file content.
     * Sets _parsedDocument, line ending, encoding, etc.
     * @param xmlString xmlString
     * @param path path
     * @param encoding encoding
     * @param optionalMaster optionalMaster
     */
    protected parseContent(xmlString: string, path: string, encoding: string, optionalMaster?: {
        xmlContent: string;
        path: string;
        encoding: string;
    }): void;
    abstract i18nFormat(): string;
    abstract fileType(): string;
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    protected abstract elementsWithMixedContent(): string[];
    /**
     * Read all trans units from xml content.
     * Puts the found units into transUnits.
     * Puts warnings for missing ids.
     */
    protected abstract initializeTransUnits(): any;
    protected lazyInitializeTransUnits(): void;
    /**
     * count units after changes of trans units
     */
    countNumbers(): void;
    warnings(): string[];
    /**
     * Total number of translation units found in the file.
     */
    numberOfTransUnits(): number;
    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfUntranslatedTransUnits(): number;
    /**
     * Number of translation units with state 'final'.
     */
    numberOfReviewedTransUnits(): number;
    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfTransUnitsWithMissingId(): number;
    /**
     * Get source language.
     * @return source language.
     */
    abstract sourceLanguage(): string;
    /**
     * Get target language.
     * @return target language.
     */
    abstract targetLanguage(): string;
    /**
     * Loop over all Translation Units.
     * @param callback callback
     */
    forEachTransUnit(callback: ((transunit: ITransUnit) => void)): void;
    /**
     * Get trans-unit with given id.
     * @param id id
     * @return trans-unit with given id.
     */
    transUnitWithId(id: string): ITransUnit;
    /**
     * Edit functions following her
     */
    /**
     * Edit the source language.
     * @param language language
     */
    abstract setSourceLanguage(language: string): any;
    /**
     * Edit the target language.
     * @param language language
     */
    abstract setTargetLanguage(language: string): any;
    /**
     * Set the praefix used when copying source to target.
     * This is used by importNewTransUnit and createTranslationFileForLang methods.
     * (since 1.8.0)
     * @param targetPraefix targetPraefix
     */
    setNewTransUnitTargetPraefix(targetPraefix: string): void;
    /**
     * Get the praefix used when copying source to target.
     * (since 1.8.0)
     * @return the praefix used when copying source to target.
     */
    getNewTransUnitTargetPraefix(): string;
    /**
     * Set the suffix used when copying source to target.
     * This is used by importNewTransUnit and createTranslationFileForLang methods.
     * (since 1.8.0)
     * @param targetSuffix targetSuffix
     */
    setNewTransUnitTargetSuffix(targetSuffix: string): void;
    /**
     * Get the suffix used when copying source to target.
     * (since 1.8.0)
     * @return the suffix used when copying source to target.
     */
    getNewTransUnitTargetSuffix(): string;
    /**
     * Add a new trans-unit to this file.
     * The trans unit stems from another file.
     * It copies the source content of the tu to the target content too,
     * depending on the values of isDefaultLang and copyContent.
     * So the source can be used as a dummy translation.
     * (used by xliffmerge)
     * @param foreignTransUnit the trans unit to be imported.
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     * @param importAfterElement optional (since 1.10) other transunit (part of this file), that should be used as ancestor.
     * Newly imported trans unit is then inserted directly after this element.
     * If not set or not part of this file, new unit will be imported at the end.
     * If explicity set to null, new unit will be imported at the start.
     * @return the newly imported trans unit (since version 1.7.0)
     * @throws an error if trans-unit with same id already is in the file.
     */
    abstract importNewTransUnit(foreignTransUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean, importAfterElement?: ITransUnit): ITransUnit;
    /**
     * Remove the trans-unit with the given id.
     * @param id id
     */
    removeTransUnitWithId(id: string): void;
    /**
     * The filename where the data is read from.
     */
    filename(): string;
    /**
     * The encoding if the xml content (UTF-8, ISO-8859-1, ...)
     */
    encoding(): string;
    /**
     * The xml content to be saved after changes are made.
     * @param beautifyOutput Flag whether to use pretty-data to format the output.
     * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
     * See issue #64 for details.
     * Default is false.
     */
    editedContent(beautifyOutput?: boolean): string;
    /**
     * Create a new translation file for this file for a given language.
     * Normally, this is just a copy of the original one.
     * But for XMB the translation file has format 'XTB'.
     * @param lang Language code
     * @param filename expected filename to store file
     * @param isDefaultLang Flag, wether file contains the default language.
     * Then source and target are just equal.
     * The content will be copied.
     * State will be final.
     * @param copyContent Flag, wether to copy content or leave it empty.
     * Wben true, content will be copied from source.
     * When false, content will be left empty (if it is not the default language).
     */
    abstract createTranslationFileForLang(lang: string, filename: string, isDefaultLang: boolean, copyContent: boolean): ITranslationMessagesFile;
}
