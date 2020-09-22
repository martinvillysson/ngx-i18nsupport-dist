import { ParsedMessage } from './parsed-message';
import { ParsedMessagePartText } from './parsed-message-part-text';
import { ParsedMessagePartStartTag } from './parsed-message-part-start-tag';
import { ParsedMessagePartPlaceholder } from './parsed-message-part-placeholder';
import { ParsedMessagePartEndTag } from './parsed-message-part-end-tag';
import { IMessageParser } from './i-message-parser';
import { ParsedMessagePartEmptyTag } from './parsed-message-part-empty-tag';
import { ParsedMessagePartICUMessageRef } from './parsed-message-part-icu-message-ref';
/**
 * Created by roobm on 10.05.2017.
 * A message parser can parse the xml content of a translatable message.
 * It generates a ParsedMessage from it.
 */
export declare abstract class AbstractMessageParser implements IMessageParser {
    /**
     * Parse XML to ParsedMessage.
     * @param xmlElement the xml representation
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXML(xmlElement: Element, sourceMessage: ParsedMessage): ParsedMessage;
    /**
     * Parse XML string to ParsedMessage.
     * @param xmlString the xml representation without root element, e.g. this is <ph x></ph> an example.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXMLString(xmlString: string, sourceMessage: ParsedMessage): ParsedMessage;
    /**
     * recursively run through a node and add all identified parts to the message.
     * @param node node
     * @param message message to be generated.
     * @param includeSelf if true, add node by itself, otherwise only children.
     */
    private addPartsOfNodeToMessage;
    /**
     * Return the ICU message content of the node, if it is an ICU Message.
     * @param node node
     * @return message or null, if it is no ICU Message.
     */
    protected getICUMessageText(node: Node): string;
    /**
     * Test, wether text is beginning of ICU Message.
     * @param text text
     */
    isICUMessageStart(text: string): boolean;
    /**
     * Handle this node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    protected abstract processStartElement(elementNode: Element, message: ParsedMessage): boolean;
    /**
     * Handle end of this node.
     * This is called after all children are processed.
     * @param elementNode elementNode
     * @param message message to be altered
     */
    protected abstract processEndElement(elementNode: Element, message: ParsedMessage): any;
    /**
     * Parse normalized string to ParsedMessage.
     * @param normalizedString normalized string
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if normalized string is not well formed.
     */
    parseNormalizedString(normalizedString: string, sourceMessage: ParsedMessage): ParsedMessage;
    /**
     * Parse a string, that is an ICU message, to ParsedMessage.
     * @param icuMessageString the message, like '{x, plural, =0 {nothing} =1 {one} other {many}}'.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if icuMessageString has not the correct syntax.
     */
    parseICUMessage(icuMessageString: string, sourceMessage: ParsedMessage): ParsedMessage;
    /**
     * Helper function: Parse ID from a name.
     * name optionally ends with _<number>. This is the idcount.
     * E.g. name="TAG_IMG" returns 0
     * name = "TAG_IMG_1" returns 1
     * @param name name
     * @return id count
     */
    protected parseIdCountFromName(name: string): number;
    /**
     * Create the native xml for a message.
     * Parts are already set here.
     * @param message message
     */
    protected createXmlRepresentation(message: ParsedMessage): Element;
    protected abstract addXmlRepresentationToRoot(message: ParsedMessage, rootElem: Element): any;
    protected createXmlRepresentationOfTextPart(part: ParsedMessagePartText, rootElem: Element): Node;
    /**
     * the xml used for start tag in the message.
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    protected abstract createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element, id?: number): Node;
    /**
     * the xml used for end tag in the message.
     * @param part part
     * @param rootElem rootElem
     */
    protected abstract createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node;
    /**
     * the xml used for empty tag in the message.
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    protected abstract createXmlRepresentationOfEmptyTagPart(part: ParsedMessagePartEmptyTag, rootElem: Element, id?: number): Node;
    /**
     * the xml used for placeholder in the message.
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    protected abstract createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element, id?: number): Node;
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    protected abstract createXmlRepresentationOfICUMessageRefPart(part: ParsedMessagePartICUMessageRef, rootElem: Element): Node;
}
