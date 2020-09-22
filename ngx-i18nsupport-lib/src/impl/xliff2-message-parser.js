"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Xliff2MessageParser = void 0;
const abstract_message_parser_1 = require("./abstract-message-parser");
const parsed_message_part_1 = require("./parsed-message-part");
const tag_mapping_1 = require("./tag-mapping");
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 2.0
 */
class Xliff2MessageParser extends abstract_message_parser_1.AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    processStartElement(elementNode, message) {
        const tagName = elementNode.tagName;
        if (tagName === 'ph') {
            // placeholder are like <ph id="0" equiv="INTERPOLATION" disp="{{number()}}"/>
            // They contain the id and also a name (number in the example)
            // TODO make some use of the name (but it is not available in XLIFF 1.2)
            // ICU message are handled with the same tag
            // Before 4.3.2 they did not have an equiv and disp (Bug #17344):
            // e.g. <ph id="0"/>
            // Beginning with 4.3.2 they do have an equiv ICU and disp:
            // e.g. <ph id="0" equiv="ICU" disp="{count, plural, =0 {...} =1 {...} other {...}}"/>
            // and empty tags have equiv other then INTERPOLATION:
            // e.g. <ph id="3" equiv="TAG_IMG" type="image" disp="&lt;img/>"/>
            // or <ph equiv="LINE_BREAK" type="lb" disp="&lt;br/>"/>
            let isInterpolation = false;
            let isICU = false;
            let isEmptyTag = false;
            const equiv = elementNode.getAttribute('equiv');
            const disp = elementNode.getAttribute('disp');
            let indexString = null;
            let index = 0;
            let emptyTagName = null;
            if (!equiv) {
                // old ICU syntax, fixed with #17344
                isICU = true;
                indexString = elementNode.getAttribute('id');
                index = Number.parseInt(indexString, 10);
            }
            else if (equiv.startsWith('ICU')) {
                // new ICU syntax, fixed with #17344
                isICU = true;
                if (equiv === 'ICU') {
                    indexString = '0';
                }
                else {
                    indexString = equiv.substring('ICU_'.length);
                }
                index = Number.parseInt(indexString, 10);
            }
            else if (equiv.startsWith('INTERPOLATION')) {
                isInterpolation = true;
                if (equiv === 'INTERPOLATION') {
                    indexString = '0';
                }
                else {
                    indexString = equiv.substring('INTERPOLATION_'.length);
                }
                index = Number.parseInt(indexString, 10);
            }
            else if (new tag_mapping_1.TagMapping().isEmptyTagPlaceholderName(equiv)) {
                isEmptyTag = true;
                emptyTagName = new tag_mapping_1.TagMapping().getTagnameFromEmptyTagPlaceholderName(equiv);
            }
            else {
                return true;
            }
            if (isInterpolation) {
                message.addPlaceholder(index, disp);
            }
            else if (isICU) {
                message.addICUMessageRef(index, disp);
            }
            else if (isEmptyTag) {
                message.addEmptyTag(emptyTagName, this.parseIdCountFromName(equiv));
            }
        }
        else if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt"
            // dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            const embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addStartTag(embeddedTagName, this.parseIdCountFromName(elementNode.getAttribute('equivStart')));
            }
        }
        return true;
    }
    /**
     * Handle end of this element node.
     * This is called after all children are processed.
     * @param elementNode elementNode
     * @param message message to be altered
     */
    processEndElement(elementNode, message) {
        const tagName = elementNode.tagName;
        if (tagName === 'pc') {
            // pc example: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt"
            // dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">IMPORTANT</pc>
            const embeddedTagName = this.tagNameFromPCElement(elementNode);
            if (embeddedTagName) {
                message.addEndTag(embeddedTagName);
            }
            return;
        }
    }
    tagNameFromPCElement(pcNode) {
        let dispStart = pcNode.getAttribute('dispStart');
        if (dispStart.startsWith('<')) {
            dispStart = dispStart.substring(1);
        }
        if (dispStart.endsWith('>')) {
            dispStart = dispStart.substring(0, dispStart.length - 1);
        }
        return dispStart;
    }
    /**
     * reimplemented here, because XLIFF 2.0 uses a deeper xml model.
     * So we cannot simply replace the message parts by xml parts.
     * @param message message
     * @param rootElem rootElem
     */
    addXmlRepresentationToRoot(message, rootElem) {
        const stack = [{ element: rootElem, tagName: 'root' }];
        let id = 0;
        message.parts().forEach((part) => {
            switch (part.type) {
                case parsed_message_part_1.ParsedMessagePartType.TEXT:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfTextPart(part, rootElem));
                    break;
                case parsed_message_part_1.ParsedMessagePartType.PLACEHOLDER:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfPlaceholderPart(part, rootElem, id++));
                    break;
                case parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF:
                    stack[stack.length - 1].element.appendChild(this.createXmlRepresentationOfICUMessageRefPart(part, rootElem));
                    break;
                case parsed_message_part_1.ParsedMessagePartType.START_TAG:
                    const newTagElem = this.createXmlRepresentationOfStartTagPart(part, rootElem, id++);
                    stack[stack.length - 1].element.appendChild(newTagElem);
                    stack.push({ element: newTagElem, tagName: part.tagName() });
                    break;
                case parsed_message_part_1.ParsedMessagePartType.END_TAG:
                    const closeTagName = part.tagName();
                    if (stack.length <= 1 || stack[stack.length - 1].tagName !== closeTagName) {
                        // oops, not well formed
                        throw new Error('unexpected close tag ' + closeTagName);
                    }
                    stack.pop();
                    break;
                case parsed_message_part_1.ParsedMessagePartType.EMPTY_TAG:
                    const emptyTagElem = this.createXmlRepresentationOfEmptyTagPart(part, rootElem, id++);
                    stack[stack.length - 1].element.appendChild(emptyTagElem);
                    break;
            }
        });
        if (stack.length !== 1) {
            // oops, not well closed tags
            throw new Error('missing close tag ' + stack[stack.length - 1].tagName);
        }
    }
    /**
     * the xml used for start tag in the message.
     * Returns an empty pc-Element.
     * e.g. <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">
     * Text content will be added later.
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    createXmlRepresentationOfStartTagPart(part, rootElem, id) {
        const tagMapping = new tag_mapping_1.TagMapping();
        const pcElem = rootElem.ownerDocument.createElement('pc');
        const tagName = part.tagName();
        const equivStart = tagMapping.getStartTagPlaceholderName(tagName, part.idCounter());
        const equivEnd = tagMapping.getCloseTagPlaceholderName(tagName);
        const dispStart = '<' + tagName + '>';
        const dispEnd = '</' + tagName + '>';
        pcElem.setAttribute('id', id.toString(10));
        pcElem.setAttribute('equivStart', equivStart);
        pcElem.setAttribute('equivEnd', equivEnd);
        pcElem.setAttribute('type', this.getTypeForTag(tagName));
        pcElem.setAttribute('dispStart', dispStart);
        pcElem.setAttribute('dispEnd', dispEnd);
        return pcElem;
    }
    /**
     * the xml used for end tag in the message.
     * Not used here, because content is child of start tag.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEndTagPart(part, rootElem) {
        // not used
        return null;
    }
    /**
     * the xml used for empty tag in the message.
     * Returns an empty ph-Element.
     * e.g. <ph id="3" equiv="TAG_IMG" type="image" disp="&lt;img/>"/>
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    createXmlRepresentationOfEmptyTagPart(part, rootElem, id) {
        const tagMapping = new tag_mapping_1.TagMapping();
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagName = part.tagName();
        const equiv = tagMapping.getEmptyTagPlaceholderName(tagName, part.idCounter());
        const disp = '<' + tagName + '/>';
        phElem.setAttribute('id', id.toString(10));
        phElem.setAttribute('equiv', equiv);
        phElem.setAttribute('type', this.getTypeForTag(tagName));
        phElem.setAttribute('disp', disp);
        return phElem;
    }
    getTypeForTag(tag) {
        switch (tag.toLowerCase()) {
            case 'br':
            case 'b':
            case 'i':
            case 'u':
                return 'fmt';
            case 'img':
                return 'image';
            case 'a':
                return 'link';
            default:
                return 'other';
        }
    }
    /**
     * the xml used for placeholder in the message.
     * Returns e.g. <ph id="1" equiv="INTERPOLATION_1" disp="{{total()}}"/>
     * @param part part
     * @param rootElem rootElem
     * @param id id number in xliff2
     */
    createXmlRepresentationOfPlaceholderPart(part, rootElem, id) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let equivAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            equivAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        phElem.setAttribute('id', id.toString(10));
        phElem.setAttribute('equiv', equivAttrib);
        const disp = part.disp();
        if (disp) {
            phElem.setAttribute('disp', disp);
        }
        return phElem;
    }
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfICUMessageRefPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let equivAttrib = 'ICU';
        if (part.index() > 0) {
            equivAttrib = 'ICU_' + part.index().toString(10);
        }
        phElem.setAttribute('id', part.index().toString(10));
        phElem.setAttribute('equiv', equivAttrib);
        const disp = part.disp();
        if (disp) {
            phElem.setAttribute('disp', disp);
        }
        return phElem;
    }
}
exports.Xliff2MessageParser = Xliff2MessageParser;
//# sourceMappingURL=xliff2-message-parser.js.map