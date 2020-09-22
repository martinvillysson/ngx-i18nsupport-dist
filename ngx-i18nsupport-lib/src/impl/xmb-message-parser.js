"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmbMessageParser = void 0;
const abstract_message_parser_1 = require("./abstract-message-parser");
const dom_utilities_1 = require("./dom-utilities");
const tag_mapping_1 = require("./tag-mapping");
const parsed_message_part_1 = require("./parsed-message-part");
/**
 * Created by roobm on 10.05.2017.
 * A message parser for XMB
 */
class XmbMessageParser extends abstract_message_parser_1.AbstractMessageParser {
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
            // There are 4 different usages of ph element:
            // 1. placeholders are like <ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph>
            // or <ph name="INTERPOLATION_1"><ex>INTERPOLATION_1</ex></ph>
            // 2. start tags:
            // <ph name="START_LINK"><ex>&lt;a&gt;</ex></ph>
            // 3. empty tags:
            // <ph name="TAG_IMG"><ex>&lt;img&gt;</ex></ph>
            // 4. ICU:
            // <ph name="ICU"><ex>ICU</ex></ph>
            const name = elementNode.getAttribute('name');
            if (!name) {
                return true; // should not happen
            }
            if (name.startsWith('INTERPOLATION')) {
                const index = this.parsePlaceholderIndexFromName(name);
                message.addPlaceholder(index, null);
                return false; // ignore children
            }
            else if (name.startsWith('START_')) {
                const tag = this.parseTagnameFromPhElement(elementNode);
                const idcounter = this.parseIdCountFromName(name);
                if (tag) {
                    message.addStartTag(tag, idcounter);
                }
                return false; // ignore children
            }
            else if (name.startsWith('CLOSE_')) {
                const tag = this.parseTagnameFromPhElement(elementNode);
                if (tag) {
                    message.addEndTag(tag);
                }
                return false; // ignore children
            }
            else if (new tag_mapping_1.TagMapping().isEmptyTagPlaceholderName(name)) {
                const emptyTagName = new tag_mapping_1.TagMapping().getTagnameFromEmptyTagPlaceholderName(name);
                const idcounter = this.parseIdCountFromName(name);
                message.addEmptyTag(emptyTagName, idcounter);
                return false; // ignore children
            }
            else if (name.startsWith('ICU')) {
                const index = this.parseICUMessageIndexFromName(name);
                message.addICUMessageRef(index, null);
                return false; // ignore children
            }
        }
        else if (tagName === 'source') {
            // ignore source
            return false;
        }
        return true;
    }
    /**
     * Return the ICU message content of the node, if it is an ICU Message.
     * @param node node
     * @return message or null, if it is no ICU Message.
     */
    getICUMessageText(node) {
        const children = node.childNodes;
        if (children.length === 0) {
            return null;
        }
        let firstChild = null;
        // find first child that is no source element.
        let i;
        for (i = 0; i < children.length; i++) {
            const child = children.item(i);
            if (child.nodeType !== child.ELEMENT_NODE || child.tagName !== 'source') {
                firstChild = child;
                break;
            }
        }
        if (firstChild && firstChild.nodeType === firstChild.TEXT_NODE) {
            if (this.isICUMessageStart(firstChild.textContent)) {
                const messageText = dom_utilities_1.DOMUtilities.getXMLContent(node);
                if (i > 0) {
                    // drop <source> elements
                    const reSource = new RegExp('<source[^>]*>.*</source>', 'g');
                    return messageText.replace(reSource, '');
                }
                else {
                    return messageText;
                }
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
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
     * @param name name
     * @return id as number
     */
    parsePlaceholderIndexFromName(name) {
        let indexString = '';
        if (name === 'INTERPOLATION') {
            indexString = '0';
        }
        else {
            indexString = name.substring('INTERPOLATION_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    /**
     * Parse id attribute of x element as ICU message ref index.
     * id can be "ICU" or "ICU_n"
     * @param name name
     * @return id as number
     */
    parseICUMessageIndexFromName(name) {
        let indexString = '';
        if (name === 'ICU') {
            indexString = '0';
        }
        else {
            indexString = name.substring('ICU_'.length);
        }
        return Number.parseInt(indexString, 10);
    }
    /**
     * Parse the tag name from a ph element.
     * It contained in the <ex> subelements value and enclosed in <>.
     * Example: <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>
     * @param phElement phElement
     */
    parseTagnameFromPhElement(phElement) {
        const exElement = dom_utilities_1.DOMUtilities.getFirstElementByTagName(phElement, 'ex');
        if (exElement) {
            const value = dom_utilities_1.DOMUtilities.getPCDATA(exElement);
            if (!value || !value.startsWith('<') || !value.endsWith('>')) {
                // oops
                return null;
            }
            if (value.charAt(1) === '/') {
                return value.substring(2, value.length - 1);
            }
            else {
                return value.substring(1, value.length - 1);
            }
        }
        else {
            return null;
        }
    }
    addXmlRepresentationToRoot(message, rootElem) {
        message.parts().forEach((part) => {
            const child = this.createXmlRepresentationOfPart(part, rootElem);
            if (child) {
                rootElem.appendChild(child);
            }
        });
    }
    createXmlRepresentationOfPart(part, rootElem) {
        switch (part.type) {
            case parsed_message_part_1.ParsedMessagePartType.TEXT:
                return this.createXmlRepresentationOfTextPart(part, rootElem);
            case parsed_message_part_1.ParsedMessagePartType.START_TAG:
                return this.createXmlRepresentationOfStartTagPart(part, rootElem);
            case parsed_message_part_1.ParsedMessagePartType.END_TAG:
                return this.createXmlRepresentationOfEndTagPart(part, rootElem);
            case parsed_message_part_1.ParsedMessagePartType.EMPTY_TAG:
                return this.createXmlRepresentationOfEmptyTagPart(part, rootElem);
            case parsed_message_part_1.ParsedMessagePartType.PLACEHOLDER:
                return this.createXmlRepresentationOfPlaceholderPart(part, rootElem);
            case parsed_message_part_1.ParsedMessagePartType.ICU_MESSAGE_REF:
                return this.createXmlRepresentationOfICUMessageRefPart(part, rootElem);
        }
    }
    /**
     * the xml used for start tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfStartTagPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new tag_mapping_1.TagMapping();
        const nameAttrib = tagMapping.getStartTagPlaceholderName(part.tagName(), part.idCounter());
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for end tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEndTagPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new tag_mapping_1.TagMapping();
        const nameAttrib = tagMapping.getCloseTagPlaceholderName(part.tagName());
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('</' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for empty tag in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfEmptyTagPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        const tagMapping = new tag_mapping_1.TagMapping();
        const nameAttrib = tagMapping.getEmptyTagPlaceholderName(part.tagName(), part.idCounter());
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode('<' + part.tagName() + '>'));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for placeholder in the message.
     * Returns an <ph>-Element with attribute name and subelement ex
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfPlaceholderPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let nameAttrib = 'INTERPOLATION';
        if (part.index() > 0) {
            nameAttrib = 'INTERPOLATION_' + part.index().toString(10);
        }
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
        phElem.appendChild(exElem);
        return phElem;
    }
    /**
     * the xml used for icu message refs in the message.
     * @param part part
     * @param rootElem rootElem
     */
    createXmlRepresentationOfICUMessageRefPart(part, rootElem) {
        const phElem = rootElem.ownerDocument.createElement('ph');
        let nameAttrib = 'ICU';
        if (part.index() > 0) {
            nameAttrib = 'ICU_' + part.index().toString(10);
        }
        phElem.setAttribute('name', nameAttrib);
        const exElem = rootElem.ownerDocument.createElement('ex');
        exElem.appendChild(rootElem.ownerDocument.createTextNode(nameAttrib));
        phElem.appendChild(exElem);
        return phElem;
    }
}
exports.XmbMessageParser = XmbMessageParser;
//# sourceMappingURL=xmb-message-parser.js.map