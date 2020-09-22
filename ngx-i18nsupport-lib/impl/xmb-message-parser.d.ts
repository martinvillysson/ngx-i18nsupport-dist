import { AbstractMessageParser } from './abstract-message-parser';
import { ParsedMessage } from './parsed-message';
import { ParsedMessagePartStartTag } from './parsed-message-part-start-tag';
import { ParsedMessagePartEndTag } from './parsed-message-part-end-tag';
import { ParsedMessagePartPlaceholder } from './parsed-message-part-placeholder';
import { ParsedMessagePartEmptyTag } from './parsed-message-part-empty-tag';
import { ParsedMessagePartICUMessageRef } from './parsed-message-part-icu-message-ref';
import { ParsedMessagePart } from './parsed-message-part';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XMB
 */
export declare class XmbMessageParser extends AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected processStartElement(elementNode: Element, message: ParsedMessage): boolean;
    /**
     * Return the ICU message content of the node, if it is an ICU Message.
     * @param node node
     * @return message or null, if it is no ICU Message.
     */
    protected getICUMessageText(node: Node): string;
    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode elementNode
     * @param message message to be altered
     */
    protected processEndElement(elementNode: Element, message: ParsedMessage): void;
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param name name
     * @return id as number
     */
    private parsePlaceholderIndexFromName;
    /**
     * Parse id attribute of x element as ICU message ref index.
     * id can be "ICU" or "ICU_n"
     * @param name name
     * @return id as number
     */
    private parseICUMessageIndexFromName;
    /**
     * Parse the tag name from a ph element.
     * It contained in the <ex> subelements value and enclosed in <>.
     * Example: <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>
     * @param phElement phElement
     */
    private parseTagnameFromPhElement;
    protected addXmlRepresentationToRoot(message: ParsedMessage, rootElem: Element): void;
    protected createXmlRepresentationOfPart(part: ParsedMessagePart, rootElem: Element): Node;
    /**
     * the xml used for start tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element): Node;
    /**
     * the xml used for end tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node;
    /**
     * the xml used for empty tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfEmptyTagPart(part: ParsedMessagePartEmptyTag, rootElem: Element): Node;
    /**
     * the xml used for placeholder in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element): Node;
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfICUMessageRefPart(part: ParsedMessagePartICUMessageRef, rootElem: Element): Node;
}
