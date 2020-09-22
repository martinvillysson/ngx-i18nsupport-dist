"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtbFile = void 0;
const constants_1 = require("../api/constants");
const util_1 = require("util");
const dom_utilities_1 = require("./dom-utilities");
const abstract_translation_messages_file_1 = require("./abstract-translation-messages-file");
const xtb_trans_unit_1 = require("./xtb-trans-unit");
/**
 * Created by martin on 23.05.2017.
 * xtb-File access.
 * xtb is the translated counterpart to xmb.
 */
class XtbFile extends abstract_translation_messages_file_1.AbstractTranslationMessagesFile {
    /**
     * Create an xmb-File from source.
     * @param _translationMessageFileFactory factory to create a translation file (xtb) for the xmb file
     * @param xmlString file content
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * @return XmbFile
     */
    constructor(_translationMessageFileFactory, xmlString, path, encoding, optionalMaster) {
        super();
        this._translationMessageFileFactory = _translationMessageFileFactory;
        this._warnings = [];
        this._numberOfTransUnitsWithMissingId = 0;
        this.initializeFromContent(xmlString, path, encoding, optionalMaster);
    }
    initializeFromContent(xmlString, path, encoding, optionalMaster) {
        this.parseContent(xmlString, path, encoding);
        if (this._parsedDocument.getElementsByTagName('translationbundle').length !== 1) {
            throw new Error(util_1.format('File "%s" seems to be no xtb file (should contain a translationbundle element)', path));
        }
        if (optionalMaster) {
            try {
                this._masterFile = this._translationMessageFileFactory.createFileFromFileContent(constants_1.FORMAT_XMB, optionalMaster.xmlContent, optionalMaster.path, optionalMaster.encoding);
                // check, wether this can be the master ...
                const numberInMaster = this._masterFile.numberOfTransUnits();
                const myNumber = this.numberOfTransUnits();
                if (numberInMaster !== myNumber) {
                    this._warnings.push(util_1.format('%s trans units found in master, but this file has %s. Check if it is the correct master', numberInMaster, myNumber));
                }
            }
            catch (error) {
                throw new Error(util_1.format('File "%s" seems to be no xmb file. An xtb file needs xmb as master file.', optionalMaster.path));
            }
        }
        return this;
    }
    initializeTransUnits() {
        this.transUnits = [];
        const transUnitsInFile = this._parsedDocument.getElementsByTagName('translation');
        for (let i = 0; i < transUnitsInFile.length; i++) {
            const msg = transUnitsInFile.item(i);
            const id = msg.getAttribute('id');
            if (!id) {
                this._warnings.push(util_1.format('oops, msg without "id" found in master, please check file %s', this._filename));
            }
            let masterUnit = null;
            if (this._masterFile) {
                masterUnit = this._masterFile.transUnitWithId(id);
            }
            this.transUnits.push(new xtb_trans_unit_1.XtbTransUnit(msg, id, this, masterUnit));
        }
    }
    /**
     * File format as it is used in config files.
     * Currently 'xlf', 'xlf2', 'xmb', 'xtb'
     * Returns one of the constants FORMAT_..
     */
    i18nFormat() {
        return constants_1.FORMAT_XTB;
    }
    /**
     * File type.
     * Here 'XTB'
     */
    fileType() {
        return constants_1.FILETYPE_XTB;
    }
    /**
     * return tag names of all elements that have mixed content.
     * These elements will not be beautified.
     * Typical candidates are source and target.
     */
    elementsWithMixedContent() {
        return ['translation'];
    }
    /**
     * Get source language.
     * Unsupported in xmb/xtb.
     * Try to guess it from master filename if any..
     * @return source language.
     */
    sourceLanguage() {
        if (this._masterFile) {
            return this._masterFile.sourceLanguage();
        }
        else {
            return null;
        }
    }
    /**
     * Edit the source language.
     * Unsupported in xmb/xtb.
     * @param language language
     */
    setSourceLanguage(language) {
        // do nothing, xtb has no notation for this.
    }
    /**
     * Get target language.
     * @return target language.
     */
    targetLanguage() {
        const translationbundleElem = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            return translationbundleElem.getAttribute('lang');
        }
        else {
            return null;
        }
    }
    /**
     * Edit the target language.
     * @param language language
     */
    setTargetLanguage(language) {
        const translationbundleElem = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (translationbundleElem) {
            translationbundleElem.setAttribute('lang', language);
        }
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
        if (this.transUnitWithId(foreignTransUnit.id)) {
            throw new Error(util_1.format('tu with id %s already exists in file, cannot import it', foreignTransUnit.id));
        }
        const newMasterTu = foreignTransUnit.cloneWithSourceAsTarget(isDefaultLang, copyContent, this);
        const translationbundleElem = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translationbundle');
        if (!translationbundleElem) {
            throw new Error(util_1.format('File "%s" seems to be no xtb file (should contain a translationbundle element)', this._filename));
        }
        const translationElement = translationbundleElem.ownerDocument.createElement('translation');
        translationElement.setAttribute('id', foreignTransUnit.id);
        let newContent = (copyContent || isDefaultLang) ? foreignTransUnit.sourceContent() : '';
        if (!foreignTransUnit.isICUMessage(newContent)) {
            newContent = this.getNewTransUnitTargetPraefix() + newContent + this.getNewTransUnitTargetSuffix();
        }
        dom_utilities_1.DOMUtilities.replaceContentWithXMLContent(translationElement, newContent);
        const newTu = new xtb_trans_unit_1.XtbTransUnit(translationElement, foreignTransUnit.id, this, newMasterTu);
        let inserted = false;
        let isAfterElementPartOfFile = false;
        if (!!importAfterElement) {
            const insertionPoint = this.transUnitWithId(importAfterElement.id);
            if (!!insertionPoint) {
                isAfterElementPartOfFile = true;
            }
        }
        if (importAfterElement === undefined || (importAfterElement && !isAfterElementPartOfFile)) {
            translationbundleElem.appendChild(newTu.asXmlElement());
            inserted = true;
        }
        else if (importAfterElement === null) {
            const firstTranslationElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(this._parsedDocument, 'translation');
            if (firstTranslationElement) {
                dom_utilities_1.DOMUtilities.insertBefore(newTu.asXmlElement(), firstTranslationElement);
                inserted = true;
            }
            else {
                // no trans-unit, empty file, so add to bundle at end
                translationbundleElem.appendChild(newTu.asXmlElement());
                inserted = true;
            }
        }
        else {
            const refUnitElement = dom_utilities_1.DOMUtilities.getElementByTagNameAndId(this._parsedDocument, 'translation', importAfterElement.id);
            if (refUnitElement) {
                dom_utilities_1.DOMUtilities.insertAfter(newTu.asXmlElement(), refUnitElement);
                inserted = true;
            }
        }
        if (inserted) {
            this.lazyInitializeTransUnits();
            this.transUnits.push(newTu);
            this.countNumbers();
            return newTu;
        }
        else {
            return null;
        }
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
        throw new Error(util_1.format('File "%s", xtb files are not translatable, they are already translations', filename));
    }
}
exports.XtbFile = XtbFile;
//# sourceMappingURL=xtb-file.js.map