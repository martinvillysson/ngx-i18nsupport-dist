/**
 * An XmlSerializer that supports formatting.
 * Original code is based on [xmldom](https://www.npmjs.com/package/xmldom)
 * It is extended to support formatting including handling of elements with mixed content.
 * Example formatted output:
 * <pre>
 *     <doc>
 *         <element>An element with
 *             <b>mixed</b>
 *              content
 *         </element>
 *     </doc>
 * </pre>
 * Same when "element" is indicated as "mixedContentElement":
 * <pre>
 *     <doc>
 *         <element>An element with <b>mixed</b> content</element>
 *     </doc>
 * </pre>
 */
/**
 * Options used to control the formatting
 */
export interface XmlSerializerOptions {
    beautify?: boolean;
    indentString?: string;
    mixedContentElements?: string[];
}
export declare class XmlSerializer {
    constructor();
    /**
     * Serialze xml document to string.
     * @param document the document
     * @param options can be used to activate beautifying.
     */
    serializeToString(document: Document, options?: XmlSerializerOptions): string;
    /**
     * Main format method that does all the work.
     * Outputs a node to the outputbuffer.
     * @param node the node to be formatted.
     * @param options options
     * @param buf outputbuffer, new output will be appended to this array.
     * @param indentLevel Lever of indentation for formatted output.
     * @param partOfMixedContent true, if node is a subelement of an element containind mixed content.
     * @param visibleNamespaces visibleNamespaces
     */
    private doSerializeToString;
    private needNamespaceDefine;
    private _xmlEncoder;
    private outputIndented;
    private indentationString;
    /**
     * Test, wether tagName is an element containing mixed content.
     * @param tagName tagName
     * @param options options
     */
    private isMixedContentElement;
    private containsOnlyWhiteSpace;
}
