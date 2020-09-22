"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationMessagesFileReader = void 0;
/**
 * Created by roobm on 21.03.2017.
 */
const ngx_i18nsupport_lib_1 = require("@ngx-i18nsupport/ngx-i18nsupport-lib");
const file_util_1 = require("../common/file-util");
const xml_reader_1 = require("./xml-reader");
/**
 * Helper class to read translation files depending on format.
 */
class TranslationMessagesFileReader {
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param i18nFormat format
     * @param path path
     * @param encoding encoding
     * @param optionalMasterFilePath optionalMasterFilePath
     * @return XliffFile
     */
    static fromFile(i18nFormat, path, encoding, optionalMasterFilePath) {
        const xmlContent = xml_reader_1.XmlReader.readXmlFileContent(path, encoding);
        const optionalMaster = TranslationMessagesFileReader.masterFileContent(optionalMasterFilePath, encoding);
        return ngx_i18nsupport_lib_1.TranslationMessagesFileFactory.fromFileContent(i18nFormat, xmlContent.content, path, xmlContent.encoding, optionalMaster);
    }
    /**
     * Read file function, result depends on format, either XliffFile or XmbFile.
     * @param path path
     * @param encoding encoding
     * @param optionalMasterFilePath optionalMasterFilePath
     * @return XliffFile
     */
    static fromUnknownFormatFile(path, encoding, optionalMasterFilePath) {
        const xmlContent = xml_reader_1.XmlReader.readXmlFileContent(path, encoding);
        const optionalMaster = TranslationMessagesFileReader.masterFileContent(optionalMasterFilePath, encoding);
        return ngx_i18nsupport_lib_1.TranslationMessagesFileFactory.fromUnknownFormatFileContent(xmlContent.content, path, xmlContent.encoding, optionalMaster);
    }
    /**
     * Read master xmb file
     * @param optionalMasterFilePath optionalMasterFilePath
     * @param encoding encoding
     * @return content and encoding of file
     */
    static masterFileContent(optionalMasterFilePath, encoding) {
        if (optionalMasterFilePath) {
            const masterXmlContent = xml_reader_1.XmlReader.readXmlFileContent(optionalMasterFilePath, encoding);
            return {
                xmlContent: masterXmlContent.content,
                path: optionalMasterFilePath,
                encoding: masterXmlContent.encoding
            };
        }
        else {
            return null;
        }
    }
    /**
     * Save edited file.
     * @param messagesFile messagesFile
     * @param beautifyOutput Flag whether to use pretty-data to format the output.
     * XMLSerializer produces some correct but strangely formatted output, which pretty-data can correct.
     * See issue #64 for details.
     * Default is false.
     */
    static save(messagesFile, beautifyOutput) {
        file_util_1.FileUtil.replaceContent(messagesFile.filename(), messagesFile.editedContent(beautifyOutput), messagesFile.encoding());
    }
}
exports.TranslationMessagesFileReader = TranslationMessagesFileReader;
//# sourceMappingURL=translation-messages-file-reader.js.map