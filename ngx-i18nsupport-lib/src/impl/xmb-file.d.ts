import { ITranslationMessagesFileFactory } from '../api/i-translation-messages-file-factory';
import { ITranslationMessagesFile } from '../api/i-translation-messages-file';
import { ITransUnit } from '../api/i-trans-unit';
import { AbstractTranslationMessagesFile } from './abstract-translation-messages-file';
/**
 * Created by martin on 10.03.2017.
 * xmb-File access.
 */
/**
 * Doctype of xtb translation file corresponding with thos xmb file.
 */
export declare const XTB_DOCTYPE = "<!DOCTYPE translationbundle [\n  <!ELEMENT translationbundle (translation)*>\n  <!ATTLIST translationbundle lang CDATA #REQUIRED>\n  <!ELEMENT translation (#PCDATA|ph)*>\n  <!ATTLIST translation id CDATA #REQUIRED>\n  <!ELEMENT ph EMPTY>\n  <!ATTLIST ph name CDATA #REQUIRED>\n]>";
export declare class XmbFile extends AbstractTranslationMessagesFile implements ITranslationMessagesFile {
    private _translationMessageFileFactory;
    /**
     * Create an xmb-File from source.
     * @param _translationMessageFileFactory factory to create a translation file (xtb) for the xmb file
     * @param xmlString file content
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return XmbFile
     */
    constructor(_translationMessageFileFactory: ITranslationMessagesFileFactory, xmlString: string, path: string, encoding: string);
    private initializeFromContent;
    protected initializeTransUnits(): void;
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat(): string;
    /**
     * File type.
     * Here 'XMB'
     */
    fileType(): string;
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    protected elementsWithMixedContent(): string[];
    /**
     * Guess language from filename.
     * If filename is foo.xy.xmb, than language is assumed to be xy.
     * @return Language or null
     */
    private guessLanguageFromFilename;
    /**
     * Get source language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return source language.
     */
    sourceLanguage(): string;
    /**
     * Edit the source language.
     * Unsupported in xmb.
     * @param language language
     */
    setSourceLanguage(language: string): void;
    /**
     * Get target language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return target language.
     */
    targetLanguage(): string;
    /**
     * Edit the target language.
     * Unsupported in xmb.
     * @param language language
     */
    setTargetLanguage(language: string): void;
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
    importNewTransUnit(foreignTransUnit: ITransUnit, isDefaultLang: boolean, copyContent: boolean, importAfterElement?: ITransUnit): ITransUnit;
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
    createTranslationFileForLang(lang: string, filename: string, isDefaultLang: boolean, copyContent: boolean): ITranslationMessagesFile;
}
