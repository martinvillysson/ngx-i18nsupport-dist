"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTranslationMessagesFile = void 0;
const constants_1 = require("../api/constants");
const util_1 = require("util");
const xmldom_1 = require("xmldom");
const xml_serializer_1 = require("./xml-serializer");
/**
 * Created by roobm on 09.05.2017.
 * Abstract superclass for all implementations of ITranslationMessagesFile.
 */
class AbstractTranslationMessagesFile {
    constructor() {
        this.transUnits = null;
        this._warnings = [];
    }
    /**
     * Parse file content.
     * Sets _parsedDocument, line ending, encoding, etc.
     * @param xmlString xmlString
     * @param path path
     * @param encoding encoding
     * @param optionalMaster optionalMaster
     */
    parseContent(xmlString, path, encoding, optionalMaster) {
        this._filename = path;
        this._encoding = encoding;
        this._parsedDocument = new xmldom_1.DOMParser().parseFromString(xmlString, 'text/xml');
        this._fileEndsWithEOL = xmlString.endsWith('\n');
    }
    lazyInitializeTransUnits() {
        if (util_1.isNullOrUndefined(this.transUnits)) {
            this.initializeTransUnits();
            this.countNumbers();
        }
    }
    /**
     * count units after changes of trans units
     */
    countNumbers() {
        this._numberOfTransUnitsWithMissingId = 0;
        this._numberOfUntranslatedTransUnits = 0;
        this._numberOfReviewedTransUnits = 0;
        this.forEachTransUnit((tu) => {
            if (util_1.isNullOrUndefined(tu.id) || tu.id === '') {
                this._numberOfTransUnitsWithMissingId++;
            }
            const state = tu.targetState();
            if (util_1.isNullOrUndefined(state) || state === constants_1.STATE_NEW) {
                this._numberOfUntranslatedTransUnits++;
            }
            if (state === constants_1.STATE_TRANSLATED) {
                this._numberOfReviewedTransUnits++;
            }
        });
    }
    warnings() {
        this.lazyInitializeTransUnits();
        return this._warnings;
    }
    /**
     * Total number of translation units found in the file.
     */
    numberOfTransUnits() {
        this.lazyInitializeTransUnits();
        return this.transUnits.length;
    }
    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfUntranslatedTransUnits() {
        this.lazyInitializeTransUnits();
        return this._numberOfUntranslatedTransUnits;
    }
    /**
     * Number of translation units with state 'final'.
     */
    numberOfReviewedTransUnits() {
        this.lazyInitializeTransUnits();
        return this._numberOfReviewedTransUnits;
    }
    /**
     * Number of translation units without translation found in the file.
     * These units have state 'translated'.
     */
    numberOfTransUnitsWithMissingId() {
        this.lazyInitializeTransUnits();
        return this._numberOfTransUnitsWithMissingId;
    }
    /**
     * Loop over all Translation Units.
     * @param callback callback
     */
    forEachTransUnit(callback) {
        this.lazyInitializeTransUnits();
        this.transUnits.forEach((tu) => callback(tu));
    }
    /**
     * Get trans-unit with given id.
     * @param id id
     * @return trans-unit with given id.
     */
    transUnitWithId(id) {
        this.lazyInitializeTransUnits();
        return this.transUnits.find((tu) => tu.id === id);
    }
    /**
     * Set the praefix used when copying source to target.
     * This is used by importNewTransUnit and createTranslationFileForLang methods.
     * (since 1.8.0)
     * @param targetPraefix targetPraefix
     */
    setNewTransUnitTargetPraefix(targetPraefix) {
        this.targetPraefix = targetPraefix;
    }
    /**
     * Get the praefix used when copying source to target.
     * (since 1.8.0)
     * @return the praefix used when copying source to target.
     */
    getNewTransUnitTargetPraefix() {
        return util_1.isNullOrUndefined(this.targetPraefix) ? '' : this.targetPraefix;
    }
    /**
     * Set the suffix used when copying source to target.
     * This is used by importNewTransUnit and createTranslationFileForLang methods.
     * (since 1.8.0)
     * @param targetSuffix targetSuffix
     */
    setNewTransUnitTargetSuffix(targetSuffix) {
        this.targetSuffix = targetSuffix;
    }
    /**
     * Get the suffix used when copying source to target.
     * (since 1.8.0)
     * @return the suffix used when copying source to target.
     */
    getNewTransUnitTargetSuffix() {
        return util_1.isNullOrUndefined(this.targetSuffix) ? '' : this.targetSuffix;
    }
    /**
     * Remove the trans-unit with the given id.
     * @param id id
     */
    removeTransUnitWithId(id) {
        const tuNode = this._parsedDocument.getElementById(id);
        if (tuNode) {
            tuNode.parentNode.removeChild(tuNode);
            this.lazyInitializeTransUnits();
            this.transUnits = this.transUnits.filter((tu) => tu.id !== id);
            this.countNumbers();
        }
    }
    /**
     * The filename where the data is read from.
     */
    filename() {
        return this._filename;
    }
    /**
     * The encoding if the xml content (UTF-8, ISO-8859-1, ...)
     */
    encoding() {
        return this._encoding;
    }
    /**
     * The xml content to be saved after changes are made.
     * @param beautifyOutput Flag whether to use pretty-data to format the output.
     * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
     * See issue #64 for details.
     * Default is false.
     */
    editedContent(beautifyOutput) {
        const options = {};
        if (beautifyOutput === true) {
            options.beautify = true;
            options.indentString = '  ';
            options.mixedContentElements = this.elementsWithMixedContent();
        }
        const result = new xml_serializer_1.XmlSerializer().serializeToString(this._parsedDocument, options);
        if (this._fileEndsWithEOL) {
            // add eol if there was eol in original source
            return result + '\n';
        }
        else {
            return result;
        }
    }
}
exports.AbstractTranslationMessagesFile = AbstractTranslationMessagesFile;
//# sourceMappingURL=abstract-translation-messages-file.js.map