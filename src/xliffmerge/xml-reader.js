"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlReader = void 0;
const file_util_1 = require("../common/file-util");
/**
 * Created by martin on 10.03.2017.
 * Helper class to read XMl with a correct encoding.
 */
class XmlReader {
    /**
     * Read an xml-File.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return file content and encoding found in the file.
     */
    static readXmlFileContent(path, encoding) {
        if (!encoding) {
            encoding = XmlReader.DEFAULT_ENCODING;
        }
        let content = file_util_1.FileUtil.read(path, encoding);
        const foundEncoding = XmlReader.encodingFromXml(content);
        if (foundEncoding !== encoding) {
            // read again with the correct encoding
            content = file_util_1.FileUtil.read(path, foundEncoding);
        }
        return {
            content: content,
            encoding: foundEncoding
        };
    }
    /**
     * Read the encoding from the xml.
     * xml File starts with .. encoding=".."
     * @param xmlString xmlString
     * @return encoding
     */
    static encodingFromXml(xmlString) {
        const index = xmlString.indexOf('encoding="');
        if (index < 0) {
            return this.DEFAULT_ENCODING; // default in xml if not explicitly set
        }
        const endIndex = xmlString.indexOf('"', index + 10); // 10 = length of 'encoding="'
        return xmlString.substring(index + 10, endIndex);
    }
}
exports.XmlReader = XmlReader;
XmlReader.DEFAULT_ENCODING = 'UTF-8';
//# sourceMappingURL=xml-reader.js.map