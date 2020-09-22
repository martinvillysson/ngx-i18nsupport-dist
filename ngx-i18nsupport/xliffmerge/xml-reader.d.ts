/**
 * Created by martin on 10.03.2017.
 * Helper class to read XMl with a correct encoding.
 */
export declare class XmlReader {
    static DEFAULT_ENCODING: string;
    /**
     * Read an xml-File.
     * @param path Path to file
     * @param encoding optional encoding of the xml.
     * This is read from the file, but if you know it before, you can avoid reading the file twice.
     * @return file content and encoding found in the file.
     */
    static readXmlFileContent(path: string, encoding?: string): {
        content: string;
        encoding: string;
    };
    /**
     * Read the encoding from the xml.
     * xml File starts with .. encoding=".."
     * @param xmlString xmlString
     * @return encoding
     */
    private static encodingFromXml;
}
