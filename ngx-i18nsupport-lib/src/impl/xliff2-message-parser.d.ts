import { AbstractMessageParser } from './abstract-message-parser';
import { ParsedMessage } from './parsed-message';
import { ParsedMessagePartStartTag } from './parsed-message-part-start-tag';
import { ParsedMessagePartEndTag } from './parsed-message-part-end-tag';
import { ParsedMessagePartPlaceholder } from './parsed-message-part-placeholder';
import { ParsedMessagePartEmptyTag } from './parsed-message-part-empty-tag';
import { ParsedMessagePartICUMessageRef } from './parsed-message-part-icu-message-ref';
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 2.0
 */
export declare class Xliff2MessageParser extends AbstractMessageParser {
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
    private tagNameFromPCElement;
    /**
     * reimplemented here, because XLIFF 2.0 uses a deeper xml model.
     * So we cannot simply replace the message parts by xml parts.
     * @param message message
     * @param rootElem rootElem
     */
    protected addXmlRepresentationToRoot(message: ParsedMessage, rootElem: Element): void;
    /**
     * the xml used for start tag in the message.
     * Returns an empty pc-Element.
     * e.g. <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">
     * Text content will be added later.
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    protected createXmlRepresentationOfStartTagPart(part: ParsedMessagePartStartTag, rootElem: Element, id: number): Node;
    /**
     * the xml used for end tag in the message.
     * Not used here, because content is child of start tag.
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfEndTagPart(part: ParsedMessagePartEndTag, rootElem: Element): Node;
    /**
     * the xml used for empty tag in the message.
     * Returns an empty ph-Element.
     * e.g. <ph id="3" equiv="TAG_IMG" type="image" disp="&lt;img/>"/>
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    protected createXmlRepresentationOfEmptyTagPart(part: ParsedMessagePartEmptyTag, rootElem: Element, id: number): Node;
    private getTypeForTag;
    /**
     * the xml used for placeholder in the message.
     * Returns e.g. <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/>
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    protected createXmlRepresentationOfPlaceholderPart(part: ParsedMessagePartPlaceholder, rootElem: Element, id: number): Node;
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    protected createXmlRepresentationOfICUMessageRefPart(part: ParsedMessagePartICUMessageRef, rootElem: Element): Node;
}
