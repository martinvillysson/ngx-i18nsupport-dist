"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationMessagesFileFactory = void 0;
const xliff_file_1 = require("../impl/xliff-file");
const xmb_file_1 = require("../impl/xmb-file");
const util_1 = require("util");
const xliff2_file_1 = require("../impl/xliff2-file");
const constants_1 = require("./constants");
const xtb_file_1 = require("../impl/xtb-file");
/**
 * Helper class to read translation files depending on format.
 * This is part of the public api
 */
class TranslationMessagesFileFactory {
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param i18nFormat currently 'xlf' or 'xlf2' or 'xmb' or 'xtb' are supported
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    static fromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster) {
        return new TranslationMessagesFileFactory().createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster);
    }
    /**
     * Read file function for any file with unknown format.
     * This functions tries to guess the format based on the filename and the content of the file.
     * Result depends on detected format, either XliffFile or XmbFile.
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    static fromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster) {
        return new TranslationMessagesFileFactory().createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster);
    }
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param i18nFormat currently 'xlf' or 'xlf2' or 'xmb' or 'xtb' are supported
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    createFileFromFileContent(i18nFormat, xmlContent, path, encoding, optionalMaster) {
        if (i18nFormat === constants_1.FORMAT_XLIFF12) {
            return new xliff_file_1.XliffFile(xmlContent, path, encoding);
        }
        if (i18nFormat === constants_1.FORMAT_XLIFF20) {
            return new xliff2_file_1.Xliff2File(xmlContent, path, encoding);
        }
        if (i18nFormat === constants_1.FORMAT_XMB) {
            return new xmb_file_1.XmbFile(this, xmlContent, path, encoding);
        }
        if (i18nFormat === constants_1.FORMAT_XTB) {
            return new xtb_file_1.XtbFile(this, xmlContent, path, encoding, optionalMaster);
        }
        throw new Error(util_1.format('oops, unsupported format "%s"', i18nFormat));
    }
    /**
     * Read file function for any file with unknown format.
     * This functions tries to guess the format based on the filename and the content of the file.
     * Result depends on detected format, either XliffFile or XmbFile.
     * @param xmlContent the file content
     * @param path the path of the file (only used to remember it)
     * @param encoding utf-8, ... used to parse XML.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @param optionalMaster in case of xmb the master file, that contains the original texts.
     * (this is used to support state infos, that are based on comparing original with translated version)
     * Ignored for other formats.
     * @return either XliffFile or XmbFile
     */
    createFileFromUnknownFormatFileContent(xmlContent, path, encoding, optionalMaster) {
        let formatCandidates = [constants_1.FORMAT_XLIFF12, constants_1.FORMAT_XLIFF20, constants_1.FORMAT_XMB, constants_1.FORMAT_XTB];
        if (path && path.endsWith('xmb')) {
            formatCandidates = [constants_1.FORMAT_XMB, constants_1.FORMAT_XTB, constants_1.FORMAT_XLIFF12, constants_1.FORMAT_XLIFF20];
        }
        if (path && path.endsWith('xtb')) {
            formatCandidates = [constants_1.FORMAT_XTB, constants_1.FORMAT_XMB, constants_1.FORMAT_XLIFF12, constants_1.FORMAT_XLIFF20];
        }
        // try all candidate formats to get the right one
        for (let i = 0; i < formatCandidates.length; i++) {
            const formatCandidate = formatCandidates[i];
            try {
                const translationFile = TranslationMessagesFileFactory.fromFileContent(formatCandidate, xmlContent, path, encoding, optionalMaster);
                if (translationFile) {
                    return translationFile;
                }
            }
            catch (e) {
                // seams to be the wrong format
            }
        }
        throw new Error(util_1.format('could not identify file format, it is neiter XLIFF (1.2 or 2.0) nor XMB/XTB'));
    }
}
exports.TranslationMessagesFileFactory = TranslationMessagesFileFactory;
//# sourceMappingURL=translation-messages-file-factory.js.map