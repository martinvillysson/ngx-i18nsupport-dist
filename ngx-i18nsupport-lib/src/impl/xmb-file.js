"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmbFile = exports.XTB_DOCTYPE = void 0;
const constants_1 = require("../api/constants");
const util_1 = require("util");
const xmb_trans_unit_1 = require("./xmb-trans-unit");
const abstract_translation_messages_file_1 = require("./abstract-translation-messages-file");
/**
 * Created by martin on 10.03.2017.
 * xmb-File access.
 */
/**
 * Doctype of xtb translation file corresponding with thos xmb file.
 */
exports.XTB_DOCTYPE = `<!DOCTYPE translationbundle [
  <!ELEMENT translationbundle (translation)*>
  <!ATTLIST translationbundle lang CDATA #REQUIRED>
  <!ELEMENT translation (#PCDATA|ph)*>
  <!ATTLIST translation id CDATA #REQUIRED>
  <!ELEMENT ph EMPTY>
  <!ATTLIST ph name CDATA #REQUIRED>
]>`;
class XmbFile extends abstract_translation_messages_file_1.AbstractTranslationMessagesFile {
    /**
     * Create an xmb-File from source.
     * @param _translationMessageFileFactory factory to create a translation file (xtb) for the xmb file
     * @param xmlString file content
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return XmbFile
     */
    constructor(_translationMessageFileFactory, xmlString, path, encoding) {
        super();
        this._translationMessageFileFactory = _translationMessageFileFactory;
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding);
    }
    initializeFromContent(xmlString, path, encoding) {
        this.parseContent(xmlString, path, encoding);
        if (this._parsedDocument.getElementsByTagName('messagebundle').length !== 1) {
            throw new Error(util_1.format('File "%s" seems to be no xmb file (should contain a messagebundle element)', path));
        }
        return this;
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('msg');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const msg = transUnitsInFile.item(i);
            const id = msg.getAttribute('id');
            if (!id) {
                this._warnings.push(util_1.format('oops, msg without "id" found in master, please check file %s', this._filename));
            }
            this.transUnits.push(new xmb_trans_unit_1.XmbTransUnit(msg, id, this));
        }
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xmb', 'xmb2'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return constants_1.FORMAT_XMB;
    }
    /**
     * File type.
     * Here 'XMB'
     */
    fileType() {
        return constants_1.FILETYPE_XMB;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['message'];
    }
    /**
     * Guess language from filename.
     * If filename is foo.xy.xmb, than language is assumed to be xy.
     * @return Language or null
     */
    guessLanguageFromFilename() {
        if (this._filename) {
            const parts = this._filename.split('.');
            if (parts.length > 2 && parts[parts.length - 1].toLowerCase() === 'xmb') {
                return parts[parts.length - 2];
            }
        }
        return null;
    }
    /**
     * Get source language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return source language.
     */
    sourceLanguage() {
        return this.guessLanguageFromFilename();
    }
    /**
     * Edit the source language.
     * Unsupported in xmb.
     * @param language language
     */
    setSourceLanguage(language) {
        // do nothing, xmb has no notation for this.
    }
    /**
     * Get target language.
     * Unsupported in xmb.
     * Try to guess it from filename if any..
     * @return target language.
     */
    targetLanguage() {
        return this.guessLanguageFromFilename();
    }
    /**
     * Edit the target language.
     * Unsupported in xmb.
     * @param language language
     */
    setTargetLanguage(language) {
        // do nothing, xmb has no notation for this.
    }
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
    importNewTransUnit(foreignTransUnit, isDefaultLang, copyContent, importAfterElement) {
        throw Error('xmb file cannot be used to store translations, use xtb file');
    }
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
    createTranslationFileForLang(lang, filename, isDefaultLang, copyContent) {
        const translationbundleXMLSource = '<?xml version="1.0" encoding="UTF-8"?>\n' + exports.XTB_DOCTYPE + '\n<translationbundle>\n</translationbundle>\n';
        const translationFile = this._translationMessageFileFactory.createFileFromFileContent(constants_1.FORMAT_XTB, translationbundleXMLSource, filename, this.encoding(), { xmlContent: this.editedContent(), path: this.filename(), encoding: this.encoding() });
        translationFile.setNewTransUnitTargetPraefix(this.targetPraefix);
        translationFile.setNewTransUnitTargetSuffix(this.targetSuffix);
        translationFile.setTargetLanguage(lang);
        translationFile.setNewTransUnitTargetPraefix(this.getNewTransUnitTargetPraefix());
        translationFile.setNewTransUnitTargetSuffix(this.getNewTransUnitTargetSuffix());
        this.forEachTransUnit((tu) => {
            translationFile.importNewTransUnit(tu, isDefaultLang, copyContent);
        });
        return translationFile;
    }
}
exports.XmbFile = XmbFile;
//# sourceMappingURL=xmb-file.js.map