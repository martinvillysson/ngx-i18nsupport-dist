"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractMessageParser = void 0;
const parsed_message_1 = require("./parsed-message");
const parsed_message_tokenizer_1 = require("./parsed-message-tokenizer");
const xmldom_1 = require("xmldom");
const util_1 = require("util");
const dom_utilities_1 = require("./dom-utilities");
const parsed_message_part_icu_message_1 = require("./parsed-message-part-icu-message");
/**
 * Created by roobm on 10.05.2017.
 * A message parser can parse the xml content of a translatable message.
 * It generates a ParsedMessage from it.
 */
class AbstractMessageParser {
    /**
     * Parse XML to ParsedMessage.
     * @param xmlElement the xml representation
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXML(xmlElement, sourceMessage) {
        const message = new parsed_message_1.ParsedMessage(this, sourceMessage);
        if (xmlElement) {
            message.setXmlRepresentation(xmlElement);
            this.addPartsOfNodeToMessage(xmlElement, message, false);
        }
        return message;
    }
    /**
     * Parse XML string to ParsedMessage.
     * @param xmlString the xml representation without root element, e.g. this is <ph x></ph> an example.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * Throws an error if normalized xml is not well formed.
     */
    createNormalizedMessageFromXMLString(xmlString, sourceMessage) {
        const doc = new xmldom_1.DOMParser().parseFromString('<dummy>' + xmlString + '</dummy>', 'text/xml');
        const xmlElement = doc.childNodes.item(0);
        return this.createNormalizedMessageFromXML(xmlElement, sourceMessage);
    }
    /**
     * recursively run through a node and add all identified parts to the message.
     * @param node node
     * @param message message to be generated.
     * @param includeSelf if true, add node by itself, otherwise only children.
     */
    addPartsOfNodeToMessage(node, message, includeSelf) {
        let processChildren = true;
        if (includeSelf) {
            if (node.nodeType === node.TEXT_NODE) {
                message.addText(node.textContent);
                return;
            }
            if (node.nodeType === node.ELEMENT_NODE) {
                processChildren = this.processStartElement(node, message);
            }
        }
        if (processChildren) {
            const icuMessageText = this.getICUMessageText(node);
            let isICU = !util_1.isNullOrUndefined(icuMessageText);
            if (isICU) {
                try {
                    message.addICUMessage(icuMessageText);
                }
                catch (error) {
                    // if it is not parsable, handle it as non ICU
                    console.log('non ICU message: ', icuMessageText, error);
                    isICU = false;
                }
            }
            if (!isICU) {
                const children = node.childNodes;
                for (let i = 0; i < children.length; i++) {
                    this.addPartsOfNodeToMessage(children.item(i), message, true);
                }
            }
        }
        if (node.nodeType === node.ELEMENT_NODE) {
            this.processEndElement(node, message);
        }
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
        const firstChild = children.item(0);
        if (firstChild.nodeType === firstChild.TEXT_NODE) {
            if (this.isICUMessageStart(firstChild.textContent)) {
                return dom_utilities_1.DOMUtilities.getXMLContent(node);
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
     * Test, wether text is beginning of ICU Message.
     * @param text text
     */
    isICUMessageStart(text) {
        return parsed_message_part_icu_message_1.ParsedMessagePartICUMessage.looksLikeICUMessage(text);
        //        return text.startsWith('{VAR_PLURAL') || text.startsWith('{VAR_SELECT');
    }
    /**
     * Parse normalized string to ParsedMessage.
     * @param normalizedString normalized string
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if normalized string is not well formed.
     */
    parseNormalizedString(normalizedString, sourceMessage) {
        const message = new parsed_message_1.ParsedMessage(this, sourceMessage);
        const openTags = [];
        let tokens;
        try {
            tokens = new parsed_message_tokenizer_1.ParsedMesageTokenizer().tokenize(normalizedString);
        }
        catch (error) {
            throw new Error(util_1.format('unexpected error while parsing message: "%s" (parsed "%")', error.message, normalizedString));
        }
        tokens.forEach((token) => {
            let disp = null;
            switch (token.type) {
                case parsed_message_tokenizer_1.TEXT:
                    message.addText(token.value.text);
                    break;
                case parsed_message_tokenizer_1.START_TAG:
                    message.addStartTag(token.value.name, token.value.idcounter);
                    openTags.push(token.value.name);
                    break;
                case parsed_message_tokenizer_1.END_TAG:
                    message.addEndTag(token.value.name);
                    if (openTags.length === 0 || openTags[openTags.length - 1] !== token.value.name) {
                        // oops, not well formed
                        throw new Error(util_1.format('unexpected close tag "%s" (parsed "%s")', token.value.name, normalizedString));
                    }
                    openTags.pop();
                    break;
                case parsed_message_tokenizer_1.EMPTY_TAG:
                    message.addEmptyTag(token.value.name, token.value.idcounter);
                    break;
                case parsed_message_tokenizer_1.PLACEHOLDER:
                    disp = (sourceMessage) ? sourceMessage.getPlaceholderDisp(token.value.idcounter) : null;
                    message.addPlaceholder(token.value.idcounter, disp);
                    break;
                case parsed_message_tokenizer_1.ICU_MESSAGE_REF:
                    disp = (sourceMessage) ? sourceMessage.getICUMessageRefDisp(token.value.idcounter) : null;
                    message.addICUMessageRef(token.value.idcounter, disp);
                    break;
                case parsed_message_tokenizer_1.ICU_MESSAGE:
                    throw new Error(util_1.format('<ICUMessage/> not allowed here, use parseICUMessage instead (parsed "%")', normalizedString));
                default:
                    break;
            }
        });
        if (openTags.length > 0) {
            // oops, not well closed tags
            throw new Error(util_1.format('missing close tag "%s" (parsed "%s")', openTags[openTags.length - 1], normalizedString));
        }
        message.setXmlRepresentation(this.createXmlRepresentation(message));
        return message;
    }
    /**
     * Parse a string, that is an ICU message, to ParsedMessage.
     * @param icuMessageString the message, like '{x, plural, =0 {nothing} =1 {one} other {many}}'.
     * @param sourceMessage optional original message that will be translated by normalized new one
     * @return a new parsed message.
     * Throws an error if icuMessageString has not the correct syntax.
     */
    parseICUMessage(icuMessageString, sourceMessage) {
        const message = new parsed_message_1.ParsedMessage(this, sourceMessage);
        message.addICUMessage(icuMessageString);
        return message;
    }
    /**
     * Helper function: Parse ID from a name.
     * name optionally ends with _<number>. This is the idcount.
     * E.g. name="TAG_IMG" returns 0
     * name = "TAG_IMG_1" returns 1
     * @param name name
     * @return id count
     */
    parseIdCountFromName(name) {
        const regex = /.*_([0-9]*)/;
        const match = regex.exec(name);
        if (util_1.isNullOrUndefined(match) || match[1] === '') {
            return 0;
        }
        else {
            const num = match[1];
            return parseInt(num, 10);
        }
    }
    /**
     * Create the native xml for a message.
     * Parts are already set here.
     * @param message message
     */
    createXmlRepresentation(message) {
        const root = new xmldom_1.DOMParser().parseFromString('<dummy/>', 'text/xml');
        const rootElem = root.getElementsByTagName('dummy').item(0);
        this.addXmlRepresentationToRoot(message, rootElem);
        return rootElem;
    }
    createXmlRepresentationOfTextPart(part, rootElem) {
        return rootElem.ownerDocument.createTextNode(part.asDisplayString());
    }
}
exports.AbstractMessageParser = AbstractMessageParser;
//# sourceMappingURL=abstract-message-parser.js.map