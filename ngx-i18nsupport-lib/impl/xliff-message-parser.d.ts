import { AbstractMessageParser } from './abstract-message-parser';
import { ParsedMessage } from './parsed-message';
import { ParsedMessagePartStartTag } from './parsed-message-part-start-tag';
import { ParsedMessagePartEndTag } from './parsed-message-part-end-tag';
import { ParsedMessagePartPlaceholder } from './parsed-message-part-placeholder';
import { ParsedMessagePartEmptyTag } from './parsed-message-part-empty-tag';
import { ParsedMessagePartICUMessageRef } from './parsed-message-part-icu-message-ref';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 1.2
 */
export declare class XliffMessageParser extends AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected processStartElement(elementNode: Element, message: ParsedMessage): boolean;
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
     * @param id id
     * @return index
     */
    private parsePlaceholderIndexFromId;
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param id id
     * @return id as number
     */
    private parseICUMessageRefIndexFromId;
    protected addXmlRepresentationToRoot(message: ParsedMessage, rootElem: Element): void;
    /**
     * the xml used for start tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element): Node;
    /**
     * the xml used for end tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node;
    /**
     * the xml used for empty tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfEmptyTagPart(part: ParsedMessagePartEmptyTag, rootElem: Element): Node;
    /**
     * the xml used for placeholder in the message.
     * Returns an empty <x/>-Element with attribute id="INTERPOLATION" or id="INTERPOLATION_n"
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
