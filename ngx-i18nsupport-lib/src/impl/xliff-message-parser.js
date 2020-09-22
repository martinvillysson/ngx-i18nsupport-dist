"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XliffMessageParser = void 0;
const abstract_message_parser_1 = require("./abstract-message-parser");
const tag_mapping_1 = require("./tag-mapping");
const parsed_message_part_1 = require("./parsed-message-part");
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XLIFF 1.2
 */
class XliffMessageParser extends abstract_message_parser_1.AbstractMessageParser {
    /**
     * Handle this element node.
     * This is called before the children are done.
     * @param elementNode elementNode
     * @param message message to be altered
     * @return true, if children should be processed too, false otherwise (children ignored then)
     */
    processStartElement(elementNode, message) {
        const tagName = elementNode.tagName;
        const tagMapping = new tag_mapping_1.TagMapping();
        if (tagName === 'x') {
            // placeholder are like <x id="INTERPOLATION"/> or <x id="INTERPOLATION_1">
            const id = elementNode.getAttribute('id');
            if (!id) {
                return; // should not happen
            }
            if (id.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromId(id);
                message.addPlaceholder(index, null);
            }
            else if (id.startsWith('ICU')) {
                const index = this.parseICUMessageRefIndexFromId(id);
                message.addICUMessageRef(index, null);
            }
            else if (id.startsWith('START_')) {
                const normalizedTagName = tagMapping.getTagnameFromStartTagPlaceholderName(id);
                if (normalizedTagName) {
                    const idcount = this.parseIdCountFromName(id);
                    message.addStartTag(normalizedTagName, idcount);
                }
            }
            else if (id.startsWith('CLOSE_')) {
                const normalizedTagName = tagMapping.getTagnameFromCloseTagPlaceholderName(id);
                if (normalizedTagName) {
                    message.addEndTag(normalizedTagName);
                }
            }
            else if (tagMapping.isEmptyTagPlaceholderName(id)) {
                const normalizedTagName = tagMapping.getTagnameFromEmptyTagPlaceholderName(id);
                if (normalizedTagName) {
                    const idcount = this.parseIdCountFromName(id);
                    message.addEmptyTag(normalizedTagName, idcount);
                }
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
    }
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param id id
     * @return index
     */
    parsePlaceholderIndexFromId(id) {
        let indexString = '';
        if (id === 'INTERPOLATION') {
            indexString = '0';
        }
        else {
            indexString = id.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    /**
     * Parse id attribute of x element as placeholder index.
     * id can be "INTERPOLATION" or "INTERPOLATION_n"
     * @param id id
     * @return id as number
     */
    parseICUMessageRefIndexFromId(id) {
        let indexString = '';
        if (id === 'ICU') {
            indexString = '0';
        }
        else {
            indexString = id.substring('ICU_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    addXmlRepresentationToRoot(message, rootElem) {
        message.parts().forEach((part) => {
            let child;
            switch (part.type) {
                case parsed_message_part_1.ParsedMessagePartType.TEXT:
                    child = this.createXmlRepresentationOfTextPart(part, rootElem);
                    break;
                case parsed_message_part_1.ParsedMessagePartType.START_TAG:
                    child = this.createXmlRepresentationOfStartTagPart(part, rootElem);
                    break;
                case parsed_message_part_1.ParsedMessagePartType.END_TAG:
                    child = this.createXmlRepresentationOfEndTagPart(part, rootElem);
                    break;
                case parsed_message_part_1.ParsedMessagePartType.EMPTY_TAG:
                    child = this.createXmlRepresentationOfEmptyTagPart(part, rootElem);
                    break;
                case parsed_message_part_1.ParsedMessagePartType.PLACEHOLDER:
                    child = this.createXmlRepresentationOfPlaceholderPart(part, rootElem);
                    break;
                case parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF:
                    child = this.createXmlRepresentationOfICUMessageRefPart(part, rootElem);
                    break;
            }
            if (child) {
                rootElem.appendChild(child);
            }
        });
    }
    /**
     * the xml used for start tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfStartTagPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new tag_mapping_1.TagMapping();
        const idAttrib = tagMapping.getStartTagPlaceholderName(part.tagName(), part.idCounter());
        const ctypeAttrib = tagMapping.getCtypeForTag(part.tagName());
        const equivTextAttr = '<' + part.tagName() + '>';
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        xElem.setAttribute('equiv-text', equivTextAttr);
        return xElem;
    }
    /**
     * the xml used for end tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEndTagPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new tag_mapping_1.TagMapping();
        const idAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
        const ctypeAttrib = 'x-' + part.tagName();
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        return xElem;
    }
    /**
     * the xml used for empty tag in the message.
     * Returns an empty <x/>-Element with attributes id and ctype
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEmptyTagPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        const tagMapping = new tag_mapping_1.TagMapping();
        const idAttrib = tagMapping.getEmptyTagPlaceholderName(part.tagName(), part.idCounter());
        const ctypeAttrib = tagMapping.getCtypeForTag(part.tagName());
        const equivTextAttr = '<' + part.tagName() + '/>';
        xElem.setAttribute('id', idAttrib);
        xElem.setAttribute('ctype', ctypeAttrib);
        xElem.setAttribute('equiv-text', equivTextAttr);
        return xElem;
    }
    /**
     * the xml used for placeholder in the message.
     * Returns an empty <x/>-Element with attribute id="INTERPOLATION" or id="INTERPOLATION_n"
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfPlaceholderPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        let idAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            idAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        const equivTextAttr = part.disp();
        xElem.setAttribute('id', idAttrib);
        if (equivTextAttr) {
            xElem.setAttribute('equiv-text', equivTextAttr);
        }
        return xElem;
    }
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfICUMessageRefPart(part, rootElem) {
        const xElem = rootElem.ownerDocument.createElement('x');
        let idAttrib = 'ICU';
        if (part.index() > 0) {
            idAttrib = 'ICU_' + part.index().toString(10);
        }
        xElem.setAttribute('id', idAttrib);
        return xElem;
    }
}
exports.XliffMessageParser = XliffMessageParser;
//# sourceMappingURL=xliff-message-parser.js.map